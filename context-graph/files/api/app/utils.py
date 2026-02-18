"""Shared utilities for the Knowledge Graph API."""


def normalize_label(value) -> str:
    """Extract first label from AGE labels() list.

    AGE returns labels as a list (e.g. ['Concept']). This helper
    normalises that to a plain string, handling both list and scalar forms.
    """
    if isinstance(value, list):
        return value[0] if value else "Unknown"
    return str(value) if value else "Unknown"
