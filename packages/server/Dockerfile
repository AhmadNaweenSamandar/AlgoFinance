# 1. Use an official, lightweight Python image
FROM python:3.11-slim

# 2. Set the working directory inside the Google server
WORKDIR /app

# 3. Copy your requirements file first
COPY requirements.txt .

# 4. Install all your Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of your backend code into the server
COPY . .

# 6. Expose the port Google Cloud Run uses by default
EXPOSE 8080

# 7. Start the FastAPI server
# Make sure your main python file is named "main.py" and the FastAPI instance is named "app"
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]