import pandas as pd
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema.document import Document
from langchain.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.chains import RetrievalQA
from dotenv import load_dotenv

# Load API Key from .env file
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Global variable to store the "Brain" for the current session
# In production, we will use a real DB (Postgres/Pinecone) with User IDs
vector_db = None

def process_data_for_chat(df: pd.DataFrame):
    """
    1. Converts the DataFrame into a text format that AI can read.
    2. Stores it in a Vector Database (vector_db) for fast searching.
    """
    global vector_db
    
    # 1. Convert DataFrame to "Documents" (Text Chunks)
    # We turn: Date: 2025-01-01 | Desc: UBER | Amount: -20
    # Into: "On 2025-01-01, you spent $20.00 on UBER (Transport)."
    documents = []
    for _, row in df.iterrows():
        # Handle missing values safely
        desc = row.get('description', 'Unknown')
        cat = row.get('category', 'Uncategorized')
        amt = row.get('amount', 0)
        date = row.get('date', 'Unknown Date')
        
        # Create a natural language sentence
        text = f"On {date}, you spent ${abs(amt):.2f} at {desc}. Category: {cat}."
        if amt > 0:
            text = f"On {date}, you received ${amt:.2f} from {desc}. Category: {cat}."
            
        documents.append(Document(page_content=text, metadata=row.to_dict()))

    # 2. Create the Vector Store (The "Brain")
    # This turns text into numbers so we can search "Coffee" and find "Starbucks"
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", gemini_api_key=GEMINI_API_KEY)
    
    # Create a temporary in-memory database
    vector_db = Chroma.from_documents(
        documents, 
        embeddings,
        collection_name="financial_data"
    )
    print("Chatbot Brain created with", len(documents), "transactions.")

def ask_financial_question(question: str):
    """
    Searches the Vector DB for relevant transactions and asks Gemini to answer.
    """
    global vector_db
    if not vector_db:
        return "Please upload a financial statement first."

    # 1. Setup the LLM (Gemini Pro)
    llm = ChatGoogleGenerativeAI(model="gemini-pro", gemini_api_key=GEMINI_API_KEY, temperature=0)

    # 2. Create the "Chain" (The Conversation Logic)
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vector_db.as_retriever(search_kwargs={"k": 20}) # Retrieve top 20 relevant transactions
    )

    # 3. Ask the question
    # We add a custom prompt to make it act like a Financial Advisor
    full_query = f"""
    You are a helpful Financial Advisor. Answer the user's question based strictly on the context provided below.
    If the answer is not in the context, say "I don't see that in your statement."
    
    User Question: {question}
    """
    
    response = qa_chain.run(full_query)
    return response