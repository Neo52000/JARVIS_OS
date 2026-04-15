"""Vector memory store — ChromaDB."""
import uuid
import logging
from datetime import datetime
import chromadb
from chromadb.config import Settings as ChromaSettings
from config import settings

log = logging.getLogger("jarvis.memory")

_client: chromadb.ClientAPI | None = None


def _get_client() -> chromadb.ClientAPI:
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(
            path=str(settings.CHROMA_DIR),
            settings=ChromaSettings(anonymized_telemetry=False),
        )
    return _client


def get_collection(name: str = "jarvis_memory"):
    return _get_client().get_or_create_collection(name)


def store(text: str, metadata: dict | None = None, collection: str = "jarvis_memory") -> str:
    """Store a text with metadata. Returns the document ID."""
    col = get_collection(collection)
    doc_id = str(uuid.uuid4())[:8]
    meta = metadata or {}
    meta["timestamp"] = datetime.now().isoformat()
    col.add(documents=[text], metadatas=[meta], ids=[doc_id])
    log.info(f"Stored doc {doc_id} in {collection}")
    return doc_id


def search(query: str, n_results: int = 5, collection: str = "jarvis_memory") -> list[dict]:
    """Semantic search. Returns list of {id, text, metadata, distance}."""
    col = get_collection(collection)
    if col.count() == 0:
        return []
    results = col.query(query_texts=[query], n_results=min(n_results, col.count()))
    output = []
    for i in range(len(results["ids"][0])):
        output.append({
            "id": results["ids"][0][i],
            "text": results["documents"][0][i],
            "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
            "distance": results["distances"][0][i] if results["distances"] else None,
        })
    return output


def get_all(collection: str = "jarvis_memory", limit: int = 50) -> list[dict]:
    """Get all stored documents."""
    col = get_collection(collection)
    if col.count() == 0:
        return []
    results = col.get(limit=limit)
    output = []
    for i in range(len(results["ids"])):
        output.append({
            "id": results["ids"][i],
            "text": results["documents"][i],
            "metadata": results["metadatas"][i] if results["metadatas"] else {},
        })
    return output


def delete(doc_id: str, collection: str = "jarvis_memory"):
    """Delete a document by ID."""
    col = get_collection(collection)
    col.delete(ids=[doc_id])
    log.info(f"Deleted doc {doc_id} from {collection}")
