import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

# --- Data Models (Schemas) ---

# This defines what a single Fruit object looks like.
# FastAPI uses this for validation: if we send data without a "name" string, it will error out.
class Fruit(BaseModel):
    name: str


# This defines the structure of the data returned by the GET endpoint.
# It expects a dictionary/object containing a list of Fruit objects.
class Fruits(BaseModel):
    fruits: List[Fruit]

# --- App Initialization ---
app = FastAPI()

# --- CORS (Cross-Origin Resource Sharing) Configuration ---
# It tells the server to allow requests 
# coming from a specific "origin" (in this case, the local frontend at port 5136).
# Without this, the browser would block the frontend from talking to this API.
origins = [
    "http://localhost:5136"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,    # Only allow requests from these specific URLs
    allow_credentials=True,   # Allow cookies/authentication headers
    allow_methods=["*"],      # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],      # Allow all headers
)


# --- "Database" ---
# A simple Python dictionary acting as a temporary database. In a real app, you'd use a proper database.
memory_db = {"fruits": []}


# --- Routes / Endpoints ---

# GET Endpoint: Used to retrieve data.
# When we visit http://localhost:8000/fruits, this function runs.

@app.get(path="/fruits", response_model=Fruits)
def get_fruits():
    # We wrap the list from memory_db in the Fruits Pydantic model
    return Fruits(fruits=memory_db["fruits"])


# POST Endpoint: Used to send new data to the server.
# It receives a JSON body, validates it against the 'Fruit' model, and saves it.
@app.post("/fruits", response_model=Fruit)
def add_fruit(fruit: Fruit):
    memory_db["fruits"].append(fruit)
    return fruit


# --- Server Execution ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)