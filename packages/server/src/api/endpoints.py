from fastapi import APIRouter, UploadFile, File, HTTPException
# Importing service function from pdf_parser module 
from src.services.pdf_parser import extract_data_from_file
#import dashboard data generator from analytics module
from src.services.analytics import generate_dashboard_data
#import normalizer function from normalizer module
from src.services.normalizer import normalize_financial_data
#import categorization function from ml module
from src.services.ml_model import predict_categories

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

        # --- THE SAFETY FIX START ---
        
        # Step A: Convert timestamps to strings (JSON can't read Timestamp objects)
        if 'date' in enriched_df.columns:
            enriched_df['date'] = enriched_df['date'].astype(str)
            
        # Step B: The "Nuclear Option" for NaNs
        # This replaces ALL NaNs (in descriptions, amounts, categories) with None (JSON null)
        enriched_df = enriched_df.replace({np.nan: None})
        
        # Step C: Sanitize the Analytics Data too
        # Sometimes 'saving_rate' can be NaN if division by zero occurred weirdly
        import math
        def clean_float(val):
            if isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
                return 0.0
            return val

        # Clean the summary dictionary
        dashboard_data['summary'] = {k: clean_float(v) for k, v in dashboard_data['summary'].items()}
        
        # --- THE SAFETY FIX END ---

        return {
            "status": "success",
            "summary": dashboard_data['summary'],       # Section 1
            "overview": dashboard_data['overview'],     # Section 2
            "transactions": transactions_list,          # Section 3
            "insights": dashboard_data['insights']      # Section 4
        }

    except Exception as e:
        # Log the error internally here (print(e)) 
        # but return a clean error message to the frontend
        print(f"Error processing file: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing the file.")