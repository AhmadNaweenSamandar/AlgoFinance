import pandas as pd
import numpy as np

def normalize_financial_data(df: pd.DataFrame) -> pd.DataFrame:
    # 1. Standardize columns: remove any extra spaces, convert to lowercase, and replace underscores/hyphens with spaces
    df.columns = [str(c).lower().strip().replace("_", " ").replace("-", " ") for c in df.columns]
    
    # 2. cols is a list of the cleaned column names, which we will use to identify the format of the bank statement
    cols = df.columns
    
    # --- CASE A: The "Split" Format (Withdrawals & Deposits) ---
    # Common in: TD, RBC, BMO
    if any(c in cols for c in ['withdrawals', 'payments', 'debit']) and \
       any(c in cols for c in ['deposits', 'credit']):
        
        # Find the specific column names dynamically
        debit_col = next(c for c in cols if c in ['withdrawals', 'payments', 'debit'])
        credit_col = next(c for c in cols if c in ['deposits', 'credit'])
        
        # Create one signed 'amount' column by treating withdrawals as negative and deposits as positive
        # Fill NaN with 0 because a row usually has either a deposit OR a withdrawal, not both
        df['amount'] = df[credit_col].fillna(0) - df[debit_col].fillna(0)

    # --- CASE B: The "Transaction Amount" Format (Pre-Tax/Tax included) ---
    # Common in: Credit Cards, some modern banks
    elif 'trans amount' in cols:
        df.rename(columns={'trans amount': 'amount'}, inplace=True)
        
    # --- CASE C: The Standard "Amount" Format ---
    elif 'amount' in cols:
        # Some banks use ( ) for negatives, or negative signs. 
        # Ensure it's treated as a float
        pass 
        
    else:
        raise ValueError("Could not find Amount, Withdrawals, or Trans Amount columns.")

    # 3. Standardize Date and Description
    # (Same logic as before, just adding specific column names)
    date_col = next((c for c in cols if 'date' in c and 'post' not in c), 'date') # Prefer 'Date' over 'Posting Date'
    desc_col = next((c for c in cols if c in ['description', 'merchant', 'narrative']), 'description')

    df = df.rename(columns={date_col: 'date', desc_col: 'description'})

    # 4. Clean and Return
    final_df = df[['date', 'description', 'amount']].copy()
    
    # Coerce Amount to Numeric (handle errors if bank used "$1,000.00" strings)
    final_df['amount'] = final_df['amount'].replace('[\$,]', '', regex=True).astype(float)
    
    return final_df