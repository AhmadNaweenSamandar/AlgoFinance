import pandas as pd
import numpy as np
from datetime import datetime


def normalize_financial_data(df: pd.DataFrame) -> pd.DataFrame:
    # 1. Standardize columns
    df.columns = [
        str(c).lower().strip().replace("_", " ").replace("-", " ") for c in df.columns
    ]
    cols = df.columns

    # 2. Identify Format
    if any(c in cols for c in ["withdrawals", "payments", "debit"]) and any(
        c in cols for c in ["deposits", "credit"]
    ):
        debit_col = next(c for c in cols if c in ["withdrawals", "payments", "debit"])
        credit_col = next(c for c in cols if c in ["deposits", "credit"])
        df["amount"] = df[credit_col].fillna(0) - df[debit_col].fillna(0)

    elif "trans amount" in cols:
        df.rename(columns={"trans amount": "amount"}, inplace=True)

    elif "amount" in cols:
        pass
    else:
        raise ValueError("Could not find Amount, Withdrawals, or Trans Amount columns.")

    # 3. Standardize Date and Description
    date_col = next((c for c in cols if "date" in c and "post" not in c), "date")
    desc_col = next(
        (c for c in cols if c in ["description", "merchant", "narrative"]),
        "description",
    )

    df = df.rename(columns={date_col: "date", desc_col: "description"})

    # 4. Clean Amounts
    final_df = df[["date", "description", "amount"]].copy()
    final_df["amount"] = (
        final_df["amount"].replace("[\$,]", "", regex=True).astype(float)
    )

    # --- 🟢 NEW: STEP 5 - SMART DATE STANDARDIZATION ---

    # Attempt to convert all dates (Excel datetimes or PDF strings like "9 Jan") to Pandas datetime
    # If the string has no year, Pandas will assume the current year (e.g., 2026)
    final_df["date"] = pd.to_datetime(final_df["date"], errors="coerce")

    current_time = datetime.now()

    def fix_future_dates(dt):
        if pd.isna(dt):
            return dt
        # If the date parsed as a future date (e.g., Dec 23, 2026, when it's only Feb 2026)
        # It means the statement crossed over the new year. Push it back to 2025.
        if dt > current_time:
            try:
                return dt.replace(year=dt.year - 1)
            except ValueError:
                # Handle leap year edge cases (Feb 29)
                return dt - pd.DateOffset(years=1)
        return dt

    final_df["date"] = final_df["date"].apply(fix_future_dates)

    # Format them cleanly for your JSON response and Chatbot (YYYY-MM-DD)
    final_df["date"] = final_df["date"].dt.strftime("%Y-%m-%d")
    final_df["date"] = final_df["date"].fillna("Unknown Date")

    return final_df
