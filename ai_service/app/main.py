from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict
from .routes.products import router as products_router
from .routes.embed import router as embed_router
from .routes.embedone import router as embed_one_router
from .routes.recommend import router as recommend_router

from .models.model import ai_model
from .db import client # Import the client

app = FastAPI(
    title="AI Service",
    version="1.0.0",
    description="FastAPI microservice for AI inference",
)

@app.on_event("startup")
def startup_db_client():
    try:
        client.admin.command('ping')
        print("✅ Sucessfully connected to MongoDB.")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")

app.include_router(products_router, prefix="/api")
app.include_router(embed_router, prefix="/api")
app.include_router(embed_one_router, prefix="/api")
app.include_router(recommend_router, prefix="/api")

# CORS: allow Next.js dev + prod domains
origins= [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # "https://your-production-domain.com", # add later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    query: str
    # you can add other fields used by your ai logic
    # e.g. lat: float, userId: str, etc.

class PredictResponse(BaseModel):
    prediction: Dict[str, Any]

@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest) -> PredictResponse:
    result = ai_model.predict(req.dict())
    return PredictResponse(prediction=result)

@app.get("/health")
def health():
    return {"status": "ok"}