import pandas as pd
import re

def predict_categories(df: pd.DataFrame) -> pd.DataFrame:
    """
    Takes a DataFrame of transactions and adds a 'category' column.
    Starts with rule-based logic (fast & accurate for common items).
    """
    
    # 1. Normalize the description for matching (lowercase)
    # Ensure dataframe has a column for description. 
    # If users upload differnt files, we might need to find the right column dynamically later.
    # For now, the column is named 'description'
    
    # flexible column search
    desc_col = next((col for col in df.columns if 'desc' in col or 'narrative' in col), None)
    
    if not desc_col:
        # Fallback: Just return as is if we can't find description
        df['category'] = 'Uncategorized'
        return df

    # 2. Define Basic Rules (The "Heuristic Model")
    # This is often faster and 100% accurate for known vendors compared to AI.
    # Brain of the model, the code look at description and assign category based on keywords.
    rules = {
        "Income": ["deposit", "payroll", "employer", "e-transfer received"],
        "Savings": ["transfer to sav", "savings", "auto-save", "contribution"],
        "Transport": ["uber", "lyft", "presto", "gas", "shell"],
        "Food": ["starbucks", "mcdonalds", "metro", "loblaws"],
        "Utilities": ["hydro", "rogers", "bell"],
        "Entertainment": ["netflix", "spotify", "cineplex"],
    }

    def categorize_row(row):
        desc = str(row[desc_col]).lower()
        
        for category, keywords in rules.items():
            for keyword in keywords:
                if keyword in desc:
                    return category.title() # e.g., "Transport"
        
        return "Other" # Default class

    # 3. Apply the logic
    df['category'] = df.apply(categorize_row, axis=1)
    
    return df