import pytest
from app.services.zscore import (
    calculate_zscores,
    normalize_gender,
    compute_lms_zscore,
    get_who_lms_tables,
)


def test_who_lms_tables_loaded():
    """Verify that WHO LMS reference data is loaded completely."""
    tables = get_who_lms_tables()
    assert "height_for_age" in tables
    assert "weight_for_age" in tables
    assert "bmi_for_age" in tables
    
    # 0 to 228 months (229 months)
    assert len(tables["height_for_age"]["M"]) == 229
    assert len(tables["height_for_age"]["F"]) == 229
    assert len(tables["bmi_for_age"]["M"]) == 229
    assert len(tables["bmi_for_age"]["F"]) == 229
    # 0 to 120 months (121 months)
    assert len(tables["weight_for_age"]["M"]) == 121
    assert len(tables["weight_for_age"]["F"]) == 121


def test_gender_normalization():
    """Verify gender input normalization."""
    assert normalize_gender("M") == "M"
    assert normalize_gender("male") == "M"
    assert normalize_gender("Boy") == "M"
    assert normalize_gender("1") == "M"
    assert normalize_gender("F") == "F"
    assert normalize_gender("female") == "F"
    assert normalize_gender("Girl") == "F"
    assert normalize_gender("2") == "F"
    assert normalize_gender("O") == "M"
    assert normalize_gender(None) == "M"


def test_compute_lms_zscore_median():
    """When measurement equals median M, Z-score must be 0.0."""
    z = compute_lms_zscore(measurement=120.0, l=1.0, m=120.0, s=0.04)
    assert z == 0.0

    # L != 1
    z2 = compute_lms_zscore(measurement=25.0, l=-0.3, m=25.0, s=0.1)
    assert z2 == 0.0


def test_calculate_zscores_school_age_boy():
    """
    Test standard WHO Z-scores for a 7-year-old boy (84 months).
    WHO 2007 median for 84m boy: Height ~121.86 cm, Weight ~22.87 kg, BMI ~15.35 kg/m².
    """
    # Child with near median measurements
    result = calculate_zscores(
        age_months=84,
        gender="M",
        height_cm=121.9,
        weight_kg=22.9,
    )
    assert abs(result["height_for_age_z"]) < 0.2
    assert result["weight_for_age_z"] is not None
    assert abs(result["weight_for_age_z"]) < 0.2
    assert abs(result["bmi_for_age_z"]) < 0.2


def test_calculate_zscores_stunted_and_underweight():
    """Test child with significantly low height and weight."""
    # 10-year-old boy (120 months): Median height is ~138.4 cm, weight ~31.2 kg
    result = calculate_zscores(
        age_months=120,
        gender="M",
        height_cm=122.0,  # Far below median (Z < -2)
        weight_kg=21.0,   # Far below median (Z < -2)
    )
    assert result["height_for_age_z"] < -2.0
    assert result["weight_for_age_z"] is not None
    assert result["weight_for_age_z"] < -2.0


def test_calculate_zscores_adolescent_wfa_none():
    """
    For adolescents older than 120 months (10 years), weight_for_age_z
    should be None as per WHO recommendations.
    """
    # 14-year-old girl (168 months)
    result = calculate_zscores(
        age_months=168,
        gender="F",
        height_cm=158.0,
        weight_kg=48.0,
    )
    assert result["weight_for_age_z"] is None
    assert isinstance(result["height_for_age_z"], float)
    assert isinstance(result["bmi_for_age_z"], float)


def test_calculate_zscores_overweight_child():
    """Test overweight BMI-for-age calculation."""
    # 9-year-old girl (108 months): height 133 cm, weight 45 kg -> BMI = 25.44 (elevated)
    result = calculate_zscores(
        age_months=108,
        gender="F",
        height_cm=133.0,
        weight_kg=45.0,
    )
    assert result["bmi_for_age_z"] > 2.0


def test_calculate_zscores_invalid_inputs():
    """Test validation errors for invalid physical vitals."""
    with pytest.raises(ValueError, match="Height must be positive"):
        calculate_zscores(age_months=60, gender="M", height_cm=-10.0, weight_kg=15.0)

    with pytest.raises(ValueError, match="Weight must be positive"):
        calculate_zscores(age_months=60, gender="M", height_cm=110.0, weight_kg=0.0)

    with pytest.raises(ValueError, match="Age in months cannot be negative"):
        calculate_zscores(age_months=-5, gender="M", height_cm=110.0, weight_kg=15.0)
