import os
import fitz


def load_documents(data_path="data/medical_papers"):

    documents = []

    for filename in os.listdir(data_path):

        if filename.lower().endswith(".pdf"):

            pdf_path = os.path.join(data_path, filename)

            doc = fitz.open(pdf_path)

            for page_number, page in enumerate(doc):

                text = page.get_text()

                if text.strip():

                    documents.append({
                        "text": text,
                        "source": filename,
                        "page": page_number + 1
                    })

            doc.close()

    return documents