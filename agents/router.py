import ollama


def route_question(question):
    prompt = f"""
You are a routing agent for a medical research system.

Classify the user's question into one or more of these categories:

- research
- clinical
- both

Choose "research" for questions mainly about:
- research studies
- causes
- risk factors
- epidemiology
- scientific evidence
- literature

Choose "clinical" for questions mainly about:
- symptoms
- diagnosis
- diagnostic tests
- treatment
- clinical management

Choose "both" when the question requires both research
and clinical information.

Return ONLY one word:
research
clinical
both

Question:
{question}
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

    result = response["message"]["content"].strip().lower()

    if "both" in result:
        return "both"
    elif "clinical" in result:
        return "clinical"
    else:
        return "research"