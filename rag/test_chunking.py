from document_loader import load_pdfs
from chunker import create_chunks


documents = load_pdfs("data/medical_papers")

chunks = create_chunks(documents)

print(f"\nNumber of documents: {len(documents)}")
print(f"Number of chunks: {len(chunks)}")

print("\n" + "=" * 60)
print("FIRST CHUNK")
print("=" * 60)

print("SOURCE:", chunks[0]["source"])
print("\nTEXT:")
print(chunks[0]["text"])

print("\n" + "=" * 60)
print("SECOND CHUNK")
print("=" * 60)

print("SOURCE:", chunks[1]["source"])
print("\nTEXT:")
print(chunks[1]["text"])