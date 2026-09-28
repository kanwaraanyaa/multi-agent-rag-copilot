import faiss
import numpy as np


def create_vector_store(embeddings):

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    embeddings = np.array(embeddings).astype("float32")

    index.add(embeddings)

    print(f"FAISS index created with {index.ntotal} vectors.")

    return index


def save_vector_store(index, path="vector_db/index.faiss"):

    faiss.write_index(index, path)

    print(f"FAISS index saved to {path}")


def load_vector_store(path="vector_db/index.faiss"):

    index = faiss.read_index(path)

    print(f"FAISS index loaded with {index.ntotal} vectors.")

    return index