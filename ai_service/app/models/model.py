from typing import Dict, Any

class DummyAIModule:
    """
    Replace this with your real model.
    E.g., load a joblib model, HF model, etc.
    """

    def __init__(self) -> None:
        # Example: load from file
        # import joblib
        # self.model = joblib.load("models/spread_model.pkl")
        pass

    def predict(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Implement your own logic here.
        For demo, we'll just echo back with a fake score.
        """

        query = payload.get("query", "")
        score = len(query) / 100.0 # fake "confidence"
        return {
            "query": query,
            "score": score,
            "label": "high-risk" if score > 0.3 else "low-risk",
        }
    
# Global singleton model (loaded once at startup)
ai_model = DummyAIModule()