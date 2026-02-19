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
        with pdfplumber.open(BytesIO(contents)) as pdf:
            all_rows = []

            # 1. Define "Loose" Settings for Borderless Tables
            # "vertical_strategy": "text" -> Look for gaps in text to find columns
            # "horizontal_strategy": "text" -> Look for gaps in text to find rows
            table_settings = {
                "vertical_strategy": "text",
                "horizontal_strategy": "text",
                "intersection_y_tolerance": 10,
            }

            # Iterate through every page of the bank statement
            for page in pdf.pages:
                # extract_table() attempts to find the largest table on the page
                table = page.extract_table()

                # 3. If standard fails, try the "Borderless" settings
                if not table:
                    table = page.extract_table(table_settings)

                if table:
                    # Clean rows immediately (remove empty lists/None)
                    cleaned_table = [row for row in table if row and any(row)]
                    all_rows.extend(cleaned_table)

            if not all_rows:
                # 4. Emergency Fallback: If tables fail entirely, read raw text
                # This prevents the crash and allows at least SOME debugging
                print("No tables found. Attempting raw text fallback...")
                text_content = []
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        text_content.append(text)

                if text_content:
                    # Return a dummy DF with the raw text so you can see it
                    return pd.DataFrame(
                        {"description": text_content, "amount": [0] * len(text_content)}
                    )

                raise ValueError("Could not extract any table OR text from this PDF.")

            # --- HEADER HUNTER LOGIC (CRITICAL FIX) ---
            # We look for the row that contains keywords like "Date", "Description", "Amount"
            header_index = -1
            found_header = False

            # Common headers we expect to see
            target_keywords = {
                "date",
                "description",
                "details",
                "amount",
                "debit",
                "credit",
                "payment",
                "withdrawal",
            }

            # Scan the first 10 rows (Headers usually aren't lower than that)
            for i, row in enumerate(all_rows[:20]):
                # Convert row to lowercase set for fast matching
                row_text = set(str(cell).lower() for cell in row if cell)

                # If we find at least 2 keywords (e.g., "Date" and "Amount"), we found the header!
                if len(row_text.intersection(target_keywords)) >= 2:
                    header_index = i
                    found_header = True
                    break

            if not found_header:
                # Fallback: Assume the first row is the header if we can't find one
                print("No header found. Using first row.")
                header_index = 0

            # Create DataFrame starting from the identified header row
            headers = all_rows[header_index]
            data = all_rows[header_index + 1 :]

            # Handle mismatch in column counts (common in PDF parsing)
            # If a row has more/less columns than header, normalize it
            normalized_data = []
            expected_cols = len(headers)

            for row in data:
                if len(row) == expected_cols:
                    normalized_data.append(row)
                elif len(row) < expected_cols:
                    # Pad with None
                    normalized_data.append(row + [None] * (expected_cols - len(row)))
                else:
                    # Truncate (or merge last columns if needed)
                    normalized_data.append(row[:expected_cols])

            df = pd.DataFrame(normalized_data, columns=headers)

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
