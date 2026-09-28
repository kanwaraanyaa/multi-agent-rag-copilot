import os
import shutil
import tempfile

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware

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