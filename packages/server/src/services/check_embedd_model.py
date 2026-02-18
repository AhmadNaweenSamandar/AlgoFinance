import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")  # Or GEMINI_API_KEY if that's what you use

if not api_key:
    print("Error: API Key not found in .env")
    exit()

genai.configure(api_key=api_key)

print("Checking available models for your API Key...")
try:
    for m in genai.list_models():
        if "embedContent" in m.supported_generation_methods:
            print(f"AVAILABLE EMBEDDING MODEL: {m.name}")
except Exception as e:
    print(f"Error connecting to Google: {e}")
