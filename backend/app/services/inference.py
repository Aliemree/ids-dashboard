import joblib
import numpy as np
from pathlib import Path
from typing import Tuple, Optional


class InferenceService:
    """ML inference service for anomaly detection."""
    
    def __init__(self, model_path: str):
        """Load the ML pipeline from disk."""
        self.model_path = Path(model_path)
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model not found at {model_path}")
        
        self.pipeline = joblib.load(self.model_path)
        print(f"✓ Model loaded from {model_path}")
    
    def predict(self, features: list[float]) -> Tuple[int, Optional[float]]:
        """
        Run inference on feature vector.
        
        Args:
            features: List of numerical features
            
        Returns:
            (label, score) where:
                - label: 0 = normal, 1 = anomaly
                - score: anomaly score (higher = more anomalous)
        """
        # Convert to numpy array
        X = np.array([features], dtype=float)
        
        # Get prediction (IsolationForest returns 1 for normal, -1 for anomaly)
        raw_prediction = self.pipeline.predict(X)[0]
        
        # Normalize to 0/1 (0 = normal, 1 = anomaly)
        label = 0 if raw_prediction == 1 else 1
        
        # Get anomaly score if available
        score = None
        if hasattr(self.pipeline, "decision_function"):
            # IsolationForest: negative scores = anomalies
            raw_score = float(self.pipeline.decision_function(X)[0])
            # Invert so higher = more anomalous
            score = -raw_score
        elif hasattr(self.pipeline, "score_samples"):
            raw_score = float(self.pipeline.score_samples(X)[0])
            score = -raw_score
        
        return label, score
