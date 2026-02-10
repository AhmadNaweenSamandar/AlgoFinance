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

       
        # --- NEW PDF LOGIC ---
    elif filename.endswith('.pdf'):
        # We need to save the bytes to a temporary file because pdfplumber expects a path or file-like object
        with pdfplumber.open(BytesIO(contents)) as pdf:
            all_rows = []
            
            # Iterate through every page of the bank statement
            for page in pdf.pages:
                # extract_table() attempts to find the largest table on the page
                table = page.extract_table()
                
                if table:
                    # Filter out empty rows or headers repeated on every page
                    for row in table:
                        # Logic: A valid transaction row usually has a Date (first column) and an Amount
                        # We simply collect everything now and clean it later in the Normalizer
                        if row and any(row): 
                            all_rows.append(row)
            
            if not all_rows:
                raise ValueError("Could not extract any table from this PDF.")

            # Create DataFrame
            # We assume the first row found was the header, or we use generic names
            df = pd.DataFrame(all_rows[1:], columns=all_rows[0])
    
    # Basic cleaning (normalizing column names!)
    # Clean column names
    df.columns = [str(c).lower().strip() for c in df.columns]

    # --- THE FIX: SANITIZE DATA FOR JSON ---
    # This replaces all NaN (Not a Number) values with None (which becomes JSON null)
    df = df.replace({np.nan: None})
    
    return df