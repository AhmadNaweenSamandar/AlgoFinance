import joblib
import pandas as pd

# 1. Load the Brain
MODEL_PATH = "src/models/transaction_classifier.pkl"

try:
    print(f"Loading model from {MODEL_PATH}...")
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    exit()

# 2. Define Test Cases (Transactions the model has NEVER seen exactly)
# Notice: "AMZN" instead of "AMAZON", "Esso" instead of "Shell"
test_cases = [
    "AMZN MKTP US*1123",        # Should be Shopping
    "UBER * TRIP 8832",         # Should be Transport
    "TIM HORTONS #9932 ON",     # Should be Food
    "PAYROLL 12345",            # Should be Income
    "CITY OF OTTAWA WATER",     # Should be Utilities
    "NETFLIX.COM",              # Should be Entertainment
    "GOODLIFE FITNESS",         # Should be Health
    "UNKNOWN TRANSFER 999"      # Should be Other (or closest match)
]

# 3. Run Predictions
print("\n--- TEST RESULTS ---")
print(f"{'Transaction':<30} | {'Prediction':<15}")
print("-" * 50)

# The model expects a list/iterable
predictions = model.predict(test_cases)

# Zip them together to show results
for transaction, category in zip(test_cases, predictions):
    print(f"{transaction:<30} | {category:<15}")

print("\n--------------------")