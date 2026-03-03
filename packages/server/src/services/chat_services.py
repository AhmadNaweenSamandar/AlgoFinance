import os
from dotenv import load_dotenv

# --- 1. CORE IMPORTS (No 'langchain.chains') ---
# previouy we had: from langchain.chains import RetrievalQA which throughs an error because of the new LCEL structure. We will now build the chain manually using the new Runnable API.
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# --- 2. TOOL IMPORTS ---
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings

# Load API Key (Gemini)
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")


def get_embeddings():
    return GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001", google_api_key=API_KEY
    )


def format_financial_data(financial_context: list) -> str:
    """
    Helper function to turn the raw JSON list from React into a clean,
    readable text block so Gemini can understand it perfectly.
    """
    if not financial_context:
        return "No financial data provided."

    formatted_lines = []
    for row in financial_context:
        # Converts {"date": "...", "amount": 50, "category": "Food"}
        # into "- date: ... | amount: 50 | category: Food"
        line = " | ".join(
            f"{str(key).capitalize()}: {value}" for key, value in row.items()
        )
        formatted_lines.append(f"- {line}")

    return "\n".join(formatted_lines)


def ask_financial_question(question: str, financial_context: list):
    """
    Stateless Chat: Reads the context directly from the React request payload
    instead of searching a local hard drive.
    """

    print(f"--- USER ASKED: {question} ---")
    # Step 1: Check if the statement is not processed
    if not financial_context:
        return "Please upload a financial statement first. No data was received."

    # 1. Format the incoming React JSON into text for the prompt
    context_string = format_financial_data(financial_context)

    # Step 2: Setup LLM
    llm = ChatGoogleGenerativeAI(
        model="gemini-3-flash-preview", google_api_key=API_KEY, temperature=0
    )

    # 3. Create Prompt
    # The {context} variable is now filled directly by our formatted string, not a vector DB
    template = """You are a Financial Assistant. Answer the question based only on the following context:

    {context}

    Question: {question}
    """
    prompt = ChatPromptTemplate.from_template(template)

    # 4. Build the "Runnable Chain"
    # The chain is now incredibly simple: Prompt -> LLM -> Output
    rag_chain = prompt | llm | StrOutputParser()

    # 5. Execute
    try:
        print("Sending stateless payload to Gemini...")
        response = rag_chain.invoke({"context": context_string, "question": question})
        print("Answer Generated Successfully")
        return response

    except Exception as e:
        print(f"Error generating answer: {e}")
        return "Sorry, I encountered an error while analyzing the data."
