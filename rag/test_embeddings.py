from document_loader import load_pdfs
from chunker import create_chunks
from embeddings import load_embedding_model, create_embeddings


# 1. Load PDFs
documents = load_pdfs("data/medical_papers")

# 2. Create chunks
chunks = create_chunks(documents)

print(f"\nDocuments: {len(documents)}")
print(f"Chunks: {len(chunks)}")

# 3. Load embedding model
model = load_embedding_model()

# 4. Create embeddings
embeddings = create_embeddings(model, chunks)

print("\n" + "=" * 60)
print("EMBEDDING INFORMATION")
print("=" * 60)

print("Number of embeddings:", len(embeddings))
print("Embedding dimensions:", embeddings.shape[1])

print("\nFirst embedding:")
print(embeddings[0])