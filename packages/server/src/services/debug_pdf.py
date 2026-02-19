import pdfplumber
import os

# --- CONFIGURATION ---
PDF_FILENAME = "RBC_statement.pdf"

# Get the full path dynamically to avoid "File Not Found" errors
current_dir = os.path.dirname(os.path.abspath(__file__))
pdf_path = os.path.join(current_dir, PDF_FILENAME)

print(f"--- INSPECTING: {pdf_path} ---")

if not os.path.exists(pdf_path):
    print(f"ERROR: File not found at {pdf_path}")
    print("Check the filename in the script matches your file exactly.")
    exit()

with pdfplumber.open(pdf_path) as pdf:
    # Grab the first page to see the layout
    page = pdf.pages[0]

    # Extract text with layout preservation
    text = page.extract_text(x_tolerance=2, y_tolerance=2)

    print("\n--- RAW TEXT CONTENT (First 40 Lines) ---")
    if text:
        lines = text.split("\n")
        for i, line in enumerate(lines[:40]):
            print(f"[{i:02d}] {line}")
    else:
        print("CRITICAL: No text found. Is this a scanned image?")
