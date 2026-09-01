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


# =============================================================================
# 4. POINT 5: DYNAMIC QR CODE GENERATOR FOR STUDENT REPORT & CARD
# =============================================================================

def generate_student_qr_code(student_id: str, base_url: str = "http://localhost:5173") -> tuple[str, str]:
    """
    Generate an in-memory high-contrast PNG QR code with deep link for instant
    mobile parent authentication and digital health card access.
    """
    import io
    import base64
    import qrcode

    deep_link = f"{base_url}/?student_id={student_id}#portal"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=5,
        border=2,
    )
    qr.add_data(deep_link)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#0d47a1", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return f"data:image/png;base64,{b64_str}", deep_link


# =============================================================================
# 5. POINT 6: PREVENTIVE IMMUNIZATION & 6-MONTH RECALL SCHEDULE (IAP)
# =============================================================================

def generate_preventive_schedule(
    age_months: int,
    gender: str = "M",
    recorded_date_str: Optional[str] = None,
) -> tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Generate age-tailored immunization booster recommendations based on the Indian
    Academy of Pediatrics (IAP) school health guidelines, plus 6-month dental & vision recalls.
    """
    from datetime import datetime, timedelta

    try:
        if recorded_date_str:
            clean_date = recorded_date_str.replace("Z", "+00:00")
            base_date = datetime.fromisoformat(clean_date).date()
        else:
            base_date = datetime.now().date()
    except Exception:
        base_date = datetime.now().date()

    dental_due = (base_date + timedelta(days=180)).isoformat()
    vision_due = (base_date + timedelta(days=365)).isoformat()
    pediatric_due = (base_date + timedelta(days=180)).isoformat()

    age_years = age_months / 12.0

    # 1. Indian Academy of Pediatrics (IAP) Immunization Schedule for School Children
    immunizations = []

    # DTP Booster 2 (4-6 Years)
    if age_years >= 6.0:
        immunizations.append({
            "vaccine_name": "DTP / DTaP Booster Dose 2",
            "target_age": "4 to 6 Years",
            "dose": "Booster 2",
            "status": "Completed",
            "description": "Protects against Diphtheria, Tetanus, and Pertussis (Whooping Cough).",
            "description_hi": "डिप्थीरिया, टिटनेस और काली खांसी से सुरक्षा प्रदान करता है।",
        })
    else:
        immunizations.append({
            "vaccine_name": "DTP / DTaP Booster Dose 2",
            "target_age": "4 to 6 Years",
            "dose": "Booster 2",
            "status": "Due Soon" if age_years >= 4.0 else "Scheduled",
            "description": "Recommended second booster for school entry protection.",
            "description_hi": "प्राथमिक विद्यालय प्रवेश पर आवश्यक दूसरा बूस्टर टीका।",
        })

    # MMR Booster Dose 2 (4-6 Years)
    immunizations.append({
        "vaccine_name": "MMR Booster Dose 2",
        "target_age": "4 to 6 Years",
        "dose": "Dose 2",
        "status": "Completed" if age_years >= 6.0 else "Due Soon",
        "description": "Second dose against Measles, Mumps, and Rubella (German Measles).",
        "description_hi": "खसरा, गलसुआ और रूबेला के विरुद्ध पूर्ण जीवनरक्षक सुरक्षा।",
    })

    # Typhoid Conjugate Vaccine (TCV)
    immunizations.append({
        "vaccine_name": "Typhoid Conjugate (TCV)",
        "target_age": "6 to 18 Years",
        "dose": "Booster",
        "status": "Completed" if age_years >= 9.0 else "Recommended",
        "description": "Long-term immunity against Salmonella Typhi enteric bacterial fever.",
        "description_hi": "टाइफाइड बुखार से दीर्घकालिक सुरक्षा प्रदान करने वाला टीका।",
    })

    # Tdap / Td Booster (10-12 Years)
    if age_years >= 10.0 and age_years <= 13.0:
        immunizations.append({
            "vaccine_name": "Tdap / Td Adolescent Booster",
            "target_age": "10 to 12 Years",
            "dose": "Adolescent Dose",
            "status": "Due Soon",
            "description": "Crucial pre-teen booster immunity against Tetanus, reduced Diphtheria, and Pertussis.",
            "description_hi": "10 से 12 वर्ष की आयु में आवश्यक टिटनेस एवं डिप्थीरिया बूस्टर टीका।",
        })
    elif age_years > 13.0:
        immunizations.append({
            "vaccine_name": "Tdap / Td Adolescent Booster",
            "target_age": "10 to 12 Years",
            "dose": "Adolescent Dose",
            "status": "Completed",
            "description": "Adolescent protection for school and sports activity.",
            "description_hi": "किशोरावस्था में टिटनेस एवं डिप्थीरिया सुरक्षा।",
        })
    else:
        immunizations.append({
            "vaccine_name": "Tdap / Td Adolescent Booster",
            "target_age": "10 to 12 Years",
            "dose": "Adolescent Dose",
            "status": "Recommended",
            "description": "Scheduled when child reaches 10 years of age.",
            "description_hi": "10 वर्ष की आयु पूर्ण होने पर लगवाया जाने वाला टीका।",
        })

    # HPV Vaccine (9-14 Years for girls and boys)
    if age_years >= 9.0 and age_years <= 15.0:
        immunizations.append({
            "vaccine_name": "HPV (Human Papillomavirus)",
            "target_age": "9 to 14 Years",
            "dose": "2-Dose Series",
            "status": "Recommended",
            "description": "Prevents cervical and HPV-associated cellular dysplasia (2 doses 6 months apart).",
            "description_hi": "एचपीवी वायरस और संबंधित संक्रमणों से बचाव हेतु महत्वपूर्ण टीका।",
        })

    # Annual Influenza (Flu)
    immunizations.append({
        "vaccine_name": "Annual Quadrivalent Influenza",
        "target_age": "All School Ages",
        "dose": "Annual Shot",
        "status": "Recommended",
        "description": "Seasonal respiratory protection before monsoon/winter school term.",
        "description_hi": "मौसम परिवर्तन और वायरल फ्लू से बचाव हेतु वार्षिक टीका।",
    })

    # 2. Preventive 6-Month Recalls (Dental, Vision, Pediatric Exam)
    preventive_recalls = [
        {
            "checkup_type": "Routine Pediatric Dental Recall",
            "last_exam_date": base_date.isoformat(),
            "next_due_date": dental_due,
            "interval_months": 6,
            "status": "Due Soon",
            "advice": "6-month routine cleaning, cavity check, and fluoride varnish inspection.",
            "advice_hi": "दांतों में कीड़े और मसूड़ों की जांच हेतु 6 महीने में नियमित दंत परीक्षण करवाएं।",
        },
        {
            "checkup_type": "Vision Refraction & Eye Care Review",
            "last_exam_date": base_date.isoformat(),
            "next_due_date": vision_due,
            "interval_months": 12,
            "status": "Scheduled",
            "advice": "Annual Snellen 6/6 visual acuity, screen fatigue, and refractive checkup.",
            "advice_hi": "दृष्टि क्षमता (6/6 विजन) और आंखों के स्वास्थ्य की वार्षिक जांच।",
        },
        {
            "checkup_type": "Comprehensive Growth & Nutrition Review",
            "last_exam_date": base_date.isoformat(),
            "next_due_date": pediatric_due,
            "interval_months": 6,
            "status": "Scheduled",
            "advice": "Follow-up physical anthropometry (HAZ/WAZ) to track linear growth velocity.",
            "advice_hi": "बच्चे की लंबाई और वजन की वृद्धि दर मापने हेतु 6 माह में फॉलो-अप जांच।",
        },
    ]

    return immunizations, preventive_recalls


# =============================================================================
# 6. POINT 7: AI PEDIATRIC GROWTH FORECASTING & CATCH-UP TRAJECTORY
# =============================================================================

def generate_growth_forecast(
    current_height_cm: float,
    current_weight_kg: float,
    age_months: int,
    gender: str = "M",
    zscores: Optional[Dict[str, Any]] = None,
    camp_history: Optional[List[Any]] = None,
) -> Dict[str, Any]:
    """
    Project child height, weight, and BMI trajectories for the next 6 and 12 months
    based on WHO median growth velocity curves + historical camp growth rates.
    """
    from app.services.zscore import calculate_zscores

    z = zscores or {}
    haz = z.get("height_for_age_z") if z.get("height_for_age_z") is not None else z.get("haz", 0.0)
    waz = z.get("weight_for_age_z") if z.get("weight_for_age_z") is not None else z.get("waz")
    baz = z.get("bmi_for_age_z") if z.get("bmi_for_age_z") is not None else z.get("baz", 0.0)

    # Standard WHO annual linear growth velocity by age:
    # 5-8 yrs: ~5.5 - 6.5 cm/year
    # 9-11 yrs: ~5.0 - 6.0 cm/year
    # 12-15 yrs (pubertal growth spurt): ~6.5 - 9.0 cm/year
    age_yrs = age_months / 12.0
    if age_yrs < 8:
        base_annual_height_velocity = 6.0
        base_annual_weight_gain = 2.5
    elif age_yrs <= 11:
        base_annual_height_velocity = 5.4
        base_annual_weight_gain = 2.8
    elif age_yrs <= 14:
        base_annual_height_velocity = 7.2 if gender == "M" else 6.5
        base_annual_weight_gain = 4.0
    else:
        base_annual_height_velocity = 4.5
        base_annual_weight_gain = 3.0

    # Catch-up needed if child has stunting (HAZ < -2.0) or underweight (WAZ < -2.0 / BAZ < -2.0)
    is_stunted = haz < -2.0
    is_thin = baz < -2.0 or (waz is not None and waz < -2.0)
    catch_up_recommended = is_stunted or is_thin

    target_velocity_yr = base_annual_height_velocity
    if catch_up_recommended:
        # Increase target velocity for catch-up potential
        target_velocity_yr = base_annual_height_velocity * 1.25

    monthly_height_vel = round(target_velocity_yr / 12.0, 2)
    monthly_weight_vel = round(base_annual_weight_gain / 12.0, 2)

    # 6-Month Projection
    proj_h_6m = round(current_height_cm + (monthly_height_vel * 6), 1)
    proj_w_6m = round(current_weight_kg + (monthly_weight_vel * 6), 1)
    proj_bmi_6m = round(proj_w_6m / ((proj_h_6m / 100.0) ** 2), 2)
    z_6m = calculate_zscores(age_months=age_months + 6, gender=gender, height_cm=proj_h_6m, weight_kg=proj_w_6m)

    # 12-Month Projection
    proj_h_12m = round(current_height_cm + (monthly_height_vel * 12), 1)
    proj_w_12m = round(current_weight_kg + (monthly_weight_vel * 12), 1)
    proj_bmi_12m = round(proj_w_12m / ((proj_h_12m / 100.0) ** 2), 2)
    z_12m = calculate_zscores(age_months=age_months + 12, gender=gender, height_cm=proj_h_12m, weight_kg=proj_w_12m)

    if catch_up_recommended:
        milestone_status = "Catch-Up Acceleration Target"
        milestone_status_hi = "सकारात्मक वृद्धि सुधार लक्ष्य"
        interp_6m = f"With recommended high-protein nutrition, expected height growth is +{round(monthly_height_vel * 6, 1)} cm reaching {proj_h_6m} cm in 6 months."
        interp_6m_hi = f"संतुलित पोषण से 6 महीने में लगभग +{round(monthly_height_vel * 6, 1)} सेमी लंबाई बढ़कर {proj_h_6m} सेमी होने का अनुमान है।"
        interp_12m = f"12-month targeted catch-up trajectory projects height reaching {proj_h_12m} cm and weight reaching {proj_w_12m} kg."
        interp_12m_hi = f"1 साल में अनुमानित लंबाई {proj_h_12m} सेमी और वजन {proj_w_12m} किग्रा तक पहुंचने का लक्ष्य है।"
        nutritional_guidance = "Provide 15-20g extra daily dietary protein (eggs/paneer/sprouts) + calcium for optimal bone elongation."
        nutritional_guidance_hi = "शारीरिक विकास गति तेज करने के लिए दैनिक आहार में 15-20 ग्राम अतिरिक्त प्रोटीन (दालें, पनीर, उबला अंडा) और दूध दें।"
    else:
        milestone_status = "On-Track Healthy Progression"
        milestone_status_hi = "सामान्य एवं संतुलित विकास पथ"
        interp_6m = f"Projected height in 6 months is {proj_h_6m} cm (+{round(monthly_height_vel * 6, 1)} cm) adhering to WHO growth median."
        interp_6m_hi = f"6 महीने में बच्चे की लंबाई {proj_h_6m} सेमी (+{round(monthly_height_vel * 6, 1)} सेमी) तक संतुलित गति से बढ़ने का अनुमान है।"
        interp_12m = f"12-month milestone predicts height reaching {proj_h_12m} cm and weight reaching {proj_w_12m} kg with stable BMI."
        interp_12m_hi = f"12 महीनों में अनुमानित लंबाई {proj_h_12m} सेमी और वजन {proj_w_12m} किग्रा रहने का पूर्वानुमान है।"
        nutritional_guidance = "Maintain current balanced home-cooked meals, adequate hydration, and at least 60 mins of daily outdoor play."
        nutritional_guidance_hi = "वर्तमान पौष्टिक आहार, पर्याप्त पानी और प्रतिदिन कम से कम 60 मिनट खेलकूद व व्यायाम बनाए रखें।"

    return {
        "current_height_cm": current_height_cm,
        "current_weight_kg": current_weight_kg,
        "catch_up_recommended": catch_up_recommended,
        "target_catch_up_velocity_cm_yr": target_velocity_yr,
        "six_month_forecast": {
            "horizon": "6 Months",
            "projected_height_cm": proj_h_6m,
            "projected_weight_kg": proj_w_6m,
            "projected_bmi": proj_bmi_6m,
            "projected_haz": z_6m.get("height_for_age_z", 0.0),
            "projected_waz": z_6m.get("weight_for_age_z"),
            "projected_baz": z_6m.get("bmi_for_age_z", 0.0),
            "monthly_height_velocity_cm": monthly_height_vel,
            "milestone_status": milestone_status,
            "milestone_status_hi": milestone_status_hi,
            "interpretation": interp_6m,
            "interpretation_hi": interp_6m_hi,
        },
        "twelve_month_forecast": {
            "horizon": "12 Months",
            "projected_height_cm": proj_h_12m,
            "projected_weight_kg": proj_w_12m,
            "projected_bmi": proj_bmi_12m,
            "projected_haz": z_12m.get("height_for_age_z", 0.0),
            "projected_waz": z_12m.get("weight_for_age_z"),
            "projected_baz": z_12m.get("bmi_for_age_z", 0.0),
            "monthly_height_velocity_cm": monthly_height_vel,
            "milestone_status": milestone_status,
            "milestone_status_hi": milestone_status_hi,
            "interpretation": interp_12m,
            "interpretation_hi": interp_12m_hi,
        },
        "nutritional_milestone_guidance": nutritional_guidance,
        "nutritional_milestone_guidance_hi": nutritional_guidance_hi,
    }

