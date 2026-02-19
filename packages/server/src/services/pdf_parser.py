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
        import pdfplumber
        import re
        from io import BytesIO

        print(f"\n--- RBC SPATIAL PARSER: {filename} ---")

        all_transactions = []
        current_date = "Unknown Date"

        # State Tracking Flags
        in_details_section = False
        with_idx = -1
        dep_idx = -1

        # Regex Patterns
        date_pattern = re.compile(r"^(\d{1,2}\s+[A-Za-z]{3}|[A-Za-z]{3}\s+\d{1,2})")
        # Matches numbers like 1,234.56 or 12.34
        money_pattern = re.compile(r"\d{1,3}(?:,\d{3})*\.\d{2}")

        with pdfplumber.open(BytesIO(contents)) as pdf:
            for page in pdf.pages:
                # layout=True is CRITICAL here. It preserves the exact spaces
                # so we know which column a number belongs to.
                text = page.extract_text(layout=True)
                if not text:
                    continue

                for line in text.split("\n"):
                    # Do not strip the line yet! We need the physical spaces.
                    if not line.strip():
                        continue

                    # 1. THE SHIELD: Ignore everything until the details section
                    # We remove spaces to catch "Details of youraccountactivity" safely
                    if "detailsofyouraccountactivity" in line.lower().replace(" ", ""):
                        in_details_section = True
                        print("Found 'Details of your account activity' section.")
                        continue

                    if not in_details_section:
                        continue  # Ignore the Summary Section entirely!

                    # 2. COLUMN CALIBRATION: Find exact horizontal position of headers
                    if "Withdrawals" in line and "Deposits" in line:
                        with_idx = line.find("Withdrawals")
                        dep_idx = line.find("Deposits")
                        print(
                            f"Column Positions -> Withdrawals: {with_idx}, Deposits: {dep_idx}"
                        )
                        continue

                    # 3. TRANSACTION EXTRACTION
                    if with_idx != -1:  # Ensure we calibrated the columns

                        # Skip the Opening and Closing balance lines
                        if (
                            "opening balance" in line.lower()
                            or "closing balance" in line.lower()
                        ):
                            continue

                        # Extract the Date
                        line_stripped = line.strip()
                        date_match = date_pattern.match(line_stripped)

                        if date_match:
                            current_date = date_match.group(1).strip()
                            # Find where the description starts (right after the date)
                            desc_start_idx = line.find(current_date) + len(current_date)
                        else:
                            # Ghost Date (same day transaction)
                            # Start reading description from the first non-space character
                            desc_start_idx = len(line) - len(line.lstrip())

                        # Find all money amounts on this line and their exact string positions
                        matches = list(money_pattern.finditer(line))

                        if len(matches) >= 1:
                            try:
                                # The first number is ALWAYS the transaction amount.
                                # The second number (if it exists) is the Balance, which we ignore.
                                amount_match = matches[0]
                                amount_str = amount_match.group()
                                amount_pos = (
                                    amount_match.start()
                                )  # Physical horizontal location

                                raw_amount = float(amount_str.replace(",", ""))

                                # COLUMN POSITION MATH
                                # Is this number printed closer to the "Withdrawals" or "Deposits" header?
                                dist_to_with = abs(amount_pos - with_idx)
                                dist_to_dep = abs(amount_pos - dep_idx)

                                if dist_to_with <= dist_to_dep:
                                    # It's a Withdrawal (Expense)
                                    final_amount = -abs(raw_amount)
                                    col_type = "Withdrawal"
                                else:
                                    # It's a Deposit (Income)
                                    final_amount = abs(raw_amount)
                                    col_type = "Deposit"

                                # Extract Description (Everything between the date and the amount)
                                description = line[desc_start_idx:amount_pos].strip()

                                # Clean up weird spacing in the description
                                description = re.sub(r"\s+", " ", description)

                                if not description:
                                    continue

                                all_transactions.append(
                                    {
                                        "date": current_date,
                                        "description": description,
                                        "amount": final_amount,
                                        "category": "Uncategorized",
                                    }
                                )
                                print(
                                    f"[{current_date}] {col_type}: ${final_amount} | {description[:25]}"
                                )

                            except Exception as e:
                                print(f"Parsing Error: {line.strip()} -> {e}")

        # DataFrame Creation
        if not all_transactions:
            print("CRITICAL: No transactions found in the details section.")
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
