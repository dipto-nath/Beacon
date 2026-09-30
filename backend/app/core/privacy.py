"""
Privacy utilities: Anonymization, k-anonymity enforcement, data masking.
"""
from typing import Any, Dict, List, Optional, Set
from collections import defaultdict

from app.config import settings


K_ANONYMITY_THRESHOLD = settings.K_ANONYMITY_THRESHOLD


def enforce_k_anonymity(
    data: List[Dict[str, Any]],
    group_by_fields: List[str],
    threshold: int = K_ANONYMITY_THRESHOLD,
) -> List[Dict[str, Any]]:
    """
    Enforce k-anonymity on aggregated data.
    Removes groups with count < threshold.
    """
    if not data:
        return []

    # Group data by the specified fields
    groups = defaultdict(list)
    for row in data:
        key = tuple(row.get(field) for field in group_by_fields)
        groups[key].append(row)

    # Filter groups meeting threshold
    result = []
    for group_rows in groups.values():
        if len(group_rows) >= threshold:
            result.extend(group_rows)
        # Silently drop groups below threshold

    return result


def add_privacy_metadata(
    data: List[Dict[str, Any]],
    total_count: int,
    suppressed_count: int = 0,
) -> Dict[str, Any]:
    """Add privacy metadata to analytics responses."""
    return {
        "data": data,
        "privacy": {
            "note": "Results based on aggregated data. Individual students are not identifiable.",
            "min_group_size": K_ANONYMITY_THRESHOLD,
            "total_records": total_count,
            "suppressed_cohorts": suppressed_count,
            "threshold_met": suppressed_count == 0,
        },
    }


def mask_pii_in_logs(data: Dict[str, Any]) -> Dict[str, Any]:
    """Mask PII fields in log output."""
    masked = data.copy()
    pii_fields = {"email", "first_name", "last_name", "student_id", "ip_address", "user_agent"}

    for field in pii_fields:
        if field in masked:
            value = masked[field]
            if isinstance(value, str) and value:
                if field == "email":
                    parts = value.split("@")
                    masked[field] = f"{parts[0][:1]}***@***.{parts[1].split('.')[-1]}" if len(parts) == 2 else "***@***.***"
                elif field in {"first_name", "last_name"}:
                    masked[field] = f"{value[0]}***" if value else "***"
                elif field == "student_id":
                    masked[field] = f"{value[:2]}***{value[-2:]}" if len(value) > 4 else "****"
                else:
                    masked[field] = "***"

    return masked


def anonymize_student_data(student_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create anonymized version of student data for analytics."""
    return {
        "id": "ANONYMIZED",
        "program": student_data.get("program"),
        "year": student_data.get("year"),
        # No direct identifiers
    }


def apply_differential_privacy(
    value: float,
    epsilon: float = 1.0,
    sensitivity: float = 1.0,
) -> float:
    """
    Apply Laplace noise for differential privacy.
    Used for small group analytics (10-20 records).
    """
    import random
    import math

    scale = sensitivity / epsilon
    noise = random.uniform(-scale, scale) * math.log(1 / random.random())
    return value + noise


def suppress_small_groups(
    aggregates: Dict[str, Any],
    count_field: str = "count",
    threshold: int = K_ANONYMITY_THRESHOLD,
) -> Dict[str, Any]:
    """Suppress aggregate results for small groups."""
    if aggregates.get(count_field, 0) < threshold:
        return {
            "suppressed": True,
            "reason": f"Group size below privacy threshold ({threshold})",
        }
    return aggregates