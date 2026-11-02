from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings
import os

DATA_PATH = "backend/data/pdf_docs"
DB_PATH = "backend/data/chroma_db"

def build_vector_store():
    print(f"Loading PDFs from: {os.path.abspath(DATA_PATH)}")
    loader = PyPDFDirectoryLoader(DATA_PATH)
    documents = loader.load()

    if not documents:
        print(f"No PDFs found in {os.path.abspath(DATA_PATH)}.")
        return

    print(f"Loaded {len(documents)} document pages.")

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    chunks = text_splitter.split_documents(documents)
    print(f"Split into {len(chunks)} chunk(s).")

    # Use Ollama local embeddings
    embeddings = OllamaEmbeddings(model="nomic-embed-text")

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=DB_PATH
    )
    print(f"Successfully embedded and saved to '{DB_PATH}'!")

if __name__ == "__main__":
    build_vector_store()