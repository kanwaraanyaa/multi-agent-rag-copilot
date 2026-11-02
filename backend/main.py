import os
import shutil
import tempfile
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Any
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Your existing imports continue below:
from agents.agent_pipeline import run_pipeline


app = FastAPI(
    title="Multi-Agent Medical AI Copilot",
    description="Agentic RAG medical research and X-ray analysis system",
    version="1.0.0"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/")
def root():

    return {
        "status": "online",
        "message": "Multi-Agent Medical AI Copilot API"
    }


# --------------------------------------------------
# Analyze Case
# --------------------------------------------------

@app.post("/analyze")
async def analyze_case(
    question: str = Form(...),
    image: UploadFile | None = File(None)
):

    image_path = None

    try:

        # ------------------------------------------
        # Save uploaded image temporarily
        # ------------------------------------------

        if image:

            suffix = os.path.splitext(
                image.filename
            )[1]

            temp_file = tempfile.NamedTemporaryFile(
                delete=False,
                suffix=suffix
            )

            image_path = temp_file.name

            with open(image_path, "wb") as buffer:

                shutil.copyfileobj(
                    image.file,
                    buffer
                )

            temp_file.close()

        # ------------------------------------------
        # Run your existing multi-agent pipeline
        # ------------------------------------------

        result = run_pipeline(
            question=question,
            image_path=image_path
        )

        # ------------------------------------------
        # Return result to frontend
        # ------------------------------------------

        return {
            "status": "success",
            "question": question,
            "route": result.get("route"),
            "answer": result.get("answer"),
            "sources": result.get("sources", []),
            "image_findings": result.get(
                "image_findings",
                []
            ),
            "image_evidence": result.get(
                "image_evidence",
                []
            )
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }

    finally:

        # ------------------------------------------
        # Delete temporary uploaded image
        # ------------------------------------------

        if image_path and os.path.exists(image_path):

            os.remove(image_path)


# Ensure app is initialized (if not already present at top of main.py)
# app = FastAPI()

# 1. Define the Pydantic data model for the chat request
class ChatRequest(BaseModel):
    question: str
    initial_question: str
    findings: List[Any]
    synthesis: str
    history: List[Any]

# 2. Add the /chat endpoint route
@app.post("/chat")
async def clinical_chat(req: ChatRequest):
    # Construct context from initial case analysis
    context_summary = f"Case Question: {req.initial_question}\nFindings: {req.findings}"
    
    # Example logic: replace this with your LLM / Synthesis Agent invocation
    reply = (
        f"Regarding '{req.question}': Based on the case findings "
        f"({len(req.findings)} detected abnormal region(s)), clinicians should correlate "
        f"with patient history, order targeted inflammatory panels, or perform a lateral chest X-ray view."
    )
    
    return {"reply": reply}            