from langchain_text_splitters import RecursiveCharacterTextSplitter


def create_chunks(documents):

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150
    )

    chunks = []

    for document in documents:

        split_texts = splitter.split_text(document["text"])

        for text in split_texts:

            chunks.append({
                "text": text,
                "source": document["source"],
                "page": document.get("page")
            })

    return chunks