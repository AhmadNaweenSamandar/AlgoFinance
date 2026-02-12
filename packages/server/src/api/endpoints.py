from fastapi import APIRouter, UploadFile, File, HTTPException
# Importing service function from pdf_parser module 
from src.services.pdf_parser import extract_data_from_file
#import dashboard data generator from analytics module
from src.services.analytics import generate_dashboard_data
#import normalizer function from normalizer module
from src.services.normalizer import normalize_financial_data
#import categorization function from ml module
from src.services.ml_model import predict_categories
import numpy as np
import math
#import chat service functions
from app.services.chat_service import process_data_for_chat, ask_financial_question 
from pydantic import BaseModel

# Schema for the question
class ChatRequest(BaseModel):
    question: str


def recursive_clean(obj):
    """
    Recursively walks through a dictionary or list.
    Replaces NaN/Infinity with None (which becomes null in JSON) or 0.
    """
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return 0.0  # Force bad numbers to be 0
    elif isinstance(obj, dict):
        return {k: recursive_clean(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [recursive_clean(v) for v in obj]
    return obj



router = APIRouter()

@router.post("/upload-statement")
async def upload_financial_statement(file: UploadFile = File(...)):
    """
    Endpoint to accept a financial file (PDF/Excel), 
    process it, and return the raw data as JSON.
    """
    # 1. Validation (validating inputs)
    # if the file is not ending with .xlsx, .csv, or .pdf, reject it
    if not file.filename.endswith(('.xlsx', '.csv', '.pdf')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload .xlsx, .csv, or .pdf")

    try:
        # 1. Calling the "Engine" (Service)
        # ingest and extract data from the uploaded file
        raw_df = await extract_data_from_file(file)

        # 2. Normalization
        clean_df = normalize_financial_data(raw_df)

        # 3. Categorization (ML) 
        enriched_df = predict_categories(clean_df)

        # 4. Analytics (Generate logic for all sections)
        dashboard_data = generate_dashboard_data(enriched_df)
        
        # 5. Prepare Transaction List (Transaction Section of Frontend)
        # Convert Timestamp to string for JSON
        enriched_df['date'] = enriched_df['date'].astype(str)
        transactions_list = enriched_df.to_dict(orient="records")

        # # --- THE SAFETY FIX START ---
        
        # # Step A: Convert timestamps to strings (JSON can't read Timestamp objects)
        # if 'date' in enriched_df.columns:
        #     enriched_df['date'] = enriched_df['date'].astype(str)
            
        # # Step B: The "Nuclear Option" for NaNs
        # # This replaces ALL NaNs (in descriptions, amounts, categories) with None (JSON null)
        # enriched_df = enriched_df.replace({np.nan: None})
        
        # # Step C: Sanitize the Analytics Data too
        # # Sometimes 'saving_rate' can be NaN if division by zero occurred weirdly
        # import math
        # def clean_float(val):
        #     if isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
        #         return 0.0
        #     return val

        # # Clean the summary dictionary
        # dashboard_data['summary'] = {k: clean_float(v) for k, v in dashboard_data['summary'].items()}
        
        # # --- THE SAFETY FIX END ---

        raw_response = {
            "status": "success",
            "summary": dashboard_data['summary'],       # Section 1
            "overview": dashboard_data['overview'],     # Section 2
            "transactions": transactions_list,          # Section 3
            "insights": dashboard_data['insights']      # Section 4
        }

        # --- THE FIX: SANITIZE EVERYTHING ---
        # This guarantees NO NaNs survive, whether they are in the list OR the summary
        final_response = recursive_clean(raw_response)


        # -------------------------------------------------
        # 4. Process for Chatbot (Create the "Brain")
        # We do this in the background so the user can start chatting immediately
        try:
            process_data_for_chat(enriched_df)
        except Exception as e:
            print(f"Chatbot Indexing Failed: {e}")
        # -------------------------------------------------
        return final_response

    except Exception as e:
        # Log the error internally here (print(e)) 
        # but return a clean error message to the frontend
        print(f"Server Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))