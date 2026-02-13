from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import math
import numpy as np

# Adjust these imports to match your actual folder structure (src vs app)
from src.services.pdf_parser import extract_data_from_file
from src.services.analytics import generate_dashboard_data
from src.services.normalizer import normalize_financial_data
from src.services.ml_model import predict_categories
from app.services.chat_service import process_data_for_chat, ask_financial_question


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
    if not file.filename.endswith((".xlsx", ".csv", ".pdf")):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload .xlsx, .csv, or .pdf",
        )

    try:
        # 1. Ingest
        raw_df = await extract_data_from_file(file)

        # 2. Normalize
        clean_df = normalize_financial_data(raw_df)

        # 3. Categorize
        enriched_df = predict_categories(clean_df)

        # 4. Analytics
        dashboard_data = generate_dashboard_data(enriched_df)

        # 5. Prepare Transaction List (WITHOUT mutating enriched_df)
        # We use .assign() to create a temporary copy with string dates just for the JSON response
        transactions_list = enriched_df.assign(
            date=enriched_df["date"].astype(str)
        ).to_dict(orient="records")

        # 6. Process for Chatbot (Create the "Brain")
        # We do this BEFORE returning, and we pass the ORIGINAL enriched_df (with Timestamp objects)
        try:
            process_data_for_chat(enriched_df)
        except Exception as e:
            print(f"Chatbot Indexing Failed: {e}")

        # 7. Final Response Construction
        raw_response = {
            "status": "success",
            "summary": dashboard_data["summary"],
            "overview": dashboard_data["overview"],
            "transactions": transactions_list,
            "insights": dashboard_data["insights"],
        }

        # 8. Sanitize and Return
        return recursive_clean(raw_response)

    except Exception as e:
        print(f"Error processing file: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- NEW ENDPOINT FOR CHAT ---
@router.post("/chat")
async def chat_with_finance(request: ChatRequest):
    """
    Endpoint for the Chat Interface.
    """
    try:  # <--- Indentation fixed here
        answer = ask_financial_question(request.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
