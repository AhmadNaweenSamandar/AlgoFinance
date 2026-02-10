import pandas as pd
from fastapi import UploadFile
import numpy as np
from io import BytesIO
import pdfplumber

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
                        # Filter out empty rows immediately
                        cleaned_table = [row for row in table if row and any(row)]
                        all_rows.extend(cleaned_table)
            
            if not all_rows:
                raise ValueError("Could not extract any table from this PDF.")

            # --- HEADER HUNTER LOGIC (CRITICAL FIX) ---
            # We look for the row that contains keywords like "Date", "Description", "Amount"
            header_index = -1
            found_header = False

            # Common headers we expect to see
            target_keywords = {'date', 'description', 'details', 'amount', 'debit', 'credit', 'payment', 'withdrawal'}

            # Scan the first 10 rows (Headers usually aren't lower than that)
            for i, row in enumerate(all_rows[:10]):
                # Convert row to lowercase set for fast matching
                row_text = set(str(cell).lower() for cell in row if cell)
                
                # If we find at least 2 keywords (e.g., "Date" and "Amount"), we found the header!
                if len(row_text.intersection(target_keywords)) >= 2:
                    header_index = i
                    found_header = True
                    break
            
            if not found_header:
                # Fallback: Assume the first row is the header if we can't find one
                header_index = 0

            
            # Create DataFrame starting from the identified header row
            headers = all_rows[header_index]
            data = all_rows[header_index + 1:]
            
            df = pd.DataFrame(data, columns=headers)
    
    else:
        raise ValueError("Unsupported file type")

            # Create DataFrame
            # We assume the first row found was the header, or we use generic names
            df = pd.DataFrame(all_rows[1:], columns=all_rows[0])
    
    # Basic Cleanup for Normalizer
    # Ensure all columns are strings (sometimes pdfplumber extracts None as header)
    df.columns = [str(c).lower().strip() for c in df.columns]
    
    # Drop rows where ALL columns are None (empty/spacer rows)
    df.dropna(how='all', inplace=True)
    
    return df