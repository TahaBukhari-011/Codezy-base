from langchain_community.llms import Ollama
from langchain_core.language_models.llms import LLM

def get_llm(temperature: float = 0.3) -> LLM:
    """
    Returns a real local LLM powered by Ollama (llama3:3b).
    Ollama must be running in the background.
    """
    return Ollama(
        model="llama3:8b",  # Use the 8B model for better performance
        temperature=temperature,
        num_ctx=2048
    )
