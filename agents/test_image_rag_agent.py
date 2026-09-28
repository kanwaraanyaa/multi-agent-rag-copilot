import os

from agents.image_agent import image_agent
from agents.image_rag_agent import image_rag_agent


# Find images automatically
image_files = [
    f for f in os.listdir("data")
    if f.lower().endswith((".jpg", ".jpeg", ".png"))
]

if not image_files:
    print("No image found in data/")
    exit()


# Automatically select the first image
image_path = os.path.join("data", image_files[0])

print(f"Using image: {image_path}")
print("\nRunning Image Agent...")


# Run Image Agent
image_result = image_agent(image_path)


if image_result["status"] == "success":

    print("\nRunning Image → RAG Agent...")

    # Run Image → RAG
    rag_result = image_rag_agent(
        image_result["predictions"]
    )

    print("\n" + "=" * 60)
    print("RETRIEVED MEDICAL EVIDENCE")
    print("=" * 60)

    for result in rag_result["results"]:

        print("\nSOURCE:", result["source"])
        print("PAGE:", result.get("page"))
        print("DISTANCE:", result["distance"])
        print("TEXT:", result["text"])

else:

    print("Image analysis failed.")