import React, { useState } from 'react';
import { Calculator, Sparkles, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function GrowthCalculator({ onToast }) {
  const { t, language } = useLanguage();
  const [ageYrs, setAgeYrs] = useState('10');
  const [ageMos, setAgeMos] = useState('6');
  const [gender, setGender] = useState('M');
  const [heightCm, setHeightCm] = useState('138');
  const [weightKg, setWeightKg] = useState('31');

  const [result, setResult] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    const yrs = parseFloat(ageYrs) || 0;
    const mos = parseFloat(ageMos) || 0;

    if (!h || !w || h <= 0 || w <= 0) {
      if (onToast) onToast('Please enter valid height and weight values', 'warning');
      return;
    }

    if (yrs <= 0) {
      if (onToast) onToast('Please enter a valid age in years', 'warning');
      return;
    }

    const heightM = h / 100.0;
    const bmi = (w / (heightM * heightM)).toFixed(1);
    const totalMonths = Math.round(yrs * 12 + mos);
    const isAdult = yrs >= 20;

    let category = '';
    let badgeClass = '';

    if (isAdult) {
      // Standard WHO & Asian Adult BMI Standard
      if (bmi < 18.5) {
        category = language === 'hi' ? 'कम वजन / पोषण सुधार आवश्यक (Underweight)' : 'Underweight (Nutritional Care Needed)';
        badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
      } else if (bmi <= 24.9) {
        category = language === 'hi' ? 'सामान्य एवं संतुलित वजन (Normal & Healthy BMI)' : 'Normal & Healthy BMI Range';
        badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      } else if (bmi <= 29.9) {
        category = language === 'hi' ? 'अधिक वजन / सक्रियता आवश्यक (Overweight)' : 'Overweight (Active Lifestyle Advised)';
        badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
      } else {
        category = language === 'hi' ? 'स्थूलता / चिकित्सीय परामर्श अनुशंसित (Obese)' : 'Obese (Clinical Consultation Advised)';
        badgeClass = 'bg-red-100 text-red-800 border-red-300';
      }
    } else {
      // Pediatric WHO Growth Reference (Ages 1 - 19)
      if (bmi < 13.5) {
        category = language === 'hi' ? 'कम वजन / हल्का कुपोषण संकेत (Pediatric Underweight)' : 'Pediatric Underweight / Mild Malnutrition Indicator';
        badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
      } else if (bmi > 22.5) {
        category = language === 'hi' ? 'अधिक बीएमआई / अधिक वजन संकेत (Pediatric Elevated BMI)' : 'Pediatric Elevated BMI / Overweight Indicator';
        badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
      } else {
        category = language === 'hi' ? 'सामान्य एवं स्वस्थ बाल वृद्धि (Healthy Pediatric Growth)' : 'Healthy / Normal Pediatric Growth Parameter';
        badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      }
    }

    setResult({
      bmi,
      totalMonths,
      yrs,
      mos,
      isAdult,
      gender: gender === 'M'
        ? (language === 'hi' ? (isAdult ? 'पुरुष (Male)' : 'बालक (Boy)') : (isAdult ? 'Male' : 'Boy'))
        : (language === 'hi' ? (isAdult ? 'महिला (Female)' : 'बालिका (Girl)') : (isAdult ? 'Female' : 'Girl')),
      category,
      badgeClass,
    });
  };

  return (
    <section id="calculator" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block bg-shwf-orange-subtle text-shwf-orange-dark font-extrabold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-3 shadow-sm">
            {language === 'hi' ? 'इंटरैक्टिव स्वास्थ्य एवं वृद्धि टूल' : 'Interactive Health & Growth Tool'}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-shwf-navy tracking-tight mb-3">
            {language === 'hi' ? 'बाल एवं वयस्क बीएमआई व पोषण कैलकुलेटर' : 'Child, Youth & Adult BMI Calculator'}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            {language === 'hi'
              ? 'बच्चों और किशोरों के लिए WHO बाल विकास मानक और वयस्कों के लिए स्वस्थ बीएमआई स्थिति का तुरंत मूल्यांकन करें।'
              : 'Evaluate growth percentiles for children & youths (WHO standards) and healthy BMI wellness status for adults instantly.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-50 rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-8 lg:p-10 max-w-3xl mx-auto">
          
          <form onSubmit={handleCalculate} className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              
              {/* Age (Years & Months) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t('calculator.dobLabel', 'Age')} (Yrs & Mos)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={ageYrs}
                    onChange={(e) => setAgeYrs(e.target.value)}
                    placeholder="Yrs"
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-shwf-navy"
                  />
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={ageMos}
                    onChange={(e) => setAgeMos(e.target.value)}
                    placeholder="Mos"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-shwf-navy"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t('calculator.genderLabel', 'Gender')}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-shwf-navy cursor-pointer"
                >
                  <option value="M">{language === 'hi' ? 'पुरुष / बालक (Male)' : 'Male (Boy / Man)'}</option>
                  <option value="F">{language === 'hi' ? 'महिला / बालिका (Female)' : 'Female (Girl / Woman)'}</option>
                </select>
              </div>

              {/* Height */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t('calculator.heightLabel', 'Height (cm)')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="250"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="e.g. 138.5"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-shwf-navy"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t('calculator.weightLabel', 'Weight (kg)')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="250"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 31.2"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-shwf-navy"
                />
              </div>

            </div>

            {/* Calculate Button (Full Width, Mobile-Optimized) */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-shwf-navy to-slate-900 hover:from-shwf-navy-dark hover:to-slate-950 text-white font-bold text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Calculator className="w-5 h-5 text-shwf-orange" />
                <span>{language === 'hi' ? 'बीएमआई एवं स्वास्थ्य स्थिति जांचें' : 'Evaluate BMI & Growth Status'}</span>
              </button>
            </div>
          </form>

          {/* Results Block */}
          {result && (
            <div className="mt-8 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-sm animate-fadeIn">
              <h4 className="text-sm font-extrabold text-shwf-navy uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-shwf-orange" />
                <span>
                  {result.isAdult
                    ? (language === 'hi' ? 'वयस्क बीएमआई एवं स्वास्थ्य मूल्यांकन' : 'Adult BMI & Health Classification')
                    : (language === 'hi' ? 'WHO बाल विकास एवं Z-स्कोर अनुमान' : 'WHO Pediatric Growth Calculation Estimate')}
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 text-center">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    {t('calculator.calculatedBmi', 'BMI VALUE')}
                  </div>
                  <div className="text-xl font-black text-shwf-navy mt-0.5">
                    {result.bmi} <span className="text-xs font-normal">kg/m²</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    {t('calculator.ageInMonths', 'TOTAL AGE')}
                  </div>
                  <div className="text-xl font-black text-shwf-green mt-0.5">
                    {result.isAdult ? (
                      <>
                        {result.yrs} <span className="text-xs font-normal">{language === 'hi' ? 'वर्ष' : 'Yrs'}</span>
                        {result.mos > 0 && <span className="text-xs font-normal"> {result.mos}m</span>}
                      </>
                    ) : (
                      <>
                        {result.totalMonths} <span className="text-xs font-normal">{language === 'hi' ? 'महीने' : 'Months'}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    {t('calculator.genderLabel', 'GENDER')}
                  </div>
                  <div className="text-xl font-black text-shwf-orange mt-0.5">
                    {result.gender}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">
                  {t('calculator.whoClassification', 'Preliminary Assessment')}:
                </span>
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${result.badgeClass}`}>
                  {result.category}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-4 border-t border-slate-100 pt-3">
                * {language === 'hi'
                  ? 'नोट: पूर्ण प्रमाणित बाल स्वास्थ्य रिपोर्ट कार्ड एवं विस्तृत Z-स्कोर विश्लेषण छात्र पोर्टल में उपलब्ध हैं।'
                  : 'Note: Full certified health report cards with pediatrician remarks and LMS Z-scores are available in the Student Portal.'}
              </p>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
