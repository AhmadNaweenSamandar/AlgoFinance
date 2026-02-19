import pandas as pd
from fastapi import UploadFile
import numpy as np
from io import BytesIO
import pdfplumber


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
        from io import BytesIO

        print(f"\n---SMART SCAN: PARSING PDF {filename} ---")

        all_rows = []
        found_transaction_table = False

        with pdfplumber.open(BytesIO(contents)) as pdf:
            # We will use "text" strategy because bank statements rarely have gridlines
            table_settings = {
                "vertical_strategy": "text",
                "horizontal_strategy": "text",
                "snap_tolerance": 3,
            }

            for page_num, page in enumerate(pdf.pages):
                print(f"Scanning Page {page_num + 1}...")

                # key change: extract_tables() returns a LIST of all tables on the page
                tables = page.extract_tables(table_settings)

                for table_index, table in enumerate(tables):
                    if not table:
                        continue

                    # --- VALIDATION: Is this a transaction table? ---
                    # We check the first 5 rows of EACH table to see if it has our keywords
                    is_target_table = False

                    # Flatten the table to text to search quickly
                    # We look for "Date" AND ("Description" OR "Amount" OR "Balance")
                    for row in table[:5]:  # Check header area of this specific table
                        row_str = " ".join([str(cell).lower() for cell in row if cell])

                        if "date" in row_str and (
                            "description" in row_str
                            or "details" in row_str
                            or "amount" in row_str
                            or "balance" in row_str
                            or "withdrawals" in row_str
                        ):
                            is_target_table = True
                            found_transaction_table = True
                            print(f"FOUND TRANSACTION TABLE (Table #{table_index})")
                            break

                    # If this is the "Noise" table (Address, Logo), SKIP IT
                    if not is_target_table:
                        print(f"Skipping Table #{table_index} (Likely Header/Summary)")
                        continue

                    # If we found the right table, add its rows!
                    # Clean rows: Remove empty lists or rows with all None
                    cleaned = [
                        row
                        for row in table
                        if row and any(cell and str(cell).strip() for cell in row)
                    ]
                    all_rows.extend(cleaned)

        if not found_transaction_table:
            print("CRITICAL: Scanned all pages but found NO transaction table.")
            # Fallback: If strict scanning failed, try to grab the LARGEST table found
            # (we can implement this later if needed, but usually the scan works)
            raise ValueError("Could not find a valid transaction table in this PDF.")

        # --- HEADER HUNTER (Standard) ---
        print(f"Extracted {len(all_rows)} potential transaction rows.")

        header_index = -1
        target_keywords = {
            "date",
            "description",
            "details",
            "amount",
            "withdrawals",
            "deposits",
            "balance",
        }

        for i, row in enumerate(all_rows[:10]):
            row_text = set(str(cell).lower() for cell in row if cell)
            if len(row_text.intersection(target_keywords)) >= 2:
                header_index = i
                break

        if header_index == -1:
            print("No header row found in extracted data. Using Row 0.")
            header_index = 0

        # --- DATAFRAME CREATION ---
        headers = [
            str(h).strip() if h else f"col_{j}"
            for j, h in enumerate(all_rows[header_index])
        ]
        data = all_rows[header_index + 1 :]

        # Normalize row lengths
        max_cols = len(headers)
        normalized_data = []
        for row in data:
            # Ensure row length matches header length
            if len(row) < max_cols:
                row = row + [None] * (max_cols - len(row))
            normalized_data.append(row[:max_cols])

        df = pd.DataFrame(normalized_data, columns=headers)
        print(f"PDF DataFrame Created Successfully: {df.shape}")

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
