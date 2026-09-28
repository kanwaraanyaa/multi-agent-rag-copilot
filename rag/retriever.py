import pickle
import numpy as np

from rag.embeddings import load_embedding_model
from rag.vector_store import load_vector_store


def load_chunks(path="vector_db/chunks.pkl"):
    """Load saved document chunks."""

    with open(path, "rb") as f:
        chunks = pickle.load(f)

    return chunks


def retrieve(query, top_k=5):
    """Retrieve the most relevant document chunks for a query."""

    # Load embedding model
    model = load_embedding_model()

    # Load FAISS index
    index = load_vector_store()

    # Load saved chunks
    chunks = load_chunks()

    # Convert the user's question into an embedding
    query_embedding = model.encode(
        [query],
        convert_to_numpy=True
    )

    query_embedding = np.asarray(
        query_embedding,
        dtype="float32"
    )

    # Search FAISS
    distances, indices = index.search(
        query_embedding,
        top_k
    )

    results = []

    for distance, index_id in zip(
        distances[0],
        indices[0]
    ):
        # FAISS can return -1 when no valid result exists
        if index_id < 0 or index_id >= len(chunks):
            continue

        chunk = chunks[index_id]

        results.append({
            "text": chunk.get("text", ""),
            "source": chunk.get("source", "Unknown"),
            "page": chunk.get("page"),
            "distance": float(distance)
        })

    return results