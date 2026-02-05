import pandas as pd
from fastapi import UploadFile

#function to extract data from uploaded files
async def extract_data_from_file(file: UploadFile) -> pd.DataFrame:
    """
    Service to determine file type and extract text into a structured DataFrame.
    """
    filename = file.filename.lower()
    
    if filename.endswith('.csv'):
        # Pandas read CSVs directly
        df = pd.read_csv(file.file)
        
    elif filename.endswith('.xlsx'):
        # Pandas can read Excel directly
        df = pd.read_excel(file.file)
        
    else:
        # TODO: Implement PDF logic later
        raise ValueError("Unsupported file type. Please upload CSV or Excel.")
    
    # Basic cleaning (normalizing column names!)
    df.columns = [c.lower().strip() for c in df.columns]
    
    return df