# backend/routes/products.py
from fastapi import APIRouter
from ..models.product_models import ProductIn
from ..db import products_col
from ..services.text_builder import build_product_text
from ..services.embeddings import get_embedding

router = APIRouter()

@router.post("/products")
def create_product(payload: ProductIn):
    product_dict = payload.dict()

    text = build_product_text(product_dict)
    vec = get_embedding(text)

    doc = {**product_dict, "embeddingText": text, "embedding": vec}
    result = products_col.insert_one(doc)

    return {"id": str(result.inserted_id)}
