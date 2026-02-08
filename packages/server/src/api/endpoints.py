from fastapi import APIRouter, UploadFile, File, HTTPException
# Importing service function from pdf_parser module 
from src.service.pdf_parser import extract_data_from_file
#import dashboard data generator from analytics module
from app.services.analytics import generate_dashboard_data

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