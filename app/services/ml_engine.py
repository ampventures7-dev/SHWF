import os
import json
import logging
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DIET_RECOMMENDATIONS_FILE = os.path.join(DATA_DIR, "diet_recommendations.json")

_DIET_KNOWLEDGE_BASE: Optional[Dict[str, Any]] = None


def get_diet_knowledge_base() -> Dict[str, Any]:
    """Load and return the static regional Indian dietary recommendations knowledge base."""
    global _DIET_KNOWLEDGE_BASE
    if _DIET_KNOWLEDGE_BASE is None:
        if not os.path.exists(DIET_RECOMMENDATIONS_FILE):
            raise FileNotFoundError(
                f"Diet recommendations file not found at: {DIET_RECOMMENDATIONS_FILE}"
            )
        try:
            with open(DIET_RECOMMENDATIONS_FILE, "r", encoding="utf-8") as f:
                _DIET_KNOWLEDGE_BASE = json.load(f)
            logger.info("Loaded regional Indian diet recommendations knowledge base.")
        except Exception as e:
            logger.error(f"Failed to load diet recommendations: {str(e)}")
            raise
    return _DIET_KNOWLEDGE_BASE


# =============================================================================
# 1. RISK CLASSIFICATION ENGINE (RULE-BASED + ML DROP-IN ARCHITECTURE)
# =============================================================================

class HealthRiskClassifier:
    """
    Pediatric health risk classification engine.
    Currently implements deterministic WHO clinical standard cutoffs.
    
    Designed with a drop-in Scikit-Learn RandomForestClassifier interface so
    trained ML models can be loaded via joblib/pickle and evaluated via
    predict_proba without modifying the calling signature or output schema.
    """

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        self.model = None
        if self.model_path and os.path.exists(self.model_path):
            self._load_trained_model(self.model_path)

    def _load_trained_model(self, path: str):
        """
        TODO: ML Model Loading
        Once labeled clinical camp data is collected and a RandomForestClassifier
        is trained, load the serialized model artifact here:
        
        Example:
            import joblib
            self.model = joblib.load(path)
        """
        logger.info(f"ML Model path specified: {path} (Awaiting trained model artifact)")

    def predict_risks(
        self, zscores: Dict[str, Optional[float]]
    ) -> List[Dict[str, Any]]:
        """
        Predict health risks from anthropometric Z-scores.
        
        Parameters:
            zscores (dict): Dictionary with keys:
                - height_for_age_z (float)
                - weight_for_age_z (Optional[float])
                - bmi_for_age_z (float)
                
        Returns:
            List[Dict[str, Any]]: List of predicted risks, each with:
                - risk_name (str)
                - severity (str: 'low', 'moderate', 'high', 'critical')
                - probability (float: 0.0 to 1.0)
        """
        # =====================================================================
        # TODO: SCORED ML MODEL PREDICTION DROP-IN
        # When a Scikit-Learn RandomForestClassifier is loaded, extract features:
        #
        # features = [[
        #     zscores.get("height_for_age_z", 0.0),
        #     zscores.get("weight_for_age_z") if zscores.get("weight_for_age_z") is not None else 0.0,
        #     zscores.get("bmi_for_age_z", 0.0)
        # ]]
        # probabilities = self.model.predict_proba(features)[0]
        #
        # Format the output into the identical List[Dict[str, Any]] structure below.
        # =====================================================================

        # Rule-based WHO clinical decision tree
        haz = zscores.get("height_for_age_z")
        waz = zscores.get("weight_for_age_z")
        baz = zscores.get("bmi_for_age_z")

        detected_risks: List[Dict[str, Any]] = []

        # 1. Evaluate Stunting (Height-for-Age HAZ)
        if haz is not None:
            if haz < -3.0:
                detected_risks.append({
                    "risk_name": "severe_stunting",
                    "severity": "high",
                    "probability": 0.95,
                })
            elif haz < -2.0:
                detected_risks.append({
                    "risk_name": "stunting_risk",
                    "severity": "moderate",
                    "probability": 0.85,
                })

        # 2. Evaluate Underweight (Weight-for-Age WAZ - children <= 10 years)
        if waz is not None:
            if waz < -3.0:
                detected_risks.append({
                    "risk_name": "severe_underweight",
                    "severity": "high",
                    "probability": 0.95,
                })
            elif waz < -2.0:
                detected_risks.append({
                    "risk_name": "underweight_risk",
                    "severity": "moderate",
                    "probability": 0.85,
                })

        # 3. Evaluate Thinness / Wasting / Overweight / Obesity (BMI-for-Age BAZ)
        if baz is not None:
            if baz < -3.0:
                detected_risks.append({
                    "risk_name": "severe_thinness",
                    "severity": "critical",
                    "probability": 0.95,
                })
            elif baz < -2.0:
                detected_risks.append({
                    "risk_name": "thinness_risk",
                    "severity": "moderate",
                    "probability": 0.85,
                })
            elif baz > 3.0:
                detected_risks.append({
                    "risk_name": "obesity_risk",
                    "severity": "high",
                    "probability": 0.95,
                })
            elif baz > 2.0:
                detected_risks.append({
                    "risk_name": "overweight_risk",
                    "severity": "moderate",
                    "probability": 0.85,
                })

        # If no abnormal risks detected, return normal growth status
        if not detected_risks:
            detected_risks.append({
                "risk_name": "normal_growth",
                "severity": "low",
                "probability": 0.95,
            })

        return detected_risks


_default_classifier = HealthRiskClassifier()


def predict_risks(zscores: Dict[str, Optional[float]]) -> List[Dict[str, Any]]:
    """Convenience module-level interface for health risk classification."""
    return _default_classifier.predict_risks(zscores)


# =============================================================================
# 2. REGIONAL INDIAN DIET PLAN GENERATOR
# =============================================================================

def get_diet_plan(risk_names: List[str]) -> Dict[str, Any]:
    """
    Generate an integrated, deduplicated regional Indian meal plan based on detected risks.

    Parameters:
        risk_names (List[str]): List of risk keys (e.g. ['stunting_risk', 'underweight_risk'])

    Returns:
        Dict[str, Any]: {
            "summary": str,
            "categories": List[str],
            "recommendations": List[str],  # deduplicated
            "focus_nutrients": List[str]   # deduplicated
        }
    """
    kb = get_diet_knowledge_base()
    
    if not risk_names:
        risk_names = ["normal_growth"]

    categories: List[str] = []
    recommendations_set = set()
    recommendations_list: List[str] = []
    nutrients_set = set()
    nutrients_list: List[str] = []
    summaries: List[str] = []

    for r_name in risk_names:
        entry = kb.get(r_name)
        if not entry and r_name == "normal_growth":
            continue
        if entry:
            if entry.get("title") and entry["title"] not in categories:
                categories.append(entry["title"])
            if entry.get("summary"):
                summaries.append(entry["summary"])

            # Deduplicate recommendations preserving order
            for rec in entry.get("recommendations", []):
                clean_rec = rec.strip()
                if clean_rec and clean_rec not in recommendations_set:
                    recommendations_set.add(clean_rec)
                    recommendations_list.append(clean_rec)

            # Deduplicate nutrients preserving order
            for nut in entry.get("focus_nutrients", []):
                clean_nut = nut.strip()
                if clean_nut and clean_nut not in nutrients_set:
                    nutrients_set.add(clean_nut)
                    nutrients_list.append(clean_nut)

    # Fallback to normal growth if nothing matched
    if not recommendations_list:
        normal_entry = kb.get("normal_growth", {})
        categories = [normal_entry.get("title", "Balanced Maintenance Nutrition")]
        summaries = [normal_entry.get("summary", "Maintain a balanced, nutrient-dense diet.")]
        recommendations_list = normal_entry.get("recommendations", [])
        nutrients_list = normal_entry.get("focus_nutrients", [])

    combined_summary = " ".join(summaries) if summaries else "Customized regional Indian nutritional guidance."

    return {
        "summary": combined_summary,
        "categories": categories,
        "recommendations": recommendations_list,
        "focus_nutrients": nutrients_list,
    }


# =============================================================================
# 3. EXPLAINABILITY MODULE (RULE-BASED + SHAP ML STUB)
# =============================================================================

def explain_predictions(
    zscores: Dict[str, Optional[float]],
    risks: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Generate clear, human-readable explanations of which WHO thresholds were crossed.
    
    Parameters:
        zscores (dict): Computed Z-scores
        risks (list): Identified risk items

    Returns:
        List[Dict[str, Any]]: List of explainability items
    """
    haz = zscores.get("height_for_age_z")
    waz = zscores.get("weight_for_age_z")
    baz = zscores.get("bmi_for_age_z")

    explanations: List[Dict[str, Any]] = []

    # 1. Height-for-Age Explainability
    if haz is not None:
        if haz < -3.0:
            explanations.append({
                "metric": "height_for_age_z",
                "value": haz,
                "status": "severe_stunting",
                "threshold": "Z < -3.0 (Severe Stunting)",
                "explanation": f"Height-for-age Z-score of {haz} is below the -3.0 standard cutoff for severe stunting, indicating critical linear growth deficit.",
            })
        elif haz < -2.0:
            explanations.append({
                "metric": "height_for_age_z",
                "value": haz,
                "status": "stunting_risk",
                "threshold": "Z < -2.0 (Moderate Stunting)",
                "explanation": f"Height-for-age Z-score of {haz} is below the -2.0 threshold, indicating moderate stunting and reduced height velocity.",
            })
        else:
            explanations.append({
                "metric": "height_for_age_z",
                "value": haz,
                "status": "normal_height",
                "threshold": "-2.0 <= Z <= +3.0 (Normal Stature)",
                "explanation": f"Height-for-age Z-score of {haz} is within expected standard deviation for age and gender.",
            })

    # 2. Weight-for-Age Explainability (if applicable)
    if waz is not None:
        if waz < -3.0:
            explanations.append({
                "metric": "weight_for_age_z",
                "value": waz,
                "status": "severe_underweight",
                "threshold": "Z < -3.0 (Severe Underweight)",
                "explanation": f"Weight-for-age Z-score of {waz} is below the -3.0 cutoff, signifying severe underweight status.",
            })
        elif waz < -2.0:
            explanations.append({
                "metric": "weight_for_age_z",
                "value": waz,
                "status": "underweight_risk",
                "threshold": "Z < -2.0 (Moderate Underweight)",
                "explanation": f"Weight-for-age Z-score of {waz} is below the -2.0 threshold, indicating moderate underweight risk.",
            })
        else:
            explanations.append({
                "metric": "weight_for_age_z",
                "value": waz,
                "status": "normal_weight",
                "threshold": "-2.0 <= Z <= +2.0 (Normal Weight)",
                "explanation": f"Weight-for-age Z-score of {waz} is within normal reference ranges.",
            })

    # 3. BMI-for-Age Explainability
    if baz is not None:
        if baz < -3.0:
            explanations.append({
                "metric": "bmi_for_age_z",
                "value": baz,
                "status": "severe_thinness",
                "threshold": "Z < -3.0 (Severe Thinness / Wasting)",
                "explanation": f"BMI-for-age Z-score of {baz} is below the -3.0 threshold, indicating acute severe thinness / wasting.",
            })
        elif baz < -2.0:
            explanations.append({
                "metric": "bmi_for_age_z",
                "value": baz,
                "status": "thinness_risk",
                "threshold": "Z < -2.0 (Moderate Thinness / Wasting)",
                "explanation": f"BMI-for-age Z-score of {baz} is below the -2.0 threshold, indicating moderate thinness requiring nutritional support.",
            })
        elif baz > 3.0:
            explanations.append({
                "metric": "bmi_for_age_z",
                "value": baz,
                "status": "obesity_risk",
                "threshold": "Z > +3.0 (Obesity)",
                "explanation": f"BMI-for-age Z-score of {baz} exceeds the +3.0 threshold, indicating pediatric obesity risk.",
            })
        elif baz > 2.0:
            explanations.append({
                "metric": "bmi_for_age_z",
                "value": baz,
                "status": "overweight_risk",
                "threshold": "Z > +2.0 (Overweight)",
                "explanation": f"BMI-for-age Z-score of {baz} is above the +2.0 cutoff, indicating overweight risk.",
            })
        else:
            explanations.append({
                "metric": "bmi_for_age_z",
                "value": baz,
                "status": "normal_bmi",
                "threshold": "-2.0 <= Z <= +2.0 (Normal BMI)",
                "explanation": f"BMI-for-age Z-score of {baz} reflects healthy proportional body mass.",
            })

    # =========================================================================
    # TODO: SHAP FEATURE ATTRIBUTION INTEGRATION
    # When a trained model is present, compute local SHAP feature importance:
    #
    # def get_shap_feature_importance(model, features, feature_names):
    #     import shap
    #     explainer = shap.TreeExplainer(model)
    #     shap_values = explainer.shap_values(features)
    #     return dict(zip(feature_names, shap_values[0]))
    # =========================================================================

    return explanations
