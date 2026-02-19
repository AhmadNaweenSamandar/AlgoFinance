import pandas as pd
from fastapi import UploadFile
import numpy as np
from io import BytesIO
import pdfplumber
import re


# function to extract data from uploaded files
async def extract_data_from_file(file: UploadFile) -> pd.DataFrame:
    """
    Service to determine file type and extract text into a structured DataFrame.
    """
    filename = file.filename.lower()
    contents = await file.read()

    if filename.endswith(".csv"):
        # Pandas read CSVs directly
        df = pd.read_csv(BytesIO(contents))

    elif filename.endswith(".xlsx"):
        # Pandas can read Excel directly
        df = pd.read_excel(BytesIO(contents))

    # --- NEW PDF LOGIC ---

    elif filename.endswith(".pdf"):

        print(f"\n---RBC PDF PARSER: {filename} ---")

        all_transactions = []

        # PATTERN:
        # 1. Date (Jan 01 or 01 Jan)
        # 2. Description (anything until the last 3 numbers)
        # 3. The Money Columns (look for 1 to 3 numbers at the end of the line)
        date_pattern = re.compile(r"^(\d{1,2}\s+[A-Za-z]{3}|[A-Za-z]{3}\s+\d{1,2})")

        with pdfplumber.open(BytesIO(contents)) as pdf:
            for page_num, page in enumerate(pdf.pages):
                # Extract text line by line (preserving layout)
                text = page.extract_text(x_tolerance=2, y_tolerance=2)
                if not text:
                    continue

                lines = text.split("\n")

                for line in lines:
                    line = line.strip()

                    # SKIP HEADERS/NOISE
                    if (
                        "Opening Balance" in line
                        or "Total" in line
                        or "Account Number" in line
                    ):
                        continue

                    # CHECK FOR DATE START
                    match = date_pattern.match(line)
                    if not match:
                        continue  # Skip lines that don't start with a date

                    try:
                        # LOGIC: Split the line into tokens
                        parts = line.split()

                        # The Date is usually the first 2 parts (e.g., "21" "Sep")
                        txn_date = " ".join(parts[:2])

                        # The Numbers are at the END.
                        # RBC usually has 1 or 2 numbers at the end (Amount + Balance, or just Amount)
                        # We iterate backwards to find the numbers.

                        numbers = []
                        desc_end_index = len(parts)  # Default to end

                        # Scan from end to find monetary values (e.g., 1,234.56 or -50.00)
                        for i in range(len(parts) - 1, 1, -1):
                            token = parts[i].replace(",", "")
                            # Check if it looks like a number (allow negatives)
                            if re.match(r"^-?\d+\.\d{2}$", token):
                                numbers.insert(0, float(token))
                                desc_end_index = i
                            else:
                                # Stop once we hit non-number text (the description)
                                break

                        # Reconstruct Description
                        description = " ".join(parts[2:desc_end_index])

                        # DETERMINE AMOUNT (Logic for Withdrawals vs Deposits)
                        # If we found 2 numbers: [TransactionAmount, Balance]
                        # If we found 3 numbers: [Withdrawal, Deposit, Balance] (Rare for one line)
                        # If we found 1 number:  [TransactionAmount] (Balance might be missing)

                        amount = 0.0

                        if len(numbers) >= 1:
                            # The first number found is the transaction amount
                            raw_amount = numbers[0]

                            # RBC TRICK: Withdrawals are positive numbers in the "Withdrawals" column.
                            # We need to guess if it's a withdrawal or deposit based on column position
                            # (hard with raw text) OR context.

                            # HEURISTIC: If description has "Deposit" or "Credit", it's positive.
                            # Otherwise, assume it's an expense (Negative).
                            if (
                                "deposit" in description.lower()
                                or "credit" in description.lower()
                                or "refund" in description.lower()
                            ):
                                amount = abs(raw_amount)
                            else:
                                amount = -abs(raw_amount)  # Force negative for expenses

                        # Add to list
                        all_transactions.append(
                            {
                                "date": txn_date,
                                "description": description,
                                "amount": amount,
                                "category": "Uncategorized",
                            }
                        )
                        print(
                            f"Captured: {txn_date} | ${amount} | {description[:30]}..."
                        )

                    except Exception as e:
                        print(f"Parsing Error on line: {line} -> {e}")

        # Final Validation
        if not all_transactions:
            print("CRITICAL: No transactions found.")
            # Create empty DF with correct columns to prevent crash
            df = pd.DataFrame(columns=["date", "description", "amount", "category"])
        else:
            df = pd.DataFrame(all_transactions)
            print(f"SUCCESS: Extracted {len(df)} transactions.")

    else:
        raise ValueError("Unsupported file type")

        # Create DataFrame
        # We assume the first row found was the header, or we use generic names
        df = pd.DataFrame(all_rows[1:], columns=all_rows[0])

    # Basic Cleanup for Normalizer
    # Ensure all columns are strings (sometimes pdfplumber extracts None as header)
    df.columns = [str(c).lower().strip() for c in df.columns]

    # Drop rows where ALL columns are None (empty/spacer rows)
    df.dropna(how="all", inplace=True)

    return df
