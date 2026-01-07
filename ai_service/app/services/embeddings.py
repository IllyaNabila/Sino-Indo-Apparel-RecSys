# backend/services/embeddings.py
from sentence_transformers import SentenceTransformer

# Initialize as None so it doesn't load on startup
_model = None

def get_model():
    global _model
    if _model is None:
        print("Loading SentenceTransformer model... (First Request)")
        _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        print("Model loaded successfully.")
    return _model

def get_embedding(text: str):
    # This will load the model only if it hasn't been loaded yet
    model = get_model()
    return model.encode(text).tolist()