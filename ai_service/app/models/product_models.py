from pydantic import BaseModel, Field
from typing import List, Optional

class ProductIn(BaseModel):
    name: str
    role: str
    material: str
    category: str
    description: str
    tags: List[str] = Field(default_factory=list)

class ProductInDB(ProductIn):
    id: str
    embeddingText: Optional[str] = None
    embedding: Optional[List[float]] = None
