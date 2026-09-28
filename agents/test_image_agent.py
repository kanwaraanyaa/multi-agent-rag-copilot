from agents.image_agent import image_agent


image_path = "data/test_image.jpg"

result = image_agent(image_path)


print("\n" + "=" * 60)
print("IMAGE AGENT")
print("=" * 60)


if result["status"] == "success":

    print("\nIMAGE ANALYSIS RESULTS:\n")

    for pathology, score in result["predictions"].items():

        print(
            f"{pathology:<30} {score:.4f}"
        )

else:

    print("ERROR:")
    print(result["error"])