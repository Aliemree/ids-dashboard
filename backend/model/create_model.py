"""
Demo script to create a sample Isolation Forest pipeline.
Replace this with your actual trained model.
"""
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import joblib


def create_demo_pipeline(n_features=20, contamination=0.1):
    """
    Create a demo Isolation Forest pipeline.
    
    Args:
        n_features: Number of features expected
        contamination: Expected proportion of anomalies
    """
    print(f"Creating demo pipeline with {n_features} features...")
    
    # Create pipeline: Scaler + IsolationForest
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('model', IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100
        ))
    ])
    
    # Generate synthetic training data
    # Normal traffic: mean=0, std=1
    normal_data = np.random.randn(1000, n_features)
    
    # Anomalous traffic: shifted distribution
    anomaly_data = np.random.randn(100, n_features) * 2 + 3
    
    # Combine
    X_train = np.vstack([normal_data, anomaly_data])
    
    # Fit pipeline
    print("Training model...")
    pipeline.fit(X_train)
    
    # Test predictions
    test_normal = np.random.randn(1, n_features)
    test_anomaly = np.random.randn(1, n_features) * 2 + 3
    
    pred_normal = pipeline.predict(test_normal)[0]
    pred_anomaly = pipeline.predict(test_anomaly)[0]
    score_normal = pipeline.decision_function(test_normal)[0]
    score_anomaly = pipeline.decision_function(test_anomaly)[0]
    
    print(f"\nTest results:")
    print(f"  Normal sample: prediction={pred_normal}, score={score_normal:.4f}")
    print(f"  Anomaly sample: prediction={pred_anomaly}, score={score_anomaly:.4f}")
    print(f"  (IsolationForest: 1=normal, -1=anomaly)")
    
    return pipeline


if __name__ == "__main__":
    # Create and save pipeline
    pipeline = create_demo_pipeline(n_features=20, contamination=0.1)
    
    output_path = "pipeline.joblib"
    joblib.dump(pipeline, output_path)
    print(f"\n✓ Pipeline saved to {output_path}")
    print(f"  File size: {joblib.os.path.getsize(output_path) / 1024:.2f} KB")
    
    # Verify loading
    loaded = joblib.load(output_path)
    test = np.random.randn(1, 20)
    pred = loaded.predict(test)
    print(f"\n✓ Pipeline loaded and tested successfully")
    print(f"  Test prediction: {pred[0]}")
