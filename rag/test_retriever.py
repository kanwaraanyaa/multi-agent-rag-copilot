from rag.retriever import retrieve


query = "What are the major risk factors for chronic respiratory diseases?"


results = retrieve(
    query,
    top_k=5
)


print("\n")
print("=" * 70)
print("USER QUESTION")
print("=" * 70)

print(query)


for i, result in enumerate(results):

    print("\n")
    print("=" * 70)
    print(f"RESULT {i + 1}")
    print("=" * 70)

    print("SOURCE:", result["source"])
    print("DISTANCE:", result["distance"])
    print("PAGE:", result["page"])

    print("\nTEXT:")
    print(result["text"])