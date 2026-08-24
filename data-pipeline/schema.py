"""
Shared schema, validation and dedup logic for the PG/Flat listings pipeline.

Every other script (ingest_listings.py, update_single_listing.py, bulk_update.py,
refresh_check.py) imports from here so the rules stay in exactly one place.
"""
import hashlib
import re
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Field definitions
# ---------------------------------------------------------------------------

# Columns the intake Excel/CSV must have. These map 1:1 to the MongoDB fields
# below (minus the operational fields, which the pipeline fills in itself).
INTAKE_COLUMNS = [
    "listing_type",       # PG / Flat / Room / Shared Room / Independent House
    "title",
    "description",
    "gender_preference",  # Male / Female / Co-ed / Family / Any
    "price_monthly",      # INR, numeric
    "deposit_amount",     # INR, numeric, 0 if none
    "availability_status",  # Available / Occupied / Coming Soon
    "available_from",     # YYYY-MM-DD, optional
    "amenities",          # comma-separated, e.g. "WiFi, Food, AC, Laundry"
    "photo_urls",         # comma-separated URLs
    "contact_name",
    "contact_number",     # 10-digit Indian mobile
    "whatsapp_number",    # optional, defaults to contact_number if blank
    "address_line",
    "locality",
    "city",
    "state",
    "pincode",             # 6-digit
    "latitude",             # optional, blank = will be geocoded later
    "longitude",            # optional
    "source",               # self_listed / field_agent / partner_broker
    "source_ref",            # e.g. agent id, submission id — optional
]

REQUIRED_COLUMNS = [
    "listing_type", "price_monthly", "availability_status",
    "contact_number", "address_line", "locality", "city", "pincode", "source",
]

ALLOWED_LISTING_TYPE = {"PG", "Flat", "Room", "Shared Room", "Independent House"}
ALLOWED_GENDER = {"Male", "Female", "Co-ed", "Family", "Any", ""}
ALLOWED_AVAILABILITY = {"Available", "Occupied", "Coming Soon"}
ALLOWED_SOURCE = {"self_listed", "field_agent", "partner_broker"}

PHONE_RE = re.compile(r"^[6-9]\d{9}$")   # Indian mobile: 10 digits, starts 6-9
PINCODE_RE = re.compile(r"^\d{6}$")

STATUS_ACTIVE = "active"
STATUS_NEEDS_REVIEW = "needs_review"
STATUS_EXPIRED = "expired"
STATUS_REMOVED = "removed"


def now_utc():
    return datetime.now(timezone.utc)


def coerce_value(v):
    """
    Best-effort type coercion for values coming out of a spreadsheet cell or a
    --set field=value CLI arg, which are always strings. Numbers should stay
    numbers in MongoDB (so price filters/sorts work on the site) — this is the
    one place that decides how a raw cell value becomes a typed Mongo value.
    """
    if v is None:
        return v
    if isinstance(v, (int, float, bool)):
        return v
    s = str(v).strip()
    if s == "":
        return s
    try:
        return int(s)
    except ValueError:
        pass
    try:
        return float(s)
    except ValueError:
        pass
    return s


def clean_phone(raw):
    """Strip spaces, dashes, +91, leading 0 — return bare 10-digit string or None."""
    if raw is None:
        return None
    digits = re.sub(r"\D", "", str(raw))
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    if digits.startswith("0") and len(digits) == 11:
        digits = digits[1:]
    return digits if PHONE_RE.match(digits) else None


def dedup_key(row):
    """
    Two rows are treated as the same listing when they share the same owner
    phone number AND land in the same locality+pincode. This catches the
    common case (same PG re-submitted, or a field agent re-visiting a
    property) without merging two different PGs run by roommates who happen
    to share a building.

    If you need looser/tighter matching later (e.g. per-building instead of
    per-locality), this is the one function to change — every script calls it.
    """
    phone = clean_phone(row.get("contact_number"))
    pincode = str(row.get("pincode") or "").strip()
    locality = str(row.get("locality") or "").strip().lower()
    address = str(row.get("address_line") or "").strip().lower()
    basis = f"{phone}|{pincode}|{locality}|{address}"
    return hashlib.sha256(basis.encode("utf-8")).hexdigest()[:24]


def _s(row, col):
    """
    String-ify a cell value the way it needs to be for validation: None
    (openpyxl's value for a genuinely blank cell) must collapse to "", not
    to the literal text "None" — str(None) == "None" is truthy and would
    silently defeat every required-field check below.
    """
    return str(row.get(col) or "").strip()


def validate_row(row, row_num=None):
    """Return a list of human-readable error strings; empty list = valid."""
    errors = []

    for col in REQUIRED_COLUMNS:
        if not _s(row, col):
            errors.append(f"missing required field '{col}'")

    listing_type = _s(row, "listing_type")
    if listing_type and listing_type not in ALLOWED_LISTING_TYPE:
        errors.append(f"listing_type '{listing_type}' not in {sorted(ALLOWED_LISTING_TYPE)}")

    gender = _s(row, "gender_preference")
    if gender and gender not in ALLOWED_GENDER:
        errors.append(f"gender_preference '{gender}' not in {sorted(ALLOWED_GENDER)}")

    availability = _s(row, "availability_status")
    if availability and availability not in ALLOWED_AVAILABILITY:
        errors.append(f"availability_status '{availability}' not in {sorted(ALLOWED_AVAILABILITY)}")

    source = _s(row, "source")
    if source and source not in ALLOWED_SOURCE:
        errors.append(f"source '{source}' not in {sorted(ALLOWED_SOURCE)}")

    phone = clean_phone(row.get("contact_number"))
    if _s(row, "contact_number") and not phone:
        errors.append(f"contact_number '{row.get('contact_number')}' is not a valid 10-digit Indian mobile number")

    pincode = _s(row, "pincode")
    if pincode and not PINCODE_RE.match(pincode):
        errors.append(f"pincode '{pincode}' must be exactly 6 digits")

    price = row.get("price_monthly")
    if price not in (None, ""):
        try:
            if float(price) <= 0:
                errors.append("price_monthly must be > 0")
        except (TypeError, ValueError):
            errors.append(f"price_monthly '{price}' is not a number")

    return errors


def to_mongo_doc(row):
    """Turn one validated intake row into the document shape stored in MongoDB."""
    amenities = [a.strip() for a in _s(row, "amenities").split(",") if a.strip()]
    photos = [p.strip() for p in _s(row, "photo_urls").split(",") if p.strip()]
    phone = clean_phone(row.get("contact_number"))
    whatsapp = clean_phone(row.get("whatsapp_number")) or phone

    def _float(v):
        try:
            return float(v)
        except (TypeError, ValueError):
            return None

    doc = {
        "dedup_key": dedup_key(row),
        "listing_type": _s(row, "listing_type"),
        "title": _s(row, "title"),
        "description": _s(row, "description"),
        "gender_preference": _s(row, "gender_preference") or "Any",
        "price_monthly": _float(row.get("price_monthly")),
        "deposit_amount": _float(row.get("deposit_amount")) or 0,
        "availability_status": _s(row, "availability_status"),
        "available_from": _s(row, "available_from") or None,
        "amenities": amenities,
        "photos": photos,
        "contact_name": _s(row, "contact_name"),
        "contact_number": phone,
        "whatsapp_number": whatsapp,
        "address": {
            "line1": _s(row, "address_line"),
            "locality": _s(row, "locality"),
            "city": _s(row, "city"),
            "state": _s(row, "state"),
            "pincode": _s(row, "pincode"),
            "lat": _float(row.get("latitude")),
            "lng": _float(row.get("longitude")),
        },
        "source": str(row.get("source", "")).strip(),
        "source_ref": str(row.get("source_ref", "")).strip(),
        "verified": False,
        "last_verified_at": None,
        "status": STATUS_ACTIVE,
    }
    return doc
