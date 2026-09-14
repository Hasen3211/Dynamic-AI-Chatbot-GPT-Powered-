from sklearn.metrics.pairwise import cosine_similarity

from rag.ingest import load_documents
from rag.embeddings import EmbeddingEngine
from config import Config


class Retriever:
    def __init__(self):
        self.documents = load_documents()

        self.embedding_engine = EmbeddingEngine()

        self.document_texts = [
            document["content"]
            for document in self.documents
        ]

        self.document_vectors = (
            self.embedding_engine.fit_transform(
                self.document_texts
            )
        )

    def retrieve(self, query):
        query_vector = self.embedding_engine.transform([query])

        similarities = cosine_similarity(
            query_vector,
            self.document_vectors
        )[0]

        ranked_indexes = similarities.argsort()[::-1]

        results = []

        for index in ranked_indexes[:Config.RAG_TOP_K]:
            if similarities[index] > 0:
                results.append({
                    "filename": self.documents[index]["filename"],
                    "content": self.documents[index]["content"],
                    "score": float(similarities[index])
                })

        return results

    def get_context(self, query):
        results = self.retrieve(query)

        if not results:
            return ""

        context_parts = []

        for result in results:
            context_parts.append(
                f"Source: {result['filename']}\n"
                f"{result['content']}"
            )

        return "\n\n".join(context_parts)