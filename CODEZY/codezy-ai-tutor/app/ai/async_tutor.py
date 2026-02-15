import asyncio
from concurrent.futures import ThreadPoolExecutor
from app.ai.tutor import tutor_response

# Thread pool for running blocking LLM calls
executor = ThreadPoolExecutor(max_workers=2)

async def async_tutor_response(question: str) -> str:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, tutor_response, question)
