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
            print(f"⚠️ Windows Lock detected on {path}. Waiting 1s to retry...")
            time.sleep(1)
        except Exception as e:
            print(f"Error deleting {path}: {e}")
            return

    print(
        "❌ Could not delete folder after 3 attempts. Proceeding anyway (might cause issues)."
    )


def process_data_for_chat(df: pd.DataFrame):
    """
    1. Clears old memory.
    2. Ingests new data.
    3. Saves it to the hard drive.
    """
    print("--- STARTING CHATBOT PROCESSING ---")

    # Step A: Safe Cleanup
    force_delete_folder(DB_PATH)

    # Step B: Inspect the Data (Debug Print)
    # This proves if your DataFrame actually has data!
    print(f"DataFrame Shape: {df.shape}")
    if not df.empty:
        print(f"First Row Preview:\n{df.iloc[0].to_dict()}")

    # Convert DataFrame to Text Documents
    documents = []
    for _, row in df.iterrows():
        # normalize column names to lowercase to avoid "Description" vs "description" bugs
        row_data = {k.lower(): v for k, v in row.to_dict().items()}
        # Handle missing values safely
        desc = row.get("description", "Unknown")
        cat = row.get("category", "Uncategorized")
        amt = row.get("amount", 0)
        date = row.get("date", "Unknown Date")

        # Create the text description
        text = f"Date: {date} | Amount: ${amt} | Vendor: {desc} | Category: {cat}"
        documents.append(Document(page_content=text, metadata=row.to_dict()))

    print(f"Created {len(documents)} documents for indexing.")

    if len(documents) == 0:
        print("CRITICAL: No documents were created! Check your column names.")
        return

    # Step C: Create and Save the Vector DB
    # The 'persist_directory' argument forces it to save to disk
    try:
        vector_db = Chroma.from_documents(
            documents=documents,
            embedding=get_embeddings(),
            collection_name="financial_data",
            persist_directory=DB_PATH,
        )
        print(f"SUCCESSFULLY SAVED to {DB_PATH}")

        # Windows Hygiene: Release the variable immediately
        vector_db = None
        del vector_db
        gc.collect()

    except Exception as e:
        print(f"CRITICAL ERROR saving DB: {e}")


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
    template = """You are a Financial Analyst. Answer the question based only on the following context:

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
