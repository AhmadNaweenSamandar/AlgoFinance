from fastapi import APIRouter, UploadFile, File, HTTPException
# Importing service function from pdf_parser module 
from src.service.pdf_parser import extract_data_from_file 

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
        # 2. Calling the "Engine" (Service)
        # We use 'await' because file reading is an I/O operation
        data = await extract_data_from_file(file)
        
        # 3. Format the response
        # If service returns a Pandas DataFrame, we must convert it to JSON-friendly dict
        # If service already returns a list, you can skip .to_dict()
        if hasattr(data, "to_dict"):
            response_data = data.to_dict(orient="records")
        else:
            response_data = data

        return {
            "status": "success", 
            "filename": file.filename,
            "total_transactions": len(response_data),
            "data": response_data
        }

    except Exception as e:
        # Log the error internally here (print(e)) 
        # but return a clean error message to the frontend
        print(f"Error processing file: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing the file.")