from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# import router from endpoints module
from src.api.endpoints import router as api_router


# --- App Initialization ---
app = FastAPI(title="AlgoFinance API")

# --- CORS (Cross-Origin Resource Sharing) Configuration ---
# It tells the server to allow requests
# coming from a specific "origin" (in this case, the local frontend at port 5136).
# Without this, the browser would block the frontend from talking to this API.
origins = [
    "http://localhost:5173",  # frontend local development URL
    "http://127.0.0.1:5173",
    "https://algofinance-frontend.web.app",  # Firebase frontend link
    "https://algofinance-frontend.firebaseapp.com",  # Firebase frontend backup link
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Only allow requests from these specific URLs
    allow_credentials=True,  # Allow cookies/authentication headers
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


# --- "Database" ---
# A simple Python dictionary acting as a temporary database. In a real app, you'd use a proper database.
memory_db = {"fruits": []}


# --- Routes / Endpoints ---
# REGISTER THE ROUTER
# 'prefix="/api"' means all routes in that file will start with /api
# e.g., /api/upload-statement
app.include_router(api_router, prefix="/api")


# GET Endpoint: Used to retrieve data.
@app.get("/")
def health_check():
    """
    A simple endpoint to verify the backend is running
    and reachable from the frontend.
    """
    return {"status": "active", "message": "Backend is running!"}


# we can run main.py with: uvicorn app.main:app --reload


# # --- Server Execution ---
# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)
