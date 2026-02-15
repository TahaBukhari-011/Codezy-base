from langchain_classic.prompts import PromptTemplate
from langchain_classic.chains import LLMChain
from app.ai.llm import get_llm

INTENT_PROMPT = PromptTemplate(
    input_variables=["question"],
    template="""
Classify the user's question into ONE category:

- programming_concept
- coding_example
- unknown

Question: {question}

Return only the category.
"""
)

def classify_intent(question: str) -> str:
    llm = get_llm(temperature=0)
    chain = LLMChain(llm=llm, prompt=INTENT_PROMPT)
    result = chain.run(question).strip().lower()
    return result
