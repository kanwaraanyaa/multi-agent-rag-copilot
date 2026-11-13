# Multi-Agent Agentic RAG Diagnostic Copilot

An AI-powered medical information support prototype that combines **Multi-Agent AI, Retrieval-Augmented Generation (RAG), and Chest X-ray Analysis** to provide evidence-informed responses to medical queries.

## Overview

The Multi-Agent Agentic RAG Diagnostic Copilot is designed to assist with exploring medical information by combining knowledge retrieval from medical documents with optional chest X-ray analysis.

The system uses specialized agents to process different tasks, retrieve relevant medical evidence, analyze medical images, and synthesize the available information into a consolidated response.

## Key Features

- **Multi-Agent Architecture:** Specialized components for routing, research, clinical processing, image analysis, and response synthesis.
- **Retrieval-Augmented Generation (RAG):** Retrieves relevant information from medical research documents.
- **Semantic Search:** Uses text embeddings and FAISS for similarity-based document retrieval.
- **Chest X-ray Analysis:** Integrates a pretrained DenseNet121 model through TorchXRayVision.
- **Image-to-RAG Integration:** Uses predicted image findings to retrieve related medical information.
- **LLM-Based Synthesis:** Combines relevant agent outputs into a natural-language response.
- **Modular Design:** Separates individual processing tasks for easier maintenance and improvement.

## System Architecture

```text
             User Input
          (Question + Image)
                  |
                  v
             Query Router
                  |
        +---------+----------+
        |         |          |
        v         v          v
    Research   Clinical    Image
      Agent     Agent      Agent
        |         |          |
        v         |          v
   RAG Retrieval  |    Predicted Findings
        |         |          |
        |         |          v
        |         |      Image-to-RAG
        |         |          |
        +---------+----------+
                  |
                  v
           Synthesis Agent
                  |
                  v
             Final Response
```

*The image-analysis path is optional and is used when an image is supplied.*

## Technology Stack

| Category | Technologies |
|---|---|
| Programming Language | Python |
| Backend | FastAPI, Uvicorn |
| Frontend | React, Vite, JavaScript |
| LLM | Llama 3.2 3B through Ollama |
| RAG Framework | Retrieval-Augmented Generation |
| Embeddings | Sentence Transformers |
| Vector Search | FAISS |
| Image Analysis | TorchXRayVision |
| Deep Learning Model | DenseNet121 |
| Document Processing | PyMuPDF, LangChain Text Splitters |
| Version Control | Git, GitHub |

## Project Structure

```text
multi-agent-rag-copilot/
│
├── agents/
│   ├── router.py
│   ├── research_agent.py
│   ├── clinical_agent.py
│   ├── image_agent.py
│   ├── image_rag_agent.py
│   ├── synthesis_agent.py
│   └── agent_pipeline.py
│
├── rag/
│   ├── document_loader.py
│   ├── chunker.py
│   ├── embeddings.py
│   └── retriever.py
│
├── backend/
│   ├── main.py
│   └── ingest_docs.py
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── App.jsx
│       └── App.css
│
├── data/
│   └── medical_papers/
│
├── vector_db/
│
├── requirements.txt
└── README.md
```

*Folder and file names may vary slightly depending on the final repository structure.*

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/kanwaraanyaa/diagnostic-copilot.git
cd diagnostic-copilot
```

### 2. Set up the Python environment

```bash
python3 -m venv venv
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

### 3. Start Ollama

Install Ollama and download the model:

```bash
ollama pull llama3.2:3b
```

Start Ollama using:

```bash
ollama serve
```

If Ollama is already running, you do not need to start it again.

### 4. Run the backend

Open a terminal in the project root:

```bash
python -m uvicorn backend.main:app --reload
```

Backend URL:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

### 5. Run the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

## How It Works

1. The user submits a medical question, optionally with a chest X-ray.
2. The router identifies the relevant processing path.
3. The research agent retrieves relevant medical-document passages through RAG.
4. The clinical agent processes the available clinical context.
5. If an X-ray is provided, the image agent analyzes it using the pretrained DenseNet121 model.
6. Image findings can be used to retrieve additional relevant medical evidence.
7. The synthesis agent combines the available information into a final response.

## Future Enhancements

- Improve retrieval accuracy and document coverage.
- Add stronger evidence attribution and source citations.
- Introduce confidence-aware responses and improved error handling.
- Expand image-analysis evaluation using appropriately labeled datasets.
- Improve response time and deployment scalability.
- Strengthen privacy, security, and access control.

## Disclaimer

This project is an academic research prototype developed for educational and experimental purposes.

It is not a clinically validated medical diagnostic system and must not be used as a substitute for professional medical advice, diagnosis, or treatment. AI-generated responses and image predictions may be inaccurate.

## Author

**Aanya Kanwar**

Computer Science and Engineering

GitHub: [kanwaraanyaa](https://github.com/kanwaraanyaa)
