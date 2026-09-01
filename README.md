# SHWF - Smart Health Welfare Foundation
### AI-Powered Pediatric Health Surveillance, Risk Prediction & Growth Analytics Platform

A secure, high-performance web platform and clinical health checkup engine built with **FastAPI**, **React (Vite + Tailwind CSS)**, **Playwright**, **Supabase (PostgreSQL)**, **Pydantic v2**, **Bcrypt**, **PyJWT**, and **MSG91**.

---

## 📌 Architecture & Scope

The Student Health Report Card Platform provides end-to-end capabilities:
1. **Admin Portal & Complete 68-Column Clinical Check-Up Form**:
   - Ingests vitals, general exam, dental, ENT, eye refraction, hearing, vaccination, lifestyle, pathology, and doctor clinical assessments.
   - Dual CSV template download & bulk upload with 500-record batch chunking.
   - Password-protected admin authentication with secure JWT tokens.
2. **Parent Health Portal & OTP Verification**:
   - Cascading discovery (State &rarr; District &rarr; School &rarr; Student) with strict non-sensitive field filtering.
   - Anti-enumeration bcrypt-hashed OTP verification via SMS/Email/WhatsApp with sliding rate limits and lockout.
3. **WHO LMS Standard Z-Score & ML Prediction Engine**:
   - Computes exact Height-for-Age (HAZ), Weight-for-Age (WAZ), and BMI-for-Age (BAZ) using official WHO LMS tables.
   - Classifies stunting, wasting, underweight, and overweight/obesity risks with personalized regional Indian dietary guidance.
4. **Child Multi-Camp Growth Trajectory & Historical Comparison**:
   - Interactive camp visit switcher (e.g. 2 months ago vs. latest).
   - 2-month linear height growth delta, weight velocity rating, and pediatric milestone assessment.
5. **Certified A4 PDF Report Card Engine**:
   - High-definition pixel-accurate single-page A4 certified medical report cards generated via Playwright Chromium with direct binary streaming.

---

## 🚀 Setup & Running Locally

### 1. Backend Service
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8001
```

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated Test Suite

Run the complete test suite (77 unit & integration tests) inside the `backend/` directory:
```bash
cd backend
python -m pytest tests/ -v
```
