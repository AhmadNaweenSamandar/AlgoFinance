import pandas as pd
import joblib
import re
import os

# --- 1. GLOBAL LOADING (Runs once at startup) ---
MODEL_PATH = "src/models/transaction_classifier.pkl"
ml_pipeline = None

if os.path.exists(MODEL_PATH):
    print("ML Model found. Loading...")
    ml_pipeline = joblib.load(MODEL_PATH)
else:
    print("Warning: No ML model found. Running in Rule-Only mode.")


def predict_categories(df: pd.DataFrame) -> pd.DataFrame:
    """
    Takes a DataFrame of transactions and adds a 'category' column.
    Starts with rule-based logic (fast & accurate for common items).

    """
    # Basic Rules (The "Heuristic Model")
    # This is faster and 100% accurate for known vendors compared to AI.
    # Brain of the model, the code look at description and assign category based on keywords.
    # for other the app will use the ML model to predict the category based on description.
    rules = {
        "Income": [
            "deposit",
            "payroll",
            "employer",
            "gst canada",
            "thecatholicce",
            "benefit",
            "e-transfer received",
            "misc payment amazon holdings",
            "misc payment uber holdings" "Prov/localGovPayment",
            "payment" "prov/local gvt payment",
        ],
        "Food & Groceries": [
            "costco",
            "loblaws",
            "metro",
            "starbucks",
            "mcdonalds",
            "tim hortons",
            "walmart",
            "sobeys",
            "pizza",
        ],
        "Transport": ["lyft", "presto", "gas", "shell", "petro", "transit"],
        "Bills & Utilities": [
            "insurance",
            "aviva",
            "hydro",
            "rogers",
            "bell",
            "fido",
            "koodo",
        ],
        "Debt & Loans": ["loanpayment", "studentloan", "student loan", "mortgage"],
        "Entertainment & Shopping": [
            "amazon.ca",
            "amazon.com",
            "netflix",
            "spotify",
            "cineplex",
            "apple",
            "prime",
        ],
        "Transfers & Cash": [
            "atm",
            "e-Transfersent",
            "online banking transfer",
            "withdrawal",
            "e-transfer",
        ],
    }

    # 1. Normalize the description for matching (lowercase)
    # Ensure dataframe has a column for description.
    # If users upload differnt files, we might need to find the right column dynamically later.
    # For now, the column is named 'description'

    # flexible column search
    desc_col = next(
        (col for col in df.columns if "desc" in col or "narrative" in col), None
    )

    if not desc_col:
        # Fallback: Just return as is if we can't find description
        df["category"] = "Uncategorized"
        return df

    def categorize_row(row):
        # Ensure we work with string, even if pandas thinks it's an object
        desc = str(row["description"]).lower()

        # --- LAYER 1: RULES (Fast & Precise) ---
        for category, keywords in rules.items():
            for keyword in keywords:
                if keyword in desc:
                    return category  # Stop here if rule matches

        # --- LAYER 2: ML MODEL ---
        # Only runs if Layer 1 returned nothing
        if ml_pipeline:
            try:
                # The model expects a list/iterable, so we wrap desc in []
                # It returns an array of predictions, we take the first one [0]
                prediction = ml_pipeline.predict([desc])[0]
                return prediction
            except Exception as e:
                # If model fails, default to 'Other'
                return "Other"

        return "Other"

    # 3. Apply the logic
    df["category"] = df.apply(categorize_row, axis=1)
    return df
