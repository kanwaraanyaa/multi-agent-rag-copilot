from agents.agent_pipeline import run_pipeline


question = "What are the risk factors for COPD?"

import os

image_path = os.path.join(
    "data",
    "chest_xray.jpg"
)

if not os.path.exists(image_path):
    print("chest_xray.jpg not found in data/")
    exit()


print(f"Using image: {image_path}")

result = run_pipeline(
    question,
    image_path=image_path
)

print("\n" + "=" * 60)
print("FINAL ANSWER")
print("=" * 60)

print(result["answer"])

print("\n" + "=" * 60)
print("SOURCES")
print("=" * 60)

for source in result["sources"]:
    print("-", source)