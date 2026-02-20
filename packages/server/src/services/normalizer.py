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

    # 5. Clean Dates (Now works perfectly for both Excel and our new PDF format)
    final_df["date"] = pd.to_datetime(final_df["date"], errors="coerce")
    final_df["date"] = final_df["date"].dt.strftime("%Y-%m-%d")
    final_df["date"] = final_df["date"].fillna("Unknown Date")

    return final_df
