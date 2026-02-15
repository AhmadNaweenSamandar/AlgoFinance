import pandas as pd
import os
from dotenv import load_dotenv

# --- 1. CORE IMPORTS (No 'langchain.chains') ---
# previouy we had: from langchain.chains import RetrievalQA which throughs an error because of the new LCEL structure. We will now build the chain manually using the new Runnable API.
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# --- 2. TOOL IMPORTS ---
from langchain_community.vectorstores import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings

# Load API Key (Gemini)
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Global variable
vector_db = None


def process_data_for_chat(df: pd.DataFrame):
    """
    Ingests data and builds the Vector DB (Same as before)
    """
    global vector_db

    documents = []
    for _, row in df.iterrows():
        desc = row.get("description", "Unknown")
        cat = row.get("category", "Uncategorized")
        amt = row.get("amount", 0)
        date = row.get("date", "Unknown Date")

        text = f"Date: {date} | Amount: ${amt} | Vendor: {desc} | Category: {cat}"
        documents.append(Document(page_content=text, metadata=row.to_dict()))

    # Embeddings
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001", google_api_key=GEMINI_API_KEY
    )

    # Vector DB
    vector_db = Chroma.from_documents(
        documents, embeddings, collection_name="financial_data"
    )
    print(f"✅ Gemini Chatbot Brain created with {len(documents)} transactions.")


def format_docs(docs):
    """
    Helper to join retrieved documents into a single string.
    """
    return "\n\n".join(doc.page_content for doc in docs)


def ask_financial_question(question: str):
    """
    Pure LCEL Implementation (The "Pipe" Method)
    """
    global vector_db
    if not vector_db:
        return "Please upload a financial statement first."

    # 1. Setup LLM
    llm = ChatGoogleGenerativeAI(
        model="gemini-pro", google_api_key=GEMINI_API_KEY, temperature=0
    )

    # 2. Setup Retriever
    retriever = vector_db.as_retriever(search_kwargs={"k": 20})

    # 3. Create Prompt
    template = """You are a Financial Analyst. Answer the question based only on the following context:

    {context}

    Question: {question}
    """
    prompt = ChatPromptTemplate.from_template(template)

    # 4. Build the "Runnable Chain"
    # We use the pipe operator (|) to connect components directly.
    # retriever -> format_docs -> prompt -> llm -> output_parser

    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    # 5. Execute
    return rag_chain.invoke(question)
