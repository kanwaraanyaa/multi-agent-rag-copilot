import ollama


def synthesis_agent(
    question,
    research_result=None,
    clinical_result=None,
    image_rag_result=None
):
    """
    Combines outputs from Research Agent, Clinical Agent,
    and Image → RAG Agent into one final evidence-based response.

     AI Model Predictions are generated deterministically in Python so
    the LLM cannot accidentally omit them.
    """

    # ============================================================
    # RESEARCH AGENT
    # ============================================================

    if research_result:
        research_answer = research_result.get("answer", "")
        research_sources = research_result.get("sources", [])
    else:
        research_answer = "No research evidence was provided."
        research_sources = []

    # ============================================================
    # CLINICAL AGENT
    # ============================================================

    if clinical_result:
        clinical_answer = clinical_result.get("answer", "")
        clinical_sources = clinical_result.get("sources", [])
    else:
        clinical_answer = "No clinical evidence was provided."
        clinical_sources = []

    # ============================================================
    # IMAGE → RAG AGENT
    # ============================================================

    image_findings = []
    image_evidence = ""

    if image_rag_result:

        # Explicit findings created by image_rag_agent
        image_findings = image_rag_result.get(
            "findings",
            []
        )

        results = image_rag_result.get(
            "results",
            []
        )

        for result in results:

            image_evidence += f"""
Image Finding:
{result.get("image_finding", "Unknown")}

Image Score:
{result.get("image_score", "Unknown")}

Medical Evidence:
{result.get("text", "")}

Source:
{result.get("source", "Unknown")}

"""

    # ============================================================
    # BUILD AI MODEL PREDICTIONS DIRECTLY
    # ============================================================

    ai_predictions_text = ""

    for finding in image_findings:

        condition = finding.get(
            "image_finding",
            "Unknown"
        )

        score = finding.get(
            "image_score",
            "Unknown"
        )

        ai_predictions_text += (
            f"- {condition}: {score}\n"
        )

    if not ai_predictions_text:

        ai_predictions_text = (
            "No AI model predictions were generated."
        )

    # ============================================================
    # LLM PROMPT
    # ============================================================

    prompt = f"""
You are the Synthesis Agent in a medical AI research system.

Provide a concise evidence-based interpretation of the
information supplied by the other agents.

IMPORTANT RULES:

- Use ONLY the information provided below.
- Do NOT invent medical facts.
- Do NOT make a definitive diagnosis.
- AI image predictions are NOT confirmed diagnoses.
- Do NOT infer the cause of an image finding unless the
  provided evidence explicitly supports that connection.
- Do NOT recommend treatment unless treatment information
  is explicitly provided.
- If evidence is insufficient, clearly say so.

QUESTION:
{question}

============================================================
RESEARCH AGENT
============================================================

{research_answer}

Research Sources:
{research_sources}

============================================================
CLINICAL AGENT
============================================================

{clinical_answer}

Clinical Sources:
{clinical_sources}

============================================================
IMAGE → RAG MEDICAL EVIDENCE
============================================================

{image_evidence}

============================================================
TASK
============================================================

Write ONLY the following three sections:

2. Relevant Medical Evidence

Summarize the medical evidence retrieved by the system.

3. Interpretation / Clinical Significance

Explain what can and cannot be concluded from the provided
evidence.

Do NOT invent causal relationships.

If evidence is insufficient, state:

"Insufficient evidence to determine clinical significance."

4. Important Uncertainty or Limitations

State that AI image predictions are not confirmed diagnoses
and mention relevant limitations.

Do not create an AI Model Predictions section.
The AI Model Predictions section is generated separately by Python.
"""

    # ============================================================
    # CALL OLLAMA
    # ============================================================

    response = ollama.chat(
        model="llama3.2:3b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    generated_text = response["message"]["content"]

    # ============================================================
    # COLLECT SOURCES
    # ============================================================

    image_sources = []

    if image_rag_result:

        for result in image_rag_result.get(
            "results",
            []
        ):

            source = result.get("source")

            if source:
                image_sources.append(source)

    # Remove duplicates while preserving order
    all_sources = list(
        dict.fromkeys(
            research_sources
            + clinical_sources
            + image_sources
        )
    )

    # ============================================================
    # BUILD FINAL ANSWER
    # ============================================================

    final_answer = f"""
1. AI Model Predictions

{ai_predictions_text}

{generated_text}

5. Sources

"""

    for source in all_sources:
        final_answer += f"- {source}\n"

    # ============================================================
    # RETURN
    # ============================================================

    return {
        "answer": final_answer.strip(),
        "sources": all_sources
    }