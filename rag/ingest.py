import os


DOCUMENTS_PATH = os.path.join(
    os.path.dirname(__file__),
    "documents"
)


def load_documents():
    documents = []

    for filename in os.listdir(DOCUMENTS_PATH):
        if filename.endswith(".txt"):
            file_path = os.path.join(DOCUMENTS_PATH, filename)

            with open(file_path, "r", encoding="utf-8") as file:
                content = file.read()

            documents.append({
                "filename": filename,
                "content": content
            })

    return documents