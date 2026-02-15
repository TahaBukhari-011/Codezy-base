from fastapi import APIRouter
from pydantic import BaseModel
from app.ai.async_tutor import async_tutor_response  # <-- use async

router = APIRouter()

class TutorRequest(BaseModel):
    question: str

class TutorResponse(BaseModel):
    answer: str

@router.post("/ai/tutor", response_model=TutorResponse)
async def handle_question(request: TutorRequest):
    """
    Handles frontend question, returns AI answer asynchronously.
    """
    answer = await async_tutor_response(request.question)
    print("Response sent:", answer)
    return {"answer": answer}
