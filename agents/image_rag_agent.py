from rag.retriever import retrieve


def image_rag_agent(predictions, top_k=3):
    """
    Takes image-model predictions, selects the strongest findings,
    retrieves medical evidence for each finding, and preserves
    the original image findings and scores.
    """

    all_results = []
    image_findings = []

    # Select up to 5 findings with score >= 0.5
    top_findings = [
        (condition, score)
        for condition, score in predictions.items()
        if score >= 0.5
    ][:5]

    for condition, score in top_findings:

        # Preserve the image finding separately
        image_findings.append({
            "image_finding": condition,
            "image_score": float(score)
        })

        query = (
            f"{condition} chest X-ray "
            f"clinical findings diagnosis"
        )

        print("\nIMAGE FINDING:", condition)
        print("RAG QUERY:", query)

        # Retrieve medical evidence
        results = retrieve(
            query,
            top_k=top_k
        )

        # Attach image information to every retrieved result
        for result in results:

            result["image_finding"] = condition
            result["image_score"] = float(score)

            all_results.append(result)

    return {
        "findings": image_findings,
        "results": all_results
    }