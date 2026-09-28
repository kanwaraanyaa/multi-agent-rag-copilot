from agents.router import route_question
from agents.research_agent import research_agent
from agents.clinical_agent import clinical_agent
from agents.image_agent import image_agent
from agents.image_rag_agent import image_rag_agent
from agents.synthesis_agent import synthesis_agent


def run_pipeline(question, image_path=None):

    print("\n" + "=" * 60)
    print("MULTI-AGENT MEDICAL AI PIPELINE")
    print("=" * 60)

    # --------------------------------------------------
    # 1. ROUTER
    # --------------------------------------------------

    route = route_question(question)

    print(f"\nROUTER DECISION: {route}")

    research_result = None
    clinical_result = None
    image_result = None
    image_rag_result = None

    # --------------------------------------------------
    # 2. RESEARCH AGENT
    # --------------------------------------------------

    if route in ["research", "both"]:

        print("\nRunning Research Agent...")

        research_result = research_agent(question)

    # --------------------------------------------------
    # 3. CLINICAL AGENT
    # --------------------------------------------------

    if route in ["clinical", "both"]:

        print("\nRunning Clinical Agent...")

        clinical_result = clinical_agent(question)

    # --------------------------------------------------
    # 4. IMAGE AGENT
    # --------------------------------------------------

    if image_path:

        print("\nRunning Image Agent...")

        image_result = image_agent(image_path)

        if image_result["status"] == "success":

            print("\nRunning Image → RAG Agent...")

            image_rag_result = image_rag_agent(
                image_result["predictions"]
            )

            print(
                f"\nRetrieved medical evidence: "
                f"{len(image_rag_result.get('results', []))}"
            )

        else:

            print("\nImage analysis failed.")

    # --------------------------------------------------
    # 5. DEFAULT RESULTS
    # --------------------------------------------------

    if research_result is None:

        research_result = {
            "answer": "Research Agent was not required.",
            "sources": []
        }

    if clinical_result is None:

        clinical_result = {
            "answer": "Clinical Agent was not required.",
            "sources": []
        }

    # --------------------------------------------------
    # 6. SYNTHESIS AGENT
    # --------------------------------------------------

    print("\nRunning Synthesis Agent...")

    final_result = synthesis_agent(
        question=question,
        research_result=research_result,
        clinical_result=clinical_result,
        image_rag_result=image_rag_result
    )

    # --------------------------------------------------
    # 7. ADD PIPELINE METADATA
    # --------------------------------------------------

    final_result["route"] = route

    if image_result and image_result["status"] == "success":

        final_result["image_findings"] = [
            {
                "finding": condition,
                "score": float(score)
            }
            for condition, score
            in image_result["predictions"].items()
        ]

    else:

        final_result["image_findings"] = []

    if image_rag_result:

        final_result["image_evidence"] = (
            image_rag_result.get("results", [])
        )

    else:

        final_result["image_evidence"] = []

    return final_result