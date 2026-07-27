"""
Lightweight, dependency-free language hinting.

This does NOT translate or store anything — it just looks at the
script and a handful of common Roman Urdu / Hindi function words so
the system prompt can tell the model which register to mirror. The
model itself does the actual language understanding; this is only a
cheap signal to bias tone, not a hard classifier.
"""
import re

URDU_ARABIC_SCRIPT = re.compile(r"[\u0600-\u06FF\u0750-\u077F]")
DEVANAGARI_SCRIPT = re.compile(r"[\u0900-\u097F]")

# A small set of very common Roman Urdu / Hindustani function words and
# fillers. Presence of a few of these alongside English strongly
# suggests Roman Urdu / Hinglish rather than plain English.
ROMAN_URDU_MARKERS = {
    "yaar", "kya", "hai", "hain", "nahi", "nahin", "acha", "theek",
    "matlab", "bhai", "chalo", "kar", "karo", "karna", "raha", "rahi",
    "rahe", "mera", "meri", "mere", "tumhara", "aap", "kaise", "kyun",
    "abhi", "bilkul", "shukriya", "zabardast", "bohot", "bahut",
}


def detect_language_hint(text: str) -> str:
    """Return one of: 'urdu', 'hindi', 'roman_urdu', 'english', 'mixed'."""
    if not text or not text.strip():
        return "english"

    if URDU_ARABIC_SCRIPT.search(text):
        return "urdu"
    if DEVANAGARI_SCRIPT.search(text):
        return "hindi"

    words = re.findall(r"[a-zA-Z']+", text.lower())
    if not words:
        return "english"

    marker_hits = sum(1 for w in words if w in ROMAN_URDU_MARKERS)
    ratio = marker_hits / max(len(words), 1)

    if marker_hits >= 2 or ratio > 0.15:
        return "roman_urdu"
    if marker_hits == 1 and len(words) <= 6:
        return "mixed"
    return "english"
