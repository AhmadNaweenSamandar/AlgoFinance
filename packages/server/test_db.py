import os
import shutil
import time
import gc  # <--- NEW: Garbage Collector
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# 1. Setup
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
DB_PATH = "./test_chroma_db"

if not API_KEY:
    print("CRITICAL: No API Key found.")
    exit()

print(f"API Key loaded. Testing with model: models/gemini-embedding-001")


# --- HELPER TO DELETE FOLDER SAFELY ON WINDOWS ---
def force_delete_folder(path):
    if os.path.exists(path):
        try:
            shutil.rmtree(path)
            print(f"Cleaned up {path}")
        except PermissionError:
            print("Windows Lock detected. Retrying...")
            time.sleep(1)  # Wait for Windows to release lock
            try:
                shutil.rmtree(path)
                print(f"Cleaned up {path} (Success on retry)")
            except:
                print(f"Could not delete {path}. Please delete manually.")


# 2. Cleanup Old Test Data
force_delete_folder(DB_PATH)

# 3. Define Embeddings
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001", google_api_key=API_KEY
)

# 4. Create DB
print("\n--- STEP 1: INGESTION ---")
docs = [
    Document(
        page_content="The user spent $500 on Groceries.", metadata={"source": "test"}
    ),
]

try:
    vector_db = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        collection_name="test_collection",
        persist_directory=DB_PATH,
    )
    print(f"DB Created with {len(docs)} documents.")

    # CRITICAL WINDOWS FIX:
    # We must kill the connection before moving to the next step
    vector_db = None
    del vector_db
    gc.collect()

except Exception as e:
    print(f"ERROR: {e}")
    exit()

# 5. Test Retrieval
print("\n--- STEP 2: RETRIEVAL ---")
try:
    # Re-load DB
    new_db = Chroma(
        persist_directory=DB_PATH,
        embedding_function=embeddings,
        collection_name="test_collection",
    )

    results = new_db.similarity_search("Groceries", k=1)

    if len(results) > 0:
        print(f"SUCCESS! Found: {results[0].page_content}")
    else:
        print("FAILURE: Retriever returned 0 results.")

    # CRITICAL WINDOWS FIX AGAIN:
    new_db = None
    del new_db
    gc.collect()

except Exception as e:
    print(f"ERROR: {e}")

# 6. Final Cleanup
print("\n--- CLEANUP ---")
force_delete_folder(DB_PATH)
