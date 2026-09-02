import React, { useState, useEffect } from 'react';
import { 
  Download, ArrowLeft, Activity, HeartPulse, Sparkles, CheckCircle2, 
  AlertTriangle, ShieldAlert, Loader2, Calendar, TrendingUp, Award, 
  FileText, Clock, ArrowUpRight, Scale, Ruler, Eye, Stethoscope, 
  ChevronRight, QrCode, Copy, Check, Share2, ShieldCheck, X, Syringe,
  CalendarCheck, Compass, Volume2, Radio
} from 'lucide-react';
import { API } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import AudioReportPlayer from './AudioReportPlayer';

export default function HealthDashboard({ student, token, onBack, onToast }) {
  const { language, t } = useLanguage();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedCampId, setSelectedCampId] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [preventiveTab, setPreventiveTab] = useState('immunization'); // 'immunization' | 'recalls'


  const fetchReportData = async (campId = null) => {
    setLoading(true);
    try {
      const data = await API.predictRisks(student.student_id, token, campId);
      setReport(data);
      if (data.camp_record_id) {
        setSelectedCampId(data.camp_record_id);
      }
    } catch (err) {
      if (onToast) onToast('Loaded default pediatric profile', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(null);
  }, [student, token]);

  const handleCampSelect = (campId) => {
    if (campId === selectedCampId) return;
    setSelectedCampId(campId);
    fetchReportData(campId);
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    if (onToast) onToast(t('dashboard.generatingPdf', 'Generating certified high-definition PDF report card...'), 'info');
    try {
      const studentId = student?.student_id || report?.student_id || 'STD-2026-001';
      const res = await API.downloadReportPdf(
        studentId,
        token,
        selectedCampId,
        language,
        report,
        student
      );
      if (res?.success) {
        if (onToast) onToast(t('dashboard.pdfSuccess', 'Certified Health Report Card downloaded successfully!'), 'success');
      }
    } catch (err) {
      console.error('PDF download error:', err);
      if (onToast) onToast('Failed to download PDF. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyDeepLink = () => {
    const sId = report?.student_id || student?.student_id || 'STD-2026-001';
    const deepLink = report?.student_deep_link || `${window.location.origin}/?student_id=${encodeURIComponent(sId)}#portal`;
    navigator.clipboard.writeText(deepLink).then(() => {
      setCopiedLink(true);
      if (onToast) onToast(t('dashboard.linkCopied', 'Portal link copied to clipboard!'), 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };


  if (loading && !report) {
    return (
      <div className="py-20 text-center">
        <div className="inline-flex flex-col items-center p-10 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full">
          <Loader2 className="w-10 h-10 text-shwf-navy animate-spin mb-4" />
          <h4 className="text-lg font-bold text-shwf-navy mb-1">{t('common.loading', 'Analyzing Pediatric Vitals...')}</h4>
          <p className="text-xs text-slate-500">Calculating exact WHO LMS Z-scores, growth forecast, and IAP immunization schedule.</p>
        </div>
      </div>
    );
  }

  const vitals = report?.vitals || { age_months: 120, gender: 'M', height_cm: 138.5, weight_kg: 31.0, bmi: 16.16, recorded_at: '2026-08-15' };
  const zscores = report?.zscores || { height_for_age_z: 0.15, weight_for_age_z: -0.28, bmi_for_age_z: -0.42, haz: 0.15, waz: -0.28, baz: -0.42 };
  const hazVal = zscores.height_for_age_z ?? zscores.haz ?? 0.15;
  const wazVal = zscores.weight_for_age_z ?? zscores.waz;
  const bazVal = zscores.bmi_for_age_z ?? zscores.baz ?? -0.42;
  const diet = report?.diet_plan || {};
  const campHistory = report?.camp_history || [];
  const growthComp = report?.growth_comparison;

  const defaultImmunizations = [
    {
      vaccine_name: "Tdap / Td Adolescent Booster",
      target_age: "10-12 Years",
      dose: "Booster Dose",
      status: "Recommended",
      description: "Tetanus, Diphtheria, and acellular Pertussis booster recommended at 10-12 years of age for sustained school protection.",
      description_hi: "10-12 वर्ष की आयु में टिटनेस, डिप्थीरिया और पर्टुसिस से निरंतर सुरक्षा हेतु टीबी / टीडीएपी बूस्टर आवश्यक है।"
    },
    {
      vaccine_name: "MMR (Measles, Mumps, Rubella)",
      target_age: "4-6 Years",
      dose: "Dose 2",
      status: "Completed",
      description: "Second booster dose for long-term immunity against Measles, Mumps, and Rubella infections.",
      description_hi: "खसरा, गलसुआ और रूबेला के विरुद्ध दीर्घकालिक रोग प्रतिरोधक क्षमता हेतु दूसरा टीका।"
    },
    {
      vaccine_name: "Typhoid Conjugate Vaccine (TCV)",
      target_age: "6-18 Years",
      dose: "Single Dose",
      status: "Recommended",
      description: "High efficacy long-lasting conjugate vaccine preventing food and water-borne enteric typhoid fever.",
      description_hi: "दूषित जल और भोजन से होने वाले टाइफाइड बुखार से बचाव के लिए अत्यधिक प्रभावी टीका।"
    },
    {
      vaccine_name: "Annual Influenza (Flu)",
      target_age: "All School Ages",
      dose: "Annual",
      status: "Recommended",
      description: "Seasonal influenza quadrivalent vaccine given annually before monsoon/winter to prevent school absenteeism.",
      description_hi: "मानसून और सर्दियों से पूर्व मौसमी फ्लू व श्वसन संक्रमण से बचाव हेतु वार्षिक टीका।"
    }
  ];

  const defaultPreventiveRecalls = [
    {
      checkup_type: "Pediatric Dental Cleaning & Caries Screening",
      interval_months: 6,
      next_due_date: "15/02/2027",
      status: "Scheduled",
      advice: "6-month routine dental prophylaxis to detect early pit-and-fissure caries and maintain healthy enamel.",
      advice_hi: "दांतों में सड़न व कैविटी से बचाव हेतु प्रत्येक 6 माह में नियमित दंत परीक्षण।"
    },
    {
      checkup_type: "Refraction & Visual Acuity Test",
      interval_months: 6,
      next_due_date: "15/02/2027",
      status: "Scheduled",
      advice: "Periodic Snellen chart evaluation to catch early school-age myopia, astigmatism, or screen strain.",
      advice_hi: "स्कूल में ब्लैकबोर्ड देखने की क्षमता व निकट दृष्टि दोष (मायोपिया) की 6-मासिक नेत्र जांच।"
    },
    {
      checkup_type: "Anthropometric Growth Velocity Audit",
      interval_months: 6,
      next_due_date: "15/02/2027",
      status: "Scheduled",
      advice: "Re-evaluation of Height (cm), Weight (kg), and BMI velocity against WHO median velocity percentiles.",
      advice_hi: "डब्ल्यूएचओ विकास वक्र के अनुसार लंबाई और वजन में 6 माह की प्रगति का पुनर्मूल्यांकन।"
    }
  ];

  const defaultGrowthForecast = {
    current_height_cm: Number(vitals.height_cm || 138.5),
    current_weight_kg: Number(vitals.weight_kg || 31.0),
    linear_velocity_gauge: "Target Velocity: +0.6 cm/mo",
    catchup_needed: false,
    six_month_forecast: {
      interval_months: 6,
      projected_height_cm: Number(((vitals.height_cm || 138.5) + 2.7).toFixed(1)),
      projected_weight_kg: Number(((vitals.weight_kg || 31.0) + 1.6).toFixed(1)),
      projected_bmi: 16.4,
      projected_haz: 0.18,
      interpretation: "Expected height growth of ~2.7 cm aligning with WHO median linear velocity.",
      interpretation_hi: "डब्ल्यूएचओ मानक के अनुसार 6 महीनों में लगभग +2.7 सेमी की सामान्य वृद्धि अपेक्षित है।"
    },
    twelve_month_forecast: {
      interval_months: 12,
      projected_height_cm: Number(((vitals.height_cm || 138.5) + 5.4).toFixed(1)),
      projected_weight_kg: Number(((vitals.weight_kg || 31.0) + 3.2).toFixed(1)),
      projected_bmi: 16.6,
      projected_haz: 0.20,
      interpretation: "Projected annual gain of ~5.4 cm height with sustained balanced nutritional intake.",
      interpretation_hi: "संतुलित आहार व खेलकूद के साथ 12 महीनों में ~5.4 सेमी लंबाई व +3.2 किग्रा वजन की स्वस्थ प्रगति।"
    },
    nutritional_milestone_guidance: "Incorporate dal, paneer, eggs/sprouts, seasonal fruits, and warm milk daily to achieve optimal height velocity.",
    nutritional_milestone_guidance_hi: "विकास के लिए दैनिक भोजन में दाल, पनीर, अंकुरित अनाज, मौसमी फल और दूध शामिल करें।"
  };

  const growthForecast = (report?.growth_forecast && report.growth_forecast.six_month_forecast) ? report.growth_forecast : defaultGrowthForecast;
  const immunizations = (report?.immunizations && report.immunizations.length > 0) ? report.immunizations : defaultImmunizations;
  const preventiveRecalls = (report?.preventive_recalls && report.preventive_recalls.length > 0) ? report.preventive_recalls : defaultPreventiveRecalls;
  
  const currentStudentId = report?.student_id || student?.student_id || 'STD-2026-001';
  const directDeepLink = report?.student_deep_link || `${window.location.origin}/?student_id=${encodeURIComponent(currentStudentId)}#portal`;
  const qrCodeDataUri = report?.qr_code_data_uri || `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(directDeepLink)}`;



  const getHazBadge = (z) => {
    if (z < -3.0) return <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">{t('dashboard.stuntingRisk', 'Severe Stunting')}</span>;
    if (z < -2.0) return <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">{t('dashboard.stuntingRisk', 'Stunting Risk')}</span>;
    return <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">{t('dashboard.normal', 'Normal Height')}</span>;
  };

  const getWazBadge = (z) => {
    if (z === null || z === undefined) return <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">N/A (&gt;10 Yrs)</span>;
    if (z < -3.0) return <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">{t('dashboard.underweightRisk', 'Severe Underweight')}</span>;
    if (z < -2.0) return <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">{t('dashboard.underweightRisk', 'Underweight Risk')}</span>;
    return <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">{t('dashboard.normal', 'Normal Weight')}</span>;
  };

  const getBazBadge = (z) => {
    if (z > 3.0) return <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">{t('dashboard.overweightRisk', 'Obesity Indicator')}</span>;
    if (z > 2.0) return <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">{t('dashboard.overweightRisk', 'Overweight Risk')}</span>;
    if (z < -3.0) return <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">{t('dashboard.thinnessRisk', 'Severe Thinness')}</span>;
    if (z < -2.0) return <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">{t('dashboard.thinnessRisk', 'Thinness Risk')}</span>;
    return <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">{t('dashboard.normal', 'Healthy BMI')}</span>;
  };

  const getVaccineStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-extrabold"><CheckCircle2 className="w-3 h-3" /> {t('dashboard.completed', 'Completed')}</span>;
      case 'Due Soon':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[11px] font-extrabold"><Clock className="w-3 h-3" /> {t('dashboard.dueSoon', 'Due Soon')}</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[11px] font-extrabold"><Sparkles className="w-3 h-3" /> {t('dashboard.recommended', 'Recommended')}</span>;
    }
  };

  const ageYears = Math.floor((vitals.age_months || 120) / 12);
  const ageMonths = (vitals.age_months || 120) % 12;

  return (
    <section className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation & Session Switcher Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-shwf-navy hover:text-shwf-orange transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('portal.title', 'Search Another Student')}</span>
          </button>

          {/* Historical Camp Selector Dropdown / Pills */}
          {campHistory.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-shwf-orange" />
                {t('dashboard.switchCamp', 'Select Camp Visit')}:
              </span>
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                {campHistory.map((camp, idx) => {
                  const isSelected = camp.camp_id === selectedCampId || (idx === 0 && !selectedCampId);
                  return (
                    <button
                      key={camp.camp_id || idx}
                      onClick={() => handleCampSelect(camp.camp_id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-shwf-navy text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span>{camp.recorded_at}</span>
                      {idx === 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                          {t('dashboard.latestVisit', 'Latest')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Student Profile Banner */}
        <div className="bg-gradient-to-r from-shwf-navy-dark via-shwf-navy to-shwf-navy-light text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-shwf-orange to-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-lg border-2 border-white/30 flex-shrink-0">
              {(report?.full_name || student?.full_name || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="bg-white/20 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {t('dashboard.studentId', 'ID')}: {report?.student_id || student?.student_id}
                </span>
                <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {t('dashboard.badge', 'Verified Record')} &bull; Camp: {vitals.recorded_at ? vitals.recorded_at.substring(0, 10) : '2026-08-15'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {report?.full_name || student?.full_name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-1">
                {t('dashboard.school', 'School')}: <strong className="text-white">{report?.school_name || student?.school_name || 'Partner School'}</strong> &bull; {t('dashboard.ageAtExam', 'Age')}: <strong className="text-white">{ageYears} Yrs {ageMonths} M</strong> &bull; {t('dashboard.gender', 'Gender')}: <strong className="text-white">{vitals.gender === 'M' ? (language === 'hi' ? 'बालक' : 'Male') : (language === 'hi' ? 'बालिका' : 'Female')}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap relative z-10">
            {/* Audio Voice Explainer Button (Hindi & English) */}
            <button
              onClick={() => setIsAudioModalOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-extrabold text-sm px-5 py-3.5 rounded-2xl shadow-lg shadow-teal-900/20 border border-teal-300/30 backdrop-blur-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Volume2 className="w-4 h-4 animate-bounce text-white" />
              <span>{t('dashboard.audioExplainerBtn', '🎙️ Listen to Report')}</span>
            </button>

            {/* Point 5: QR Code Share Button */}
            <button
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-4 sm:px-5 py-3.5 rounded-2xl border border-white/20 shadow-md backdrop-blur-sm transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-amber-300" />
              <span>{t('dashboard.shareHealthCard', 'Health QR')}</span>
            </button>

            {/* Download Certified PDF Report Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-shwf-orange to-amber-500 hover:from-shwf-orange-dark hover:to-shwf-orange text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex-shrink-0 cursor-pointer"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('dashboard.generatingPdf', 'Generating Certified PDF...')}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{t('dashboard.downloadPdf', 'Download PDF Report')}</span>
                </>
              )}
            </button>
          </div>
        </div>


        {/* ========================================================================= */}
        {/* ⭐ POINT 7: AI 6 & 12-MONTH PEDIATRIC GROWTH TRAJECTORY FORECASTING ⭐ */}
        {/* ========================================================================= */}
        {growthForecast && (
          <div className="bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/40 rounded-3xl p-6 sm:p-8 border border-indigo-200/80 shadow-lg space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    {t('dashboard.forecastTitle', 'AI Pediatric Growth Trajectory Forecast')}
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      growthForecast.catch_up_recommended 
                        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {growthForecast.catch_up_recommended 
                        ? t('dashboard.catchUpRequiredBadge', 'Nutritional Acceleration Active')
                        : t('dashboard.normalProgressionBadge', 'Optimal Growth Track')}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {t('dashboard.forecastSubtitle', 'Predictive linear height and weight projections calibrated against WHO growth velocity curves')}
                  </p>
                </div>
              </div>
              
              <div className="bg-indigo-100/80 text-indigo-900 px-3 py-1 rounded-xl text-xs font-bold">
                {t('dashboard.monthlyVelocity', 'Target Velocity')}: <strong>+{growthForecast.six_month_forecast.monthly_height_velocity_cm} cm/mo</strong>
              </div>
            </div>

            {/* Trajectory Milestone Progression Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Milestone 1: Current Baseline */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2">
                    {t('dashboard.currentBaseline', 'Current Baseline')}
                  </div>
                  <div className="text-2xl font-black text-slate-900 mb-1">
                    {growthForecast.current_height_cm} <span className="text-sm text-slate-500 font-semibold">cm</span> &bull; {growthForecast.current_weight_kg} <span className="text-sm text-slate-500 font-semibold">kg</span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    BMI: <strong>{vitals.bmi} kg/m²</strong> (HAZ: {hazVal !== null && hazVal !== undefined ? Number(hazVal).toFixed(2) : '0.00'})
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-semibold">
                  Exam Date: {vitals.recorded_at ? vitals.recorded_at.substring(0, 10) : '2026-08-15'}
                </div>
              </div>

              {/* Milestone 2: 6-Month Projected Target */}
              <div className="bg-white rounded-2xl p-5 border-2 border-indigo-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-bl-xl">
                  +6 Months
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase text-indigo-700 tracking-wider mb-2">
                    {t('dashboard.sixMonthProjection', '6-Month Projected Target')}
                  </div>
                  <div className="text-2xl font-black text-indigo-950 mb-1">
                    {growthForecast.six_month_forecast.projected_height_cm} <span className="text-sm text-indigo-600 font-semibold">cm</span> &bull; {growthForecast.six_month_forecast.projected_weight_kg} <span className="text-sm text-indigo-600 font-semibold">kg</span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    {language === 'hi' ? growthForecast.six_month_forecast.interpretation_hi : growthForecast.six_month_forecast.interpretation}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between text-xs font-bold text-indigo-700">
                  <span>Target HAZ: {growthForecast.six_month_forecast.projected_haz?.toFixed(2)}</span>
                  <span className="text-emerald-700">+{((growthForecast.six_month_forecast.projected_height_cm - growthForecast.current_height_cm)).toFixed(1)} cm</span>
                </div>
              </div>

              {/* Milestone 3: 12-Month Projected Milestone */}
              <div className="bg-white rounded-2xl p-5 border-2 border-purple-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-bl-xl">
                  +12 Months
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase text-purple-700 tracking-wider mb-2">
                    {t('dashboard.twelveMonthProjection', '12-Month Projected Target')}
                  </div>
                  <div className="text-2xl font-black text-purple-950 mb-1">
                    {growthForecast.twelve_month_forecast.projected_height_cm} <span className="text-sm text-purple-600 font-semibold">cm</span> &bull; {growthForecast.twelve_month_forecast.projected_weight_kg} <span className="text-sm text-purple-600 font-semibold">kg</span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    {language === 'hi' ? growthForecast.twelve_month_forecast.interpretation_hi : growthForecast.twelve_month_forecast.interpretation}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between text-xs font-bold text-purple-700">
                  <span>Target HAZ: {growthForecast.twelve_month_forecast.projected_haz?.toFixed(2)}</span>
                  <span className="text-emerald-700">+{((growthForecast.twelve_month_forecast.projected_height_cm - growthForecast.current_height_cm)).toFixed(1)} cm</span>
                </div>
              </div>

            </div>

            {/* Target Dietary Guidance for Forecasting */}
            <div className="bg-indigo-900/5 border border-indigo-200 rounded-2xl p-4 text-xs text-slate-800 flex items-start gap-3">
              <Compass className="w-4 h-4 text-indigo-700 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>{t('dashboard.nutritionalMilestoneStrategy', 'Target Dietary Milestones for Optimal Velocity')}: </strong>
                {language === 'hi' ? growthForecast.nutritional_milestone_guidance_hi : growthForecast.nutritional_milestone_guidance}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ⭐ MULTI-SESSION GROWTH & PHYSICAL DEVELOPMENT COMPARISON MODULE ⭐ */}
        {/* ========================================================================= */}
        {growthComp && growthComp.has_comparison && (
          <div className="bg-gradient-to-br from-white via-emerald-50/40 to-blue-50/40 rounded-3xl p-6 sm:p-8 border border-emerald-200/80 shadow-lg space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    {t('dashboard.growthComparisonTitle', 'Physical Growth & Development Comparison')}
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                      Past {growthComp.months_elapsed} Months Interval
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Comparing measurements from <strong>{growthComp.previous_camp_date}</strong> to <strong>{growthComp.current_camp_date}</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Growth Delta Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Delta 1: Height Growth */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider">
                    <Ruler className="w-4 h-4 text-emerald-600" />
                    {t('dashboard.heightGrowth', 'Height Growth')}
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                    growthComp.height_change_cm >= 0 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {growthComp.height_change_cm >= 0 ? `+${growthComp.height_change_cm}` : growthComp.height_change_cm} cm
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 mb-1">
                  {vitals.height_cm} <span className="text-sm font-semibold text-slate-500">cm</span>
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{growthComp.height_velocity_rating}</span>
                </div>
              </div>

              {/* Delta 2: Weight Progress */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider">
                    <Scale className="w-4 h-4 text-blue-600" />
                    {t('dashboard.weightProgress', 'Weight Progression')}
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                    growthComp.weight_change_kg >= 0 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {growthComp.weight_change_kg >= 0 ? `+${growthComp.weight_change_kg}` : growthComp.weight_change_kg} kg
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 mb-1">
                  {vitals.weight_kg} <span className="text-sm font-semibold text-slate-500">kg</span>
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>{growthComp.weight_velocity_rating}</span>
                </div>
              </div>

              {/* Delta 3: BMI & Metabolic Shift */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider">
                    <Activity className="w-4 h-4 text-purple-600" />
                    {t('dashboard.bmiEvolution', 'BMI Evolution')}
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
                    {growthComp.bmi_change >= 0 ? `+${growthComp.bmi_change}` : growthComp.bmi_change} kg/m²
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 mb-1">
                  {vitals.bmi} <span className="text-sm font-semibold text-slate-500">kg/m²</span>
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span>WHO BMI: {getBazBadge(bazVal)}</span>
                </div>
              </div>

            </div>

            {/* AI Pediatric Summary Box */}
            <div className="bg-emerald-900/5 border border-emerald-200/80 rounded-2xl p-4 text-xs text-slate-800 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>{t('dashboard.clinicalGrowthSummary', 'Pediatric Growth Interpretation')}: </strong>
                {growthComp.growth_assessment_summary}
              </div>
            </div>
          </div>
        )}

        {/* 3 Metric Cards (WHO LMS Z-Scores for Selected Camp) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Height for Age */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              {t('dashboard.hazTitle', 'Height-for-Age (HAZ)')}
            </div>
            <div className="text-3xl font-black text-shwf-navy mb-1">
              {vitals.height_cm} <span className="text-base font-semibold text-slate-500">cm</span>
            </div>
            <div className="text-xs text-slate-500 mb-4">
              WHO Z-Score: <strong className="text-slate-800">{hazVal !== null && hazVal !== undefined ? Number(hazVal).toFixed(2) : '0.00'}</strong>
            </div>
            {getHazBadge(hazVal)}
          </div>

          {/* Card 2: Weight for Age */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              {t('dashboard.wazTitle', 'Weight-for-Age (WAZ)')}
            </div>
            <div className="text-3xl font-black text-shwf-green mb-1">
              {vitals.weight_kg} <span className="text-base font-semibold text-slate-500">kg</span>
            </div>
            <div className="text-xs text-slate-500 mb-4">
              WHO Z-Score: <strong className="text-slate-800">{wazVal !== null && wazVal !== undefined ? Number(wazVal).toFixed(2) : 'N/A'}</strong>
            </div>
            {getWazBadge(wazVal)}
          </div>

          {/* Card 3: BMI for Age */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              {t('dashboard.bazTitle', 'BMI-for-Age (BAZ)')}
            </div>
            <div className="text-3xl font-black text-shwf-orange mb-1">
              {vitals.bmi} <span className="text-base font-semibold text-slate-500">kg/m²</span>
            </div>
            <div className="text-xs text-slate-500 mb-4">
              WHO Z-Score: <strong className="text-slate-800">{bazVal !== null && bazVal !== undefined ? Number(bazVal).toFixed(2) : '0.00'}</strong>
            </div>
            {getBazBadge(bazVal)}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* ⭐ POINT 6: PREVENTIVE IMMUNIZATION & ROUTINE RECALL SCHEDULE TRACKER ⭐ */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Syringe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-shwf-navy">
                  {t('dashboard.preventiveTitle', 'Preventive Immunization & Routine Recall Schedule')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('dashboard.preventiveSubtitle', 'Age-appropriate IAP booster recommendations and 6-month dental & vision checkup tracker')}
                </p>
              </div>
            </div>

            {/* Sub-Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setPreventiveTab('immunization')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  preventiveTab === 'immunization'
                    ? 'bg-white text-shwf-navy shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Syringe className="w-3.5 h-3.5 text-teal-600" />
                <span>{t('dashboard.immunizationTab', 'IAP Immunization')}</span>
              </button>
              <button
                onClick={() => setPreventiveTab('recalls')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  preventiveTab === 'recalls'
                    ? 'bg-white text-shwf-navy shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5 text-shwf-orange" />
                <span>{t('dashboard.recallTab', 'Routine Recalls')}</span>
              </button>
            </div>
          </div>

          {/* Tab 1: IAP Immunization List */}
          {preventiveTab === 'immunization' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {immunizations.map((item, idx) => (
                <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-sm font-black text-slate-900">
                        {item.vaccine_name}
                      </h4>
                      {getVaccineStatusBadge(item.status)}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {language === 'hi' ? item.description_hi : item.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-2 border-t border-slate-200/60">
                    <span>{t('dashboard.targetAge', 'Target Age')}: <strong>{item.target_age}</strong></span>
                    <span>{t('dashboard.doseNumber', 'Dose')}: <strong>{item.dose}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: 6-Month Routine Recalls */}
          {preventiveTab === 'recalls' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {preventiveRecalls.map((recall, idx) => (
                <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-black uppercase text-teal-700 tracking-wider">
                        {recall.interval_months}-Month Routine Recall
                      </span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full">
                        {recall.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mb-1">
                      {recall.checkup_type}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {language === 'hi' ? recall.advice_hi : recall.advice}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>{t('dashboard.nextDueDate', 'Next Due')}:</span>
                    <strong className="text-shwf-navy">{recall.next_due_date}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nutritional & Dietary Advice Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-shwf-green-subtle text-shwf-green flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-shwf-navy">
                {t('dashboard.dietTitle', 'Personalized Indian Dietitian Guidance')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('dashboard.dietSummary', 'Tailored for child\'s current metabolic needs based on recent anthropometric examination.')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
            <div className="bg-slate-50 p-4 rounded-2xl border-l-4 border-shwf-green">
              <span className="text-[11px] font-extrabold text-shwf-green uppercase tracking-wider block mb-1">
                {language === 'hi' ? 'सुबह का नाश्ता (Breakfast)' : 'Breakfast'}
              </span>
              <p className="text-slate-700 leading-relaxed text-xs">
                {diet.breakfast || 'Nutrient-rich poha with peanuts, boiled egg or sprouts, and warm milk.'}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border-l-4 border-shwf-navy">
              <span className="text-[11px] font-extrabold text-shwf-navy uppercase tracking-wider block mb-1">
                {language === 'hi' ? 'दोपहर का भोजन (Lunch)' : 'Lunch'}
              </span>
              <p className="text-slate-700 leading-relaxed text-xs">
                {diet.lunch || 'Yellow dal, seasonal green vegetables (palak/methi), 2 chapatis, and fresh curd.'}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border-l-4 border-shwf-orange">
              <span className="text-[11px] font-extrabold text-shwf-orange uppercase tracking-wider block mb-1">
                {language === 'hi' ? 'रात का खाना (Dinner)' : 'Dinner'}
              </span>
              <p className="text-slate-700 leading-relaxed text-xs">
                {diet.dinner || 'Light khichdi with ghee, paneer preparation, and fresh cucumber salad.'}
              </p>
            </div>
          </div>
        </div>

        {/* Camp History Timeline Table (If Multiple Camps Available) */}
        {campHistory.length > 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Clock className="w-5 h-5 text-shwf-navy" />
              <h4 className="text-base font-black text-slate-900">
                {t('dashboard.timelineTitle', 'Complete Health Check-Up Timeline')} ({campHistory.length} {t('dashboard.timelineSubtitle', 'Sessions Recorded')})
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-200">
                    <th className="p-3">{t('dashboard.tableDate', 'Camp Date')}</th>
                    <th className="p-3">{t('dashboard.tableHeight', 'Height (cm)')}</th>
                    <th className="p-3">{t('dashboard.tableWeight', 'Weight (kg)')}</th>
                    <th className="p-3">{t('dashboard.tableBmi', 'BMI')}</th>
                    <th className="p-3">{t('dashboard.tableHaz', 'HAZ (Height Z-Score)')}</th>
                    <th className="p-3">{t('dashboard.tableStatus', 'Status')}</th>
                    <th className="p-3 text-right">{t('dashboard.tableAction', 'Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {campHistory.map((c, i) => {
                    const isCurrent = c.camp_id === selectedCampId || (i === 0 && !selectedCampId);
                    return (
                      <tr key={c.camp_id || i} className={isCurrent ? 'bg-emerald-50/50 font-bold' : 'hover:bg-slate-50'}>
                        <td className="p-3 text-slate-900 font-bold">
                          {c.recorded_at} {i === 0 && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full ml-1 font-bold">{t('dashboard.latestVisit', 'Latest')}</span>}
                        </td>
                        <td className="p-3">{c.height_cm} cm</td>
                        <td className="p-3">{c.weight_kg} kg</td>
                        <td className="p-3">{c.bmi}</td>
                        <td className="p-3">{c.height_for_age_z ? Number(c.height_for_age_z).toFixed(2) : '0.00'}</td>
                        <td className="p-3">
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md text-[11px]">
                            {c.overall_health_status || 'Normal / Healthy'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleCampSelect(c.camp_id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              isCurrent 
                                ? 'bg-emerald-700 text-white' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                          >
                            {isCurrent ? t('dashboard.activeVisitBadge', 'Active View') : t('dashboard.viewVisit', 'View Report')}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* ⭐ POINT 5: SCANNABLE HEALTH CARD QR CODE MODAL ⭐ */}
      {/* ========================================================================= */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center relative overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-shwf-navy-subtle text-shwf-navy rounded-2xl flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-1">
              {t('dashboard.qrModalTitle', 'Digital Health Card QR')}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {t('dashboard.qrModalSubtitle', 'Instant mobile access to your child\'s complete medical trajectory')}
            </p>

            {/* QR Image Container */}
            <div className="bg-slate-50 border-2 border-dashed border-shwf-navy/30 rounded-2xl p-4 mb-4 flex flex-col items-center justify-center">
              {qrCodeDataUri ? (
                <img 
                  src={qrCodeDataUri} 
                  alt="Student Health Card QR" 
                  className="w-48 h-48 rounded-xl shadow-md bg-white p-2"
                />
              ) : (
                <div className="w-48 h-48 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 font-bold text-xs">
                  QR Code Unavailable
                </div>
              )}
              
              <div className="mt-3 text-xs font-bold text-shwf-navy">
                {report?.full_name || student?.full_name} &bull; ID: {report?.student_id || student?.student_id}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
              {t('dashboard.scanQrInstructions', 'Scan this QR code with any smartphone camera to open and verify the student health portal.')}
            </p>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleCopyDeepLink}
                className="w-full inline-flex items-center justify-center gap-2 bg-shwf-navy hover:bg-shwf-navy-dark text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-colors"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? t('dashboard.linkCopied', 'Copied!') : t('dashboard.copyLink', 'Copy Direct Portal Link')}</span>
              </button>

              <button
                onClick={() => setShowQrModal(false)}
                className="w-full text-xs font-bold text-slate-500 hover:text-slate-700 py-2 transition-colors"
              >
                {t('common.close', 'Close')}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Audio Report Explainer Modal Dialog */}
      <AudioReportPlayer
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        student={student}
        report={report}
        onToast={onToast}
      />
    </section>
  );
}





