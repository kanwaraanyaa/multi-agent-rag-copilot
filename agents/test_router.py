from agents.router import route_question


questions = [
    "What are the risk factors for COPD?",
    "What are the symptoms and diagnostic methods for COPD?",
    "What are the causes, symptoms and diagnosis of chronic respiratory diseases?"
]

for question in questions:
    result = route_question(question)

    print("\nQuestion:", question)
    print("Route:", result)