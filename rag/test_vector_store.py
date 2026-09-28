from document_loader import load_pdfs
from chunker import create_chunks
from embeddings import load_embedding_model, create_embeddings
from vector_store import create_vector_store, save_vector_store

import pickle


# 1. Load PDFs
documents = load_pdfs("data/medical_papers")

# 2. Create chunks
chunks = create_chunks(documents)

print(f"Documents: {len(documents)}")
print(f"Chunks: {len(chunks)}")


# 3. Load embedding model
model = load_embedding_model()


# 4. Create embeddings
embeddings = create_embeddings(model, chunks)

print(f"Embedding shape: {embeddings.shape}")


# 5. Create FAISS index
index = create_vector_store(embeddings)


# 6. Save FAISS index
save_vector_store(index)


# 7. Save chunks
with open("vector_db/chunks.pkl", "wb") as f:
    pickle.dump(chunks, f)

print("Chunks saved to vector_db/chunks.pkl")

print("\nVector database is ready!")