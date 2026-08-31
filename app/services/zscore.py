import os
import json
import math
import logging
from typing import Dict, Optional, Any

logger = logging.getLogger(__name__)

# Path to bundled WHO LMS reference tables
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
WHO_LMS_FILE = os.path.join(DATA_DIR, "who_lms_reference.json")

_WHO_LMS_TABLES: Optional[Dict[str, Any]] = None


def get_who_lms_tables() -> Dict[str, Any]:
    """
    Load and return the bundled WHO LMS reference tables into memory (singleton).
    Tables contain authentic WHO Child Growth Standards (0-5 years) and
    WHO Growth Reference 2007 (5-19 years) parameters.
    """
    global _WHO_LMS_TABLES
    if _WHO_LMS_TABLES is None:
        if not os.path.exists(WHO_LMS_FILE):
            raise FileNotFoundError(
                f"WHO LMS reference data file not found at: {WHO_LMS_FILE}"
            )
        try:
            with open(WHO_LMS_FILE, "r", encoding="utf-8") as f:
                _WHO_LMS_TABLES = json.load(f)
            logger.info("Successfully loaded official WHO LMS growth reference tables.")
        except Exception as e:
            logger.error(f"Failed to load WHO LMS tables: {str(e)}")
            raise
    return _WHO_LMS_TABLES


def normalize_gender(gender: str) -> str:
    """Normalize input gender string to 'M' or 'F'."""
    if not gender:
        return "M"
    g = str(gender).strip().upper()
    if g in ("M", "MALE", "BOY", "BOYS", "1"):
        return "M"
    if g in ("F", "FEMALE", "GIRL", "GIRLS", "2"):
        return "F"
    # Default non-binary or unstated to M with standard baseline
    return "M"


def compute_lms_zscore(measurement: float, l: float, m: float, s: float) -> float:
    """
    Compute WHO Z-score from physical measurement using the LMS Box-Cox method.
    
    Formula:
        If L != 0:
            Z = ((measurement / M)^L - 1) / (L * S)
        If L == 0:
            Z = ln(measurement / M) / S
    """
    if measurement <= 0 or m <= 0 or s <= 0:
        raise ValueError("Measurement, Median (M), and S must all be strictly positive.")

    ratio = measurement / m
    if abs(l) > 1e-7:
        z = (math.pow(ratio, l) - 1.0) / (l * s)
    else:
        z = math.log(ratio) / s

    return round(z, 2)


def calculate_zscores(
    age_months: int,
    gender: str,
    height_cm: float,
    weight_kg: float,
) -> Dict[str, Optional[float]]:
    """
    Compute WHO Z-scores for height-for-age (HAZ), weight-for-age (WAZ), and BMI-for-age (BAZ)
    using the official WHO LMS reference datasets loaded from the bundled data file.

    Parameters:
        age_months (int): Age of child in completed months (0 to 228).
        gender (str): Gender of child ('M'/'F').
        height_cm (float): Measured height/length in centimeters.
        weight_kg (float): Measured weight in kilograms.

    Returns:
        Dict[str, Optional[float]]: {
            "height_for_age_z": float,
            "weight_for_age_z": Optional[float],  # None if age > 120 months (10 years)
            "bmi_for_age_z": float
        }
    """
    if height_cm <= 0:
        raise ValueError(f"Height must be positive, got {height_cm}")
    if weight_kg <= 0:
        raise ValueError(f"Weight must be positive, got {weight_kg}")
    if age_months < 0:
        raise ValueError(f"Age in months cannot be negative, got {age_months}")

    norm_gender = normalize_gender(gender)
    # Clamp age to WHO maximum 228 months (19 years) if older
    clamped_age = min(age_months, 228)
    age_key = str(clamped_age)

    lms_tables = get_who_lms_tables()

    # 1. Height-for-Age (HAZ)
    hfa_data = lms_tables.get("height_for_age", {}).get(norm_gender, {})
    if age_key not in hfa_data:
        raise ValueError(f"No WHO LMS reference data found for height-for-age at age {clamped_age}m, gender {norm_gender}")
    hfa_lms = hfa_data[age_key]
    haz = compute_lms_zscore(height_cm, hfa_lms["L"], hfa_lms["M"], hfa_lms["S"])

    # 2. Weight-for-Age (WAZ) - WHO provides reference up to 120 months (10 years)
    waz: Optional[float] = None
    wfa_data = lms_tables.get("weight_for_age", {}).get(norm_gender, {})
    if clamped_age <= 120 and age_key in wfa_data:
        wfa_lms = wfa_data[age_key]
        waz = compute_lms_zscore(weight_kg, wfa_lms["L"], wfa_lms["M"], wfa_lms["S"])

    # 3. BMI-for-Age (BAZ)
    # BMI = weight_kg / (height_m ^ 2)
    height_m = height_cm / 100.0
    bmi = weight_kg / (height_m * height_m)

    bmifa_data = lms_tables.get("bmi_for_age", {}).get(norm_gender, {})
    if age_key not in bmifa_data:
        raise ValueError(f"No WHO LMS reference data found for BMI-for-age at age {clamped_age}m, gender {norm_gender}")
    bmifa_lms = bmifa_data[age_key]
    baz = compute_lms_zscore(bmi, bmifa_lms["L"], bmifa_lms["M"], bmifa_lms["S"])

    return {
        "height_for_age_z": haz,
        "weight_for_age_z": waz,
        "bmi_for_age_z": baz,
    }
