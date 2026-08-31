import pytest
from app.services.ml_engine import (
    predict_risks,
    get_diet_plan,
    explain_predictions,
    HealthRiskClassifier,
    get_diet_knowledge_base,
)


def test_diet_knowledge_base_loaded():
    """Verify diet recommendations knowledge base contains expected risk categories."""
    kb = get_diet_knowledge_base()
    expected_categories = [
        "stunting_risk",
        "severe_stunting",
        "underweight_risk",
        "severe_underweight",
        "thinness_risk",
        "severe_thinness",
        "overweight_risk",
        "obesity_risk",
        "normal_growth",
    ]
    for cat in expected_categories:
        assert cat in kb
        assert "title" in kb[cat]
        assert "summary" in kb[cat]
        assert len(kb[cat]["recommendations"]) > 0
        assert len(kb[cat]["focus_nutrients"]) > 0


def test_predict_risks_normal_growth():
    """Test risk prediction for a healthy child with normal Z-scores."""
    zscores = {
        "height_for_age_z": 0.2,
        "weight_for_age_z": -0.1,
        "bmi_for_age_z": -0.3,
    }
    risks = predict_risks(zscores)
    assert len(risks) == 1
    assert risks[0]["risk_name"] == "normal_growth"
    assert risks[0]["severity"] == "low"
    assert risks[0]["probability"] == 0.95


def test_predict_risks_moderate_stunting():
    """Test moderate stunting detection (HAZ between -2.0 and -3.0)."""
    zscores = {
        "height_for_age_z": -2.35,
        "weight_for_age_z": -0.5,
        "bmi_for_age_z": 0.1,
    }
    risks = predict_risks(zscores)
    risk_names = [r["risk_name"] for r in risks]
    assert "stunting_risk" in risk_names
    assert risks[0]["severity"] == "moderate"


def test_predict_risks_severe_stunting_and_severe_underweight():
    """Test co-occurring severe stunting and severe underweight."""
    zscores = {
        "height_for_age_z": -3.4,
        "weight_for_age_z": -3.2,
        "bmi_for_age_z": -1.5,
    }
    risks = predict_risks(zscores)
    risk_names = [r["risk_name"] for r in risks]
    assert "severe_stunting" in risk_names
    assert "severe_underweight" in risk_names


def test_predict_risks_thinness_and_obesity():
    """Test BMI-for-age extreme categories (severe thinness vs obesity)."""
    # Severe thinness
    thin_risks = predict_risks({"height_for_age_z": 0.0, "weight_for_age_z": -2.5, "bmi_for_age_z": -3.2})
    assert any(r["risk_name"] == "severe_thinness" for r in thin_risks)

    # Obesity
    obese_risks = predict_risks({"height_for_age_z": 0.5, "weight_for_age_z": 3.2, "bmi_for_age_z": 3.4})
    assert any(r["risk_name"] == "obesity_risk" for r in obese_risks)

    # Overweight
    overweight_risks = predict_risks({"height_for_age_z": 0.2, "weight_for_age_z": 2.1, "bmi_for_age_z": 2.3})
    assert any(r["risk_name"] == "overweight_risk" for r in overweight_risks)


def test_get_diet_plan_single_risk():
    """Test diet plan generation for a single risk condition."""
    plan = get_diet_plan(["stunting_risk"])
    assert "Protein" in plan["summary"] or len(plan["categories"]) > 0
    assert len(plan["recommendations"]) > 0
    assert "Calcium" in plan["focus_nutrients"] or "Protein" in " ".join(plan["focus_nutrients"])


def test_get_diet_plan_combined_and_deduplicated():
    """Test diet plan generation with multiple risks and ensure recommendations are deduplicated."""
    plan = get_diet_plan(["stunting_risk", "underweight_risk"])
    assert len(plan["categories"]) == 2
    
    # Check deduplication
    assert len(plan["recommendations"]) == len(set(plan["recommendations"]))
    assert len(plan["focus_nutrients"]) == len(set(plan["focus_nutrients"]))


def test_get_diet_plan_fallback_normal():
    """Test fallback when no risk or empty list is passed."""
    plan_empty = get_diet_plan([])
    assert len(plan_empty["recommendations"]) > 0

    plan_normal = get_diet_plan(["normal_growth"])
    assert "Balanced" in plan_normal["categories"][0] or len(plan_normal["recommendations"]) > 0


def test_explain_predictions_threshold_crossing():
    """Test explainability engine threshold string formatting."""
    zscores = {
        "height_for_age_z": -2.45,
        "weight_for_age_z": -3.15,
        "bmi_for_age_z": 0.5,
    }
    risks = predict_risks(zscores)
    explanations = explain_predictions(zscores, risks)
    
    assert len(explanations) == 3
    
    haz_exp = next(e for e in explanations if e["metric"] == "height_for_age_z")
    assert haz_exp["status"] == "stunting_risk"
    assert "below the -2.0 threshold" in haz_exp["explanation"]
    
    waz_exp = next(e for e in explanations if e["metric"] == "weight_for_age_z")
    assert waz_exp["status"] == "severe_underweight"
    assert "below the -3.0 cutoff" in waz_exp["explanation"]
    
    baz_exp = next(e for e in explanations if e["metric"] == "bmi_for_age_z")
    assert baz_exp["status"] == "normal_bmi"
    assert "Normal BMI" in baz_exp["threshold"]
