"""
Feature preprocessing utilities.

Note: If using sklearn Pipeline, preprocessing is already handled.
This module can contain additional feature engineering if needed.
"""
from typing import List, Dict, Any


def validate_features(features: List[float], expected_length: int = 20) -> bool:
    """Validate feature vector."""
    if len(features) != expected_length:
        return False
    if any(not isinstance(f, (int, float)) for f in features):
        return False
    return True


def extract_metadata(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract metadata from raw traffic data.
    
    Example fields:
    - source_ip, dest_ip
    - source_port, dest_port
    - protocol
    - timestamp
    """
    return {
        "source_ip": raw_data.get("source_ip"),
        "dest_ip": raw_data.get("dest_ip"),
        "protocol": raw_data.get("protocol"),
    }
