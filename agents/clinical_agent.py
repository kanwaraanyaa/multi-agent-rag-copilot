import ollama
from rag.retriever import retrieve


def clinical_agent(question):
    """
    Clinical Agent:
    Retrieves relevant medical information and generates
    a clinically focused response.
    """

    results = retrieve(question)

    context = "\n\n".join(
        [
            f"Source: {r['source']}\n{r['text']}"
            for r in results
        ]
    )

    prompt = f"""
You are a clinical research assistant.

Use ONLY the provided research context to answer the question.

Question:
{question}

Research Context:
{context}

Instructions:
- Identify the relevant clinical information.
- Explain symptoms and diagnostic methods clearly.
- Do not invent medical facts.
- If the evidence is insufficient, clearly say so.
- This is an informational response, not a medical diagnosis.

Answer:
"""

    response = ollama.chat(
        model="llama3.2:3b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return {
        "answer": response["message"]["content"],
        "sources": [r["source"] for r in results]
    }