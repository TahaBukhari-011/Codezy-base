from langchain_classic.prompts import PromptTemplate
from langchain_classic.chains import LLMChain
from app.ai.llm import get_llm

TUTOR_PROMPT = PromptTemplate(
    input_variables=["question"],
    template="""
You are Codezy AI Tutor for individual learners.

Your role:
- Explain programming concepts clearly
- Use simple examples
- Be beginner-friendly

Rules:
- Do NOT solve coding platform problems
- Do NOT provide full project or lab solutions
- Prefer explanations, examples, and pseudocode

Student question:
{question}
"""
)

def tutor_response(question: str) -> str:
    """
    Synchronous function that calls the LLM and returns a response.
    """
    llm = get_llm(temperature=0.4)
    chain = LLMChain(llm=llm, prompt=TUTOR_PROMPT, verbose=False)

    # Limit max tokens to 150 for faster response
    result = chain.invoke({"question": question, "max_tokens": 150})
    return result["text"]
