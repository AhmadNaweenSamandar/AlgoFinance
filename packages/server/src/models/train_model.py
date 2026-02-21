import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

# 1. Load 1500+ row Excel file
print("Loading dataset...")
# The Excel has columns named 'description' and 'category'
df = pd.read_excel("training_data.xlsx")

# Check for missing values and drop them
df = df.dropna(subset=["description", "category"])

# 2. Split into Training and Testing sets (80% train, 20% test)
# This lets us check if the model is actually learning or just memorizing
X_train, X_test, y_train, y_test = train_test_split(
    df["description"], df["category"], test_size=0.2, random_state=42
)

# 3. Build the Pipeline
# TfidfVectorizer: Converts text to numbers (Word Frequency)
# RandomForestClassifier: The actual brain
model = make_pipeline(TfidfVectorizer(), RandomForestClassifier(n_estimators=100))

# 4. Train the model
print("Training model...")
model.fit(X_train, y_train)

# 5. Evaluate the model on the test set
print("Evaluating accuracy...")
accuracy = model.score(X_test, y_test)
print(f"Model Accuracy: {accuracy * 100:.2f}%")

# 6. Save the "Brain" to a file
joblib.dump(model, "transaction_classifier.pkl")
print("Model saved as transaction_classifier.pkl")
