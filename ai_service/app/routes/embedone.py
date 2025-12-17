# backend/routes/embed.py
from fastapi import APIRouter
from pydantic import BaseModel, Field
from bson import ObjectId
from ..db import products_col
from ..services.text_builder import build_product_text
from ..services.embeddings import get_embedding

router = APIRouter()

class ProductIdRequest(BaseModel):
    productId: str = Field(..., description="The ID of the product to embed")

@router.post("/embed-one")
def embed_one_products(request: ProductIdRequest):
    """
    Embed newly created or updated product.
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(request.productId):
            return {"error": "Invalid product ID format"}

        product = products_col.find_one({"_id": ObjectId(request.productId)})
        if not product:
            return {"error": "Product not found"}

        text = build_product_text(product)
        vec = get_embedding(text)
        products_col.update_one(
            {"_id": ObjectId(request.productId)},
            {"$set": {"embeddingText": text, "embedding": vec}},
        )

        return {"message": "Product embedding updated successfully"}
    except Exception as e:
        return {"error": str(e)}

