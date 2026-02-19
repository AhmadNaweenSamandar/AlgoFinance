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
        # We need to save the bytes to a temporary file because pdfplumber expects a path or file-like object
        print(f"\n--- DIAGNOSTIC: PARSING PDF {filename} ---")
        with pdfplumber.open(BytesIO(contents)) as pdf:
            all_rows = []

            # 1. Define "Loose" Settings for Borderless Tables
            # "vertical_strategy": "text" -> Look for gaps in text to find columns
            # "horizontal_strategy": "text" -> Look for gaps in text to find rows
            table_settings = {
                "vertical_strategy": "text",
                "horizontal_strategy": "text",
                "snap_tolerance": 3,
            }

            # Iterate through every page of the bank statement
            for page_num, page in enumerate(pdf.pages):
                # extract_table() attempts to find the largest table on the page
                table = page.extract_table(table_settings)

                # 3. If standard fails, try the "Borderless" settings
                if not table:
                    table = page.extract_table()

                if table:
                    # Filter out purely empty rows
                    cleaned = [
                        row
                        for row in table
                        if row and any(cell and str(cell).strip() for cell in row)
                    ]
                    all_rows.extend(cleaned)
                    print(f"Page {page_num+1}: Extracted {len(cleaned)} rows.")

            if not all_rows:
                print("CRITICAL: No rows extracted from PDF.")
                raise ValueError("Could not extract any table data from this PDF.")

            # --- HEADER HUNTER LOGIC (CRITICAL FIX) ---
            # We look for the row that contains keywords like "Date", "Description", "Amount"
            print("\n👀 INSPECTING FIRST 10 ROWS FOR HEADER:")
            header_index = -1
            found_header = False

            # Common headers we expect to see
            target_keywords = {
                "date",
                "trans",
                "description",
                "details",
                "amount",
                "debit",
                "credit",
                "payment",
                "withdrawals",
                "deposits",
                "balance",
            }

            # Scan the first 10 rows (Headers usually aren't lower than that)
            for i, row in enumerate(all_rows[:10]):
                # Create a normalized list of the row's text
                # We strip spaces and ignore None values
                row_text_list = [str(cell).strip().lower() for cell in row if cell]
                row_text_set = set(row_text_list)

                print(f"[Row {i}]: {row_text_list}")  # <--- LOOK THIS IN TERMINAL

                # Check for intersection
                matches = row_text_set.intersection(target_keywords)

                # Rule: Found if at least 2 keywords match OR we find 'date' and 'amount' specifically
                if len(matches) >= 2:
                    print(f"HEADER FOUND at Row {i}! Matched keywords: {matches}")
                    header_index = i
                    found_header = True
                    break

            if not found_header:
                # Fallback: Assume the first row is the header if we can't find one
                print("No header found. Using first row.")
                header_index = 0

            # Create DataFrame starting from the identified header row
            headers = all_rows[header_index]

            # Ensure headers are strings and handle None
            headers = [
                str(h).strip() if h else f"col_{j}" for j, h in enumerate(headers)
            ]

            data = all_rows[header_index + 1 :]

            # Handle mismatch in column counts (common in PDF parsing)
            # If a row has more/less columns than header, normalize it
            # Normalize row lengths
            max_cols = len(headers)
            normalized_data = []
            for row in data:
                # Pad with None if short
                if len(row) < max_cols:
                    row = row + [None] * (max_cols - len(row))
                # Truncate if long
                normalized_data.append(row[:max_cols])

            df = pd.DataFrame(normalized_data, columns=headers)
            print(f"PDF DataFrame Created: {df.shape}")

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
