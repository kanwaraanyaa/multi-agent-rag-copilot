from agents.research_agent import research_agent
from agents.clinical_agent import clinical_agent
from agents.synthesis_agent import synthesis_agent


question = "What are the major symptoms and risk factors for chronic respiratory diseases?"

print("\nRunning Research Agent...")
research_result = research_agent(question)

print("\nRunning Clinical Agent...")
clinical_result = clinical_agent(question)

print("\nRunning Synthesis Agent...")
result = synthesis_agent(
    question,
    research_result,
    clinical_result
)

print("\n" + "=" * 60)
print("FINAL SYNTHESIZED ANSWER")
print("=" * 60)

print(result["answer"])

print("\nSOURCES:")
for source in result["sources"]:
    print("-", source)