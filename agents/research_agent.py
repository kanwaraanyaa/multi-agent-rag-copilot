import ollama
from rag.retriever import retrieve


def research_agent(question):
    """
    Research Agent:
    Retrieves relevant medical literature and generates
    an evidence-based response.
    """

    results = retrieve(question)

    context = "\n\n".join(
        [
            f"Source: {r['source']}\n{r['text']}"
            for r in results
        ]
    )

    prompt = f"""
You are a medical research agent.

Use ONLY the provided research context to answer the question.

Question:
{question}

Research Context:
{context}

Instructions:
- Identify the relevant evidence.
- Do not invent facts.
- Clearly state when the evidence is insufficient.
- Mention the source documents used.
- Provide a concise evidence-based response.
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
        "agent": "research_agent",
        "answer": response["message"]["content"],
        "sources": [r["source"] for r in results]
    }