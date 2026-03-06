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
    # --- LAYER 1: RULES (Order matters! Top rules win first) ---
    rules = {
        "Income": [
            "miscpayment",  # Catches "misc payment uber" BEFORE it hits Transport!
            "deposit",
            "payroll",
            "employer",
            "thecatholicce",
        ],
        "Food": [
            "costco",
            "loblaws",
            "metro",
            "tim hortons",
            "walmart",
        ],
        "Benefits": [
            "gst canada",
            "prov/local gst payment",
            "benefit",
        ],
        "Dinning": [
            "sobeys",
            "mcdonalds",
            "pizza",
        ],
        "Transport": [
            "uber",  # If it was a misc payment, it already returned Income. If it reaches here, it's a ride!
            "lyft",
            "presto",
            "gas",
            "shell",
            "petro",
            "transit",
        ],
        "Bills": [
            "insurance",
            "aviva",
            "hydro",
            "rogers",
            "bell",
            "fido",
            "koodo",
        ],
        "Utilities": [
            "hydro",
            "enbridge",
            "enercare",
        ],
        "Loans": [
            "loan payment",
            "studentloan",
            "student loan",
            "mortgage",
            "loan canada gvt",
        ],
        "Entertainment": [
            "netflix",
            "spotify",
            "cineplex",
            "prime",
        ],
        "Shopping": [
            "amazon",
            "bestbuy",
            "walmart",
            "apple",
        ],
        "Transfers": [
            "e-transfersent",
            "onlinebankingtransfer",
            "withdrawal",
            "e-transfer received",
            "e-transfer sent",
            "online banking transfer",
        ],
        "Cash": ["atm", "cash"],
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
        # we assume that the food category percentage is higher then all others
        # that is the reason that ML model predict food for all transaction which are complicated like: misc payment amazon, that has keyword collison
        # our precious model was forced to predict category based on the highest percentage of the category occurance in the trained data
        # Now, It uses predict_proba (prediction probability) to check how confident the model is before accepting the answer.
        # if the model looks at "misc payment amazon" and is only 30% sure it's Food, it will cleanly output "Other".
        # the prediction acceptance threshold is set at 50% (0.50), but you can adjust it based on your needs.
        if ml_pipeline:
            try:
                # Get the probabilities for all categories
                probabilities = ml_pipeline.predict_proba([desc])[0]

                # Find the highest probability score (e.g., 0.85 for 85% confident)
                max_confidence = max(probabilities)

                # Find which category that score belongs to
                best_guess = ml_pipeline.classes_[probabilities.argmax()]

                # THE SHIELD: If the model is less than 50% sure, force it to 'Other'
                if max_confidence < 0.50:
                    return "Other"

                return best_guess

            except AttributeError:
                # Fallback if your specific ML model doesn't support predict_proba
                prediction = ml_pipeline.predict([desc])[0]
                return prediction
            except Exception as e:
                return "Other"

        return "Other"

    # 3. Apply the logic
    df["category"] = df.apply(categorize_row, axis=1)
    return df
