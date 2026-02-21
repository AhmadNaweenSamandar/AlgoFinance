import gc
from time import time
import pandas as pd
import os
from dotenv import load_dotenv
import shutil

# --- 1. CORE IMPORTS (No 'langchain.chains') ---
# previouy we had: from langchain.chains import RetrievalQA which throughs an error because of the new LCEL structure. We will now build the chain manually using the new Runnable API.
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# --- 2. TOOL IMPORTS ---
from langchain_chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings

# Load API Key (Gemini)
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

DB_PATH = "./chroma_db_store"  # <--- New Folder to save uploaded statement data


def get_embeddings():
    return GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001", google_api_key=API_KEY
    )


# function to safely delete folders on Windows (with retries)
def force_delete_folder(path):
    """
    Helper to safely delete folders on Windows.
    Retries 3 times if the file is locked.
    """
    if not os.path.exists(path):
        return

    # 1. Force Python to release memory references
    gc.collect()

    # 2. Try to delete with retries
    for i in range(3):
        try:
            shutil.rmtree(path)
            print(f"Successfully deleted {path}")
            return
        except PermissionError:
            print(f"Windows Lock detected on {path}. Waiting 1s to retry...")
            time.sleep(1)
        except Exception as e:
            print(f"Error deleting {path}: {e}")
            return

    print(
        "Could not delete folder after 3 attempts. Proceeding anyway (might cause issues)."
    )


def process_data_for_chat(df: pd.DataFrame):
    print("\n--- DIAGNOSTIC: DATA INGESTION ---")

    # 1. Print the Raw Columns found in the Excel file
    print(f"Columns Found in Excel: {list(df.columns)}")

    # 2. Normalize columns (strip spaces, make lowercase)
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    print(f"DATA CLEANING: Normalized Columns to: {list(df.columns)}")

    # 3. Clean up old DB
    force_delete_folder(DB_PATH)

    # 4. Create Documents with Strict Checks
    documents = []
    for index, row in df.iterrows():
        # flexible mapping: try common names for "Description"
        desc = (
            row.get("description")
            or row.get("transaction")
            or row.get("details")
            or "Unknown"
        )

        # flexible mapping for "Category"
        cat = row.get("category") or row.get("type") or "Uncategorized"

        # flexible mapping for "Amount"
        amt = row.get("amount") or row.get("cost") or row.get("debit") or 0

        # flexible mapping for "Date"
        date = row.get("date") or row.get("transaction_date") or "Unknown Date"

        # Content for the AI to read
        text = f"Date: {date} | Amount: ${amt} | Vendor: {desc} | Category: {cat}"

        # Metadata for filtering
        meta = {"source": "user_upload", "row": index}

        documents.append(Document(page_content=text, metadata=meta))

    # 5. PRINT THE FIRST DOCUMENT (Crucial Debug Step)
    if len(documents) > 0:
        print(f"\nPREVIEW OF DOCUMENT #1:\n{documents[0].page_content}")
        if "Unknown" in documents[0].page_content and str(amt) == "0":
            print("WARNING: Document looks empty! Check column names above.")
    else:
        print("CRITICAL: No documents created.")
        return

    # 6. Save to Disk
    print(f"Saving {len(documents)} documents to {DB_PATH}...")
    try:
        vector_db = Chroma.from_documents(
            documents=documents,
            embedding=get_embeddings(),
            collection_name="financial_data",
            persist_directory=DB_PATH,
        )
        print("DATABASE SAVED SUCCESSFULLY")

        # Windows Hygiene
        vector_db = None
        del vector_db
        gc.collect()

    except Exception as e:
        print(f"ERROR SAVING DB: {e}")


def ask_financial_question(question: str):
    """
    Reads from the hard drive to answer the question.
    """
    print(f"--- USER ASKED: {question} ---")

    # Step 1: Check if the database exists on disk
    if not os.path.exists(DB_PATH):
        print("Error: DB directory not found.")
        return "Please upload a financial statement first (Database not found)."

    # Step 2: Load the Database from Disk
    print("Loading brain from disk...")
    vector_db = Chroma(
        persist_directory=DB_PATH,
        embedding_function=get_embeddings(),
        collection_name="financial_data",
    )

    # 2. Setup Retriever
    retriever = vector_db.as_retriever(search_kwargs={"k": 20})

    # --- DEBUGGING START ---
    # Let's see exactly what the database finds BEFORE we send it to Gemini
    print("Searching database...")
    docs = retriever.invoke(question)
    print(f"Found {len(docs)} relevant documents.")

    if len(docs) > 0:
        print(f"Top Result Preview: {docs[0].page_content[:100]}...")
    else:
        print("CRITICAL: Retriever found 0 documents! The AI has no context.")
        # If this happens, it means the embeddings are mismatched or the DB is empty.
    # --- DEBUGGING END ---

    # 1. Setup LLM
    llm = ChatGoogleGenerativeAI(
        model="gemini-3-flash-preview", google_api_key=API_KEY, temperature=0
    )

    # 3. Create Prompt
    template = """You are a Financial Assistant, your name is Gabina. Answer the question based only on the following context:

    {context}

    Question: {question}
    """
    prompt = ChatPromptTemplate.from_template(template)

    # 4. Build the "Runnable Chain"
    # We use the pipe operator (|) to connect components directly.
    # retriever -> format_docs -> prompt -> llm -> output_parser

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    # Step 5: Execute
    try:
        response = rag_chain.invoke(question)
        print("Answer Generated")
        return response
    except Exception as e:
        print(f"Error generating answer: {e}")
        return "Sorry, I encountered an error while thinking."
