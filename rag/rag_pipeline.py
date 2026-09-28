from retriever import retrieve
from llm import generate_answer


def answer_question(question):

    # Retrieve relevant chunks
    results = retrieve(question, top_k=5)

    # Build context
    context = ""

    for i, result in enumerate(results):

        context += f"""
SOURCE {i + 1}: {result["source"]}

CONTENT:
{result["text"]}

"""

    # Prompt the LLM
    prompt = f"""
You are a medical information assistant.

Use ONLY the provided context to answer the question.

Do not invent information.

If the context does not contain enough information,
say so clearly.

USER QUESTION:
{question}

CONTEXT:
{context}

ANSWER:
"""

    answer = generate_answer(prompt)

    return answer, results