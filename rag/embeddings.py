from sentence_transformers import SentenceTransformer


MODEL_NAME = "all-MiniLM-L6-v2"


_model = None


def load_embedding_model():
    global _model

    if _model is None:
        print("Loading embedding model...")
        _model = SentenceTransformer(MODEL_NAME)
        print("Embedding model loaded.")

    return _model


def create_embeddings(model, chunks):

    texts = [chunk["text"] for chunk in chunks]

    print(f"Creating embeddings for {len(texts)} chunks...")

    embeddings = model.encode(
        texts,
        convert_to_numpy=True,
        show_progress_bar=True
    )

    print("Embeddings created.")

    return embeddings