from agents.clinical_agent import clinical_agent

question = "What are the major symptoms and diagnostic methods for chronic respiratory diseases?"

result = clinical_agent(question)

print("\n" + "=" * 60)
print("CLINICAL AGENT")
print("=" * 60)

print(result["answer"])

print("\nSOURCES:")
for source in result["sources"]:
    print("-", source)