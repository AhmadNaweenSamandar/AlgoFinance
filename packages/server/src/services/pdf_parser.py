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

        all_transactions = []
        current_date = "Unknown Date"

        in_details_section = False
        with_idx = -1
        dep_idx = -1

        # Regex for dates like "23Dec" or "9 Jan"
        date_pattern = re.compile(r"^(\d{1,2}\s*[a-zA-Z]{3,4})")
        money_pattern = re.compile(r"\d{1,3}(?:,\d{3})*\.\d{2}")

        with pdfplumber.open(BytesIO(contents)) as pdf:
            for page in pdf.pages:
                text = page.extract_text(layout=True)
                if not text:
                    continue

                for line in text.split("\n"):
                    if not line.strip():
                        continue

                    line_no_spaces = line.lower().replace(" ", "")

                    # 1. Detect the start of the transactions
                    if "detailsofyouraccountactivity" in line_no_spaces:
                        in_details_section = True
                        continue

                    # 2. Calibrate columns
                    if (
                        in_details_section
                        and "Withdrawals" in line
                        and "Deposits" in line
                    ):
                        with_idx = line.find("Withdrawals")
                        dep_idx = line.find("Deposits")
                        continue

                    # 3. Extract Transactions
                    if in_details_section and with_idx != -1:

                        # THE SHIELD: Ignore the summary balances so they don't inflate totals
                        if (
                            "openingbalance" in line_no_spaces
                            or "closingbalance" in line_no_spaces
                            or "summary" in line_no_spaces
                        ):
                            continue

                        line_stripped = line.strip()
                        date_match = date_pattern.match(line_stripped)

                        if date_match:
                            raw_date = date_match.group(1).strip()
                            # Make it pretty: "23Dec" -> "23 Dec"
                            current_date = re.sub(
                                r"(\d+)([a-zA-Z]+)", r"\1 \2", raw_date
                            )

                            orig_date_match = re.search(
                                r"\d{1,2}\s*[a-zA-Z]{3,4}", line
                            )
                            desc_start_idx = (
                                orig_date_match.end()
                                if orig_date_match
                                else line.find(raw_date) + len(raw_date)
                            )
                        else:
                            # Ghost Date (Multiple transactions on one day)
                            desc_start_idx = len(line) - len(line.lstrip())

                        matches = list(money_pattern.finditer(line))

                        if len(matches) >= 1:
                            try:
                                amount_match = matches[0]
                                amount_str = amount_match.group()
                                amount_pos = amount_match.start()

                                raw_amount = float(amount_str.replace(",", ""))

                                # Spatial Math: Is it under Withdrawals or Deposits?
                                dist_to_with = abs(amount_pos - with_idx)
                                dist_to_dep = abs(amount_pos - dep_idx)

                                if dist_to_with <= dist_to_dep:
                                    final_amount = -abs(raw_amount)  # Expense
                                else:
                                    final_amount = abs(raw_amount)  # Income

                                description = line[desc_start_idx:amount_pos].strip()
                                description = re.sub(r"\s+", " ", description)

                                if not description or len(description) < 2:
                                    continue

                                all_transactions.append(
                                    {
                                        "date": current_date,
                                        "description": description,
                                        "amount": final_amount,
                                        "category": "Uncategorized",
                                    }
                                )

                            except Exception as e:
                                print(f"Parsing Error: {line.strip()} -> {e}")

        # Return the clean DataFrame
        if not all_transactions:
            return pd.DataFrame(columns=["date", "description", "amount", "category"])
        else:
            return pd.DataFrame(all_transactions)

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
