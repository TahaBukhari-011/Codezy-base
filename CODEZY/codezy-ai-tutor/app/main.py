# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.ai.router import router as ai_router

# --- Create FastAPI app ---
app = FastAPI(title="Codezy Tutor Backend")

# --- CORS setup for React dev server ---
origins = [
    "http://localhost:5173",  # your React dev server
    # Add other frontend origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # Allowed frontend origins
    allow_credentials=True,
    allow_methods=["*"],        # Allow GET, POST, OPTIONS, etc.
    allow_headers=["*"],        # Allow all headers
)

# --- Include AI router ---
app.include_router(ai_router)

# --- Optional root endpoint ---
@app.get("/")
def root():
    return {"message": "FastAPI is running!"}
