from rag_pipeline import answer_question


question = input("\nAsk your medical question: ")


answer, sources = answer_question(question)


print("\n")
print("=" * 70)
print("RAG ANSWER")
print("=" * 70)

print(answer)


print("\n")
print("=" * 70)
print("SOURCES")
print("=" * 70)

for i, source in enumerate(sources):

    print(f"{i + 1}. {source['source']}")