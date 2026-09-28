from agents.research_agent import research_agent


question = "What are the major risk factors for chronic respiratory diseases?"

result = research_agent(question)

print("\n" + "=" * 60)
print("RESEARCH AGENT")
print("=" * 60)

print(result["answer"])

print("\nSOURCES:")
for source in result["sources"]:
    print("-", source)