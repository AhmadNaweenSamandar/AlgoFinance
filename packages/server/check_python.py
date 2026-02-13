import sys
import os

print(f"1. Python Executable: {sys.executable}")

try:
    import langchain

    print(f"2. LangChain Version: {langchain.__version__}")
    print(f"3. LangChain Location: {os.path.dirname(langchain.__file__)}")
except ImportError:
    print("❌ CRITICAL: 'langchain' is NOT installed.")

try:
    from langchain.chains import RetrievalQA

    print("✅ SUCCESS: 'langchain.chains' found!")
except ImportError as e:
    print(f"❌ ERROR: Could not import 'RetrievalQA'. Reason: {e}")

try:
    import langchain_community

    print(f"4. LangChain Community Version: {langchain_community.__version__}")
except ImportError:
    print("❌ WARNING: 'langchain-community' is missing.")
