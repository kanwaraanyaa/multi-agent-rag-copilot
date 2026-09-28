from rag.document_loader import load_documents
from rag.chunker import create_chunks
from rag.embeddings import load_embedding_model
from rag.vector_store import create_vector_store, save_vector_store

import pickle
import os


print("\n" + "=" * 60)
print("BUILDING RAG INDEX")
print("=" * 60)

# 1. Load PDF pages
print("\n[1] Loading documents...")
documents = load_documents()

print(f"Loaded {len(documents)} pages.")

# 2. Create chunks
print("\n[2] Creating chunks...")
chunks = create_chunks(documents)

print(f"Created {len(chunks)} chunks.")

# 3. Save chunks with metadata
os.makedirs("vector_db", exist_ok=True)

with open("vector_db/chunks.pkl", "wb") as f:
    pickle.dump(chunks, f)

print("Chunks saved to vector_db/chunks.pkl")

# 4. Create embeddings
print("\n[3] Creating embeddings...")
model = load_embedding_model()

embeddings = model.encode(
    [chunk["text"] for chunk in chunks],
    convert_to_numpy=True,
    show_progress_bar=True
)

# 5. Create FAISS index
print("\n[4] Creating FAISS index...")
index = create_vector_store(embeddings)

# 6. Save FAISS index
save_vector_store(index)

print("\n" + "=" * 60)
print("INDEX BUILD COMPLETE")
print("=" * 60)