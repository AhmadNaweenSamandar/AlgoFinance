import pandas as pd
from fastapi import UploadFile
import numpy as np
from io import BytesIO

#function to extract data from uploaded files
async def extract_data_from_file(file: UploadFile) -> pd.DataFrame:
    """
    Service to determine file type and extract text into a structured DataFrame.
    """
    filename = file.filename.lower()
    contents = await file.read()
    
    if filename.endswith('.csv'):
        # Pandas read CSVs directly
        df = pd.read_csv(BytesIO(contents))
        
    elif filename.endswith('.xlsx'):
        # Pandas can read Excel directly
       df = pd.read_excel(BytesIO(contents))
        
    else:
        # TODO: Implement PDF logic later
        raise ValueError("Unsupported file type. Please upload CSV or Excel.")
    
    # Basic cleaning (normalizing column names!)
    # Clean column names
    df.columns = [str(c).lower().strip() for c in df.columns]

    # --- THE FIX: SANITIZE DATA FOR JSON ---
    # This replaces all NaN (Not a Number) values with None (which becomes JSON null)
    df = df.replace({np.nan: None})
    
    return df