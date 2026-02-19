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

        print(f"\n--- RBC SMART PARSER: {filename} ---")

        all_transactions = []

        # State Tracking Variables
        current_date = "Unknown Date"
        previous_balance = None

        # Regex Patterns
        date_pattern = re.compile(r"^(\d{1,2}\s+[A-Za-z]{3}|[A-Za-z]{3}\s+\d{1,2})")
        # Matches numbers like 12.34, 1,234.56, -50.00
        money_pattern = re.compile(r"-?\d{1,3}(?:,\d{3})*\.\d{2}")

        with pdfplumber.open(BytesIO(contents)) as pdf:
            for page_num, page in enumerate(pdf.pages):
                # layout=True preserves physical spaces, making it easier to read
                text = page.extract_text(layout=True)
                if not text:
                    continue

                lines = text.split("\n")

                for line in lines:
                    original_line = line.strip()
                    if not original_line:
                        continue

                    # 1. Update the Date if present
                    date_match = date_pattern.match(original_line)
                    if date_match:
                        current_date = date_match.group(1).strip()
                        # Strip the date out so we can parse the rest of the line
                        line_content = original_line[date_match.end() :].strip()
                    else:
                        # No date found. But it might be a 2nd transaction on the same day!
                        line_content = original_line

                    # Skip headers and noise
                    if (
                        "Opening Balance" in line_content
                        or "Description" in line_content
                        or "Total" in line_content
                    ):
                        continue

                    # 2. Find all money values in the line
                    money_matches = money_pattern.findall(line_content)

                    if len(money_matches) >= 1:
                        try:
                            # Convert string money to floats
                            numbers = [float(m.replace(",", "")) for m in money_matches]

                            # The last number on an RBC line is almost always the Balance
                            current_balance = numbers[-1]

                            # 3. Extract Description (Everything before the first number)
                            first_money_str = money_matches[0]
                            desc_end_index = line_content.find(first_money_str)
                            description = line_content[:desc_end_index].strip()

                            # Clean up weird spacing in description
                            description = re.sub(r"\s+", " ", description)

                            if not description:
                                continue  # Skip lines that are just numbers

                            # 4. BALANCE MATH (The Secret Weapon)
                            # We determine the exact amount and sign by comparing balances
                            amount = 0.0
                            if previous_balance is not None:
                                # New Balance - Old Balance = Transaction Amount
                                # If balance goes up, it's a positive deposit!
                                amount = round(current_balance - previous_balance, 2)
                            else:
                                # Fallback for the very first line where we don't have a previous balance
                                if len(numbers) >= 2:
                                    raw_amount = numbers[-2]
                                    # Look for keywords to guess sign
                                    if any(
                                        word in description.lower()
                                        for word in [
                                            "deposit",
                                            "benefit",
                                            "pay",
                                            "credit",
                                            "refund",
                                        ]
                                    ):
                                        amount = abs(raw_amount)
                                    else:
                                        amount = -abs(raw_amount)

                            # Save this balance for the next line's math
                            previous_balance = current_balance

                            # Save the transaction
                            all_transactions.append(
                                {
                                    "date": current_date,
                                    "description": description,
                                    "amount": amount,
                                    "category": "Uncategorized",  # We let the LLM guess this later during chat
                                }
                            )
                            print(
                                f"Captured: {current_date} | Amount: ${amount} | Bal: ${current_balance} | {description[:25]}"
                            )

                        except Exception as e:
                            print(f"Parsing Error on line: {original_line} -> {e}")

        if not all_transactions:
            print("CRITICAL: No transactions found.")
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
