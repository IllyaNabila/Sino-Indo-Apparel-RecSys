# backend/routes/embed.py
from fastapi import APIRouter
from ..db import products_col
from ..services.text_builder import build_product_text
from ..services.embeddings import get_embedding

router = APIRouter()

@router.post("/embed-all")
def embed_all_products():
    """
    Embed products that dont yet have an embedding.
    """
    cursor = products_col.find({"embedding": {"$exists": False}})
    count = 0

    for doc in cursor:
        text = build_product_text(doc)
        vec = get_embedding(text)
        products_col.update_one(
            {"_id": doc["_id"]},
            {"$set": {"embeddingText": text, "embedding": vec}},
        )
        count += 1

    return {"updated": count}
