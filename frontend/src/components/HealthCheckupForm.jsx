import React, { useState, useEffect } from 'react';
import {
  FileText,
  User,
  HeartPulse,
  Stethoscope,
  Eye,
  Activity,
  Award,
  Sparkles,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { API } from '../services/api';
import { INDIA_STATES, getDistrictsByState, getSchoolsForDistrict } from '../data/indiaGeoData';

export default function HealthCheckupForm({ adminToken, onToast }) {
  // Main Form State
  const [formData, setFormData] = useState({
    // 1. Student Information
    student: {
      school_name: 'St. Xavier Public School',
      student_id: 'STD-2026-001',
      full_name: 'Aarav Sharma',
      father_name: 'Rajesh Sharma',
      mother_name: 'Sunita Sharma',
      class_name: '5th',
      section: 'A',
      date_of_birth: '2014-06-15',
      gender: 'M',
      address: 'Plot 42, Civil Lines, Bhopal, MP',
      parent_phone: '+919876543210',
      emergency_contact: '+919424761140',
      aadhaar_no: '•••• •••• 4589',
      parent_email: 'rajesh.sharma@example.com',
    },

    // 2. Physical Examination
    physical_exam: {
      height_cm: 138.5,
      weight_kg: 31.0,
      bmi: 16.16,
      pallor: false,
      jaundice: false,
      clubbing: false,
      spo2: 99,
      lap: false,
      skin: 'Normal & Clear',
      allergy: false,
      allergy_details: '',
      nutrition: 'Good',
      heart_sound: 'S1 S2 Normal',
      chest: 'Clear (B/L)',
      other_findings: 'None',
    },

    // 3. General Examination
    general_exam: {
      temperature: '98.4 °F',
      pulse: '78 /min',
      respiration: '18 /min',
      blood_pressure: '110/70 mmHg',
      last_deworming_date: '2026-02-10',
    },

    // 4. Dental / Oral Examination
    dental: {
      status: 'Good', // 'Good' | 'Fair' | 'Poor'
      caries: false,
      gum_condition: 'Healthy',
      other_findings: 'Normal alignment',
    },

    // 5. E.N.T. Examination
    ent: {
      nose: 'Clear',
      throat: 'Healthy (No Tonsillitis)',
      ear_right: 'Tympanic Membrane Intact',
      ear_left: 'Tympanic Membrane Intact',
      audiometry: 'Normal B/L',
    },

    // 6. Eye Examination Table & Vision Screening
    eye: {
      right_eye: { sph: '0.00', cyl: '0.00', axis: '-', vision: '6/6', add: '-', color_vision: 'Normal', remarks: 'Clear' },
      left_eye: { sph: '0.00', cyl: '0.00', axis: '-', vision: '6/6', add: '-', color_vision: 'Normal', remarks: 'Clear' },
      near_vision: 'N6',
      vision_screening: 'Normal', // 'Normal' | 'Refractive Error' | 'Needs Further Evaluation'
    },

    // 7. Hearing Screening
    hearing: {
      right_ear: 'Normal', // 'Normal' | 'Reduced' | 'Referred'
      left_ear: 'Normal',
    },

    // 8. Vaccination Status
    vaccination: {
      status: 'Up to Date', // 'Up to Date' | 'Partially Completed' | 'Not Up to Date'
    },

    // 9. Health & Lifestyle
    lifestyle: {
      diet_pattern: 'Good', // 'Good' | 'Average' | 'Poor'
      physical_activity: 'Active', // 'Active' | 'Sedentary'
      sleep_pattern: 'Good', // 'Good' | 'Average' | 'Poor'
    },

    // 10. Pathology
    pathology: {
      blood_group: 'B+',
      hemoglobin: '13.2',
      cholesterol: '145',
    },

    // 11. Dietitian Recommendations
    diet_flags: {
      high_protein: false,
      iron_rich: false,
      calcium_rich: true,
      weight_gain: false,
      weight_management: false,
      others: true,
      others_text: 'Balanced diet with seasonal fruits and milk daily.',
    },
    dietitian_advice_line1: 'Include green leafy vegetables, dairy, pulses, and nuts daily.',
    dietitian_advice_line2: 'Encourage outdoor sports and maintain adequate hydration.',

    // 12. Doctor's Remarks & Authorization
    doctor_info: {
      overall_status: 'Normal / Healthy', // 'Normal / Healthy' | 'Minor Issues' | 'Needs Medical Follow-up' | 'Refer to Specialist'
      doctor_name: 'Dr. A. Sharma (MBBS, DCH)',
      exam_date: '2026-08-15',
      doctor_remarks: 'Healthy child with age-appropriate physical growth parameters. No active specialist intervention required.',
      clinical_opinion_line1: 'Overall physical growth parameters and nutritional vitals evaluated against WHO standards.',
      clinical_opinion_line2: 'Continue regular annual pediatric check-ups.',
    },
  });

  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [result, setResult] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('student'); // 'student' | 'physical' | 'specialist' | 'lifestyle' | 'doctor'

  const handleAdminDownloadPdf = async () => {
    setDownloadingPdf(true);
    if (onToast) onToast('Generating certified high-definition PDF report card...', 'info');
    try {
      const studentId = formData.student.student_id || 'STD-2026-001';
      const studentInfo = {
        student_id: studentId,
        full_name: formData.student.full_name || 'Aarav Sharma',
        school_name: formData.student.school_name || 'St. Xavier Public School',
        date_of_birth: formData.student.date_of_birth || '2014-06-15',
        gender: formData.student.gender || 'M',
        parent_name: formData.student.father_name || 'Rajesh Sharma',
        parent_phone: formData.student.parent_phone || '+91 9876543210',
      };
      const reportData = {
        student_id: studentId,
        full_name: formData.student.full_name,
        school_name: formData.student.school_name,
        vitals: {
          height_cm: parseFloat(formData.physical_exam.height_cm) || 138.5,
          weight_kg: parseFloat(formData.physical_exam.weight_kg) || 31.0,
          bmi: parseFloat(formData.physical_exam.bmi) || 16.16,
          gender: formData.student.gender || 'M',
          recorded_at: formData.doctor_info.exam_date || new Date().toISOString().slice(0, 10),
          doctor_remarks: formData.doctor_info.doctor_remarks || 'Healthy physical growth parameters.',
        },
        diet_plan: {
          summary: formData.dietitian_advice_line1 || 'Maintain balanced daily nutrition with protein and calcium focus.',
          breakfast: 'Poha with roasted peanuts, boiled egg or sprout salad, and 1 glass warm milk.',
          lunch: 'Dal tadka, seasonal green vegetable sabzi (palak/methi), 2 wheat chapatis, and curd.',
          dinner: 'Moong dal khichdi with ghee, paneer preparation, and fresh salad.',
        }
      };

      const res = await API.downloadReportPdf(
        studentId,
        adminToken,
        null,
        'en',
        reportData,
        studentInfo
      );
      if (res?.success) {
        if (onToast) onToast('Certified Health Report Card PDF downloaded successfully!', 'success');
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      if (onToast) onToast('Failed to download PDF. Please try again.', 'error');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Auto-calculate BMI whenever height or weight changes
  useEffect(() => {
    const h = parseFloat(formData.physical_exam.height_cm) || 0;
    const w = parseFloat(formData.physical_exam.weight_kg) || 0;
    if (h > 0 && w > 0) {
      const hm = h / 100.0;
      const computedBmi = (w / (hm * hm)).toFixed(2);
      setFormData((prev) => ({
        ...prev,
        physical_exam: { ...prev.physical_exam, bmi: parseFloat(computedBmi) },
      }));
    }
  }, [formData.physical_exam.height_cm, formData.physical_exam.weight_kg]);

  // Handle nested input changes
  const updateField = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateEyeRow = (eyeKey, col, value) => {
    setFormData((prev) => ({
      ...prev,
      eye: {
        ...prev.eye,
        [eyeKey]: {
          ...prev.eye[eyeKey],
          [col]: value,
        },
      },
    }));
  };

  // 1-Click Autofill Sample Data
  const handleAutofillSample = (type = 'normal') => {
    if (type === 'normal') {
      setFormData((prev) => ({
        ...prev,
        student: {
          ...prev.student,
          student_id: `STD-2026-${Math.floor(100 + Math.random() * 900)}`,
          full_name: 'Aarav Sharma',
          gender: 'M',
        },
        physical_exam: {
          ...prev.physical_exam,
          height_cm: 138.5,
          weight_kg: 31.0,
          spo2: 99,
          pallor: false,
          jaundice: false,
        },
        doctor_info: {
          ...prev.doctor_info,
          overall_status: 'Normal / Healthy',
          doctor_remarks: 'Healthy child. All growth vitals conform with WHO benchmarks.',
        },
      }));
      if (onToast) onToast('Loaded standard normal student sample data', 'info');
    }
  };

  // Submit and Generate PDF
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const payload = {
      student: formData.student,
      student_id: formData.student.student_id,
      full_name: formData.student.full_name,
      vitals: {
        height_cm: formData.physical_exam.height_cm,
        weight_kg: formData.physical_exam.weight_kg,
        doctor_remarks: formData.doctor_info.doctor_remarks,
      },
      physical_exam: formData.physical_exam,
      general_exam: formData.general_exam,
      dental: formData.dental,
      ent: formData.ent,
      eye: formData.eye,
      hearing: formData.hearing,
      vaccination: formData.vaccination,
      lifestyle: formData.lifestyle,
      pathology: formData.pathology,
      diet_flags: formData.diet_flags,
      dietitian_advice_line1: formData.dietitian_advice_line1,
      dietitian_advice_line2: formData.dietitian_advice_line2,
      doctor_name: formData.doctor_info.doctor_name,
      exam_date: formData.doctor_info.exam_date,
      overall_status: formData.doctor_info.overall_status,
      clinical_opinion_line1: formData.doctor_info.clinical_opinion_line1,
      clinical_opinion_line2: formData.doctor_info.clinical_opinion_line2,
    };

    try {
      const res = await API.saveAndGenerateHealthReport(payload, adminToken);
      setResult(res);
      if (onToast) onToast(`PDF Report Card generated successfully for ${formData.student.full_name}!`, 'success');
    } catch (err) {
      if (onToast) onToast(err.message || 'Failed to generate PDF report', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Autofill */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-shwf-orange" />
            <h4 className="text-sm font-extrabold text-slate-900">
              Student Complete Health Check-Up Sheet (Certified A4 Format)
            </h4>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Fill out clinical vitals, dental, ENT, eye refraction & pathology to generate the official certified report card.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleAutofillSample('normal')}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-shwf-navy border border-slate-300 font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-shwf-orange" />
          <span>Autofill Sample Data</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-100 p-1.5 rounded-2xl gap-1.5 overflow-x-auto text-xs font-bold">
        {[
          { id: 'student', label: '1. Student & School', icon: User },
          { id: 'physical', label: '2. Physical & Vitals', icon: HeartPulse },
          { id: 'specialist', label: '3. Dental, ENT & Eyes', icon: Eye },
          { id: 'lifestyle', label: '4. Pathology & Diet', icon: Stethoscope },
          { id: 'doctor', label: '5. Doctor Assessment', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl transition-all whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'bg-white text-shwf-navy shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${activeSubTab === tab.id ? 'text-shwf-orange' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SUBTAB 1: STUDENT & SCHOOL PROFILE */}
        {activeSubTab === 'student' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 animate-fadeIn">
            <h5 className="text-xs font-black text-shwf-navy uppercase tracking-wider border-b border-slate-100 pb-2">
              Student & Guardian Demographics
            </h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">School Name *</label>
                <input
                  type="text"
                  value={formData.student.school_name}
                  onChange={(e) => updateField('student', 'school_name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Student ID / Roll No *</label>
                <input
                  type="text"
                  value={formData.student.student_id}
                  onChange={(e) => updateField('student', 'student_id', e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-shwf-navy uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Student Full Name *</label>
                <input
                  type="text"
                  value={formData.student.full_name}
                  onChange={(e) => updateField('student', 'full_name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Class</label>
                <input
                  type="text"
                  value={formData.student.class_name}
                  onChange={(e) => updateField('student', 'class_name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Section</label>
                <input
                  type="text"
                  value={formData.student.section}
                  onChange={(e) => updateField('student', 'section', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.student.date_of_birth}
                  onChange={(e) => updateField('student', 'date_of_birth', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Gender</label>
                <select
                  value={formData.student.gender}
                  onChange={(e) => updateField('student', 'gender', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Father's Name</label>
                <input
                  type="text"
                  value={formData.student.father_name}
                  onChange={(e) => updateField('student', 'father_name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Mother's Name</label>
                <input
                  type="text"
                  value={formData.student.mother_name}
                  onChange={(e) => updateField('student', 'mother_name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Parent Phone (for OTP login) *</label>
                <input
                  type="text"
                  value={formData.student.parent_phone}
                  onChange={(e) => updateField('student', 'parent_phone', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-shwf-navy"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Residential Address</label>
                <input
                  type="text"
                  value={formData.student.address}
                  onChange={(e) => updateField('student', 'address', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Aadhaar No. (Optional)</label>
                <input
                  type="text"
                  value={formData.student.aadhaar_no}
                  onChange={(e) => updateField('student', 'aadhaar_no', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: PHYSICAL & GENERAL EXAMINATION */}
        {activeSubTab === 'physical' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 animate-fadeIn">
            
            {/* Height, Weight & Auto BMI */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4">
              <div className="text-xs font-black text-emerald-900 uppercase tracking-wider mb-3">
                Core Anthropometric Vitals
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">1. Height (cm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.physical_exam.height_cm}
                    onChange={(e) => updateField('physical_exam', 'height_cm', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">2. Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.physical_exam.weight_kg}
                    onChange={(e) => updateField('physical_exam', 'weight_kg', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">3. Body Mass Index (BMI)</label>
                  <div className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs font-black text-emerald-700">
                    {formData.physical_exam.bmi} kg/m² (Auto-Calculated)
                  </div>
                </div>
              </div>
            </div>

            {/* General Vitals */}
            <div>
              <div className="text-xs font-black text-shwf-navy uppercase tracking-wider mb-3">
                General Examination Vitals
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Temperature</label>
                  <input
                    type="text"
                    value={formData.general_exam.temperature}
                    onChange={(e) => updateField('general_exam', 'temperature', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Pulse (/min)</label>
                  <input
                    type="text"
                    value={formData.general_exam.pulse}
                    onChange={(e) => updateField('general_exam', 'pulse', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Respiration</label>
                  <input
                    type="text"
                    value={formData.general_exam.respiration}
                    onChange={(e) => updateField('general_exam', 'respiration', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={formData.general_exam.blood_pressure}
                    onChange={(e) => updateField('general_exam', 'blood_pressure', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Last Deworming</label>
                  <input
                    type="text"
                    value={formData.general_exam.last_deworming_date}
                    onChange={(e) => updateField('general_exam', 'last_deworming_date', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Clinical Signs */}
            <div className="border-t border-slate-100 pt-4">
              <div className="text-xs font-black text-shwf-navy uppercase tracking-wider mb-3">
                Physical Examination Signs
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-700">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.physical_exam.pallor}
                    onChange={(e) => updateField('physical_exam', 'pallor', e.target.checked)}
                    className="w-4 h-4 text-shwf-navy rounded"
                  />
                  <span>4. Pallor Present</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.physical_exam.jaundice}
                    onChange={(e) => updateField('physical_exam', 'jaundice', e.target.checked)}
                    className="w-4 h-4 text-shwf-navy rounded"
                  />
                  <span>5. Jaundice Present</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.physical_exam.clubbing}
                    onChange={(e) => updateField('physical_exam', 'clubbing', e.target.checked)}
                    className="w-4 h-4 text-shwf-navy rounded"
                  />
                  <span>6. Clubbing Present</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.physical_exam.lap}
                    onChange={(e) => updateField('physical_exam', 'lap', e.target.checked)}
                    className="w-4 h-4 text-shwf-navy rounded"
                  />
                  <span>8. LAP Present</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">7. SpO2 (%)</label>
                  <input
                    type="number"
                    value={formData.physical_exam.spo2}
                    onChange={(e) => updateField('physical_exam', 'spo2', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">9. Skin</label>
                  <input
                    type="text"
                    value={formData.physical_exam.skin}
                    onChange={(e) => updateField('physical_exam', 'skin', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">11. Nutrition</label>
                  <input
                    type="text"
                    value={formData.physical_exam.nutrition}
                    onChange={(e) => updateField('physical_exam', 'nutrition', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: DENTAL, E.N.T. & EYE EXAMINATION */}
        {activeSubTab === 'specialist' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 animate-fadeIn">
            
            {/* Dental & ENT Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Dental */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50/50">
                <div className="text-xs font-black text-cyan-800 uppercase tracking-wider">
                  Dental / Oral Examination
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={formData.dental.status}
                    onChange={(e) => updateField('dental', 'status', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="Good">Good / Healthy</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor (Intervention Required)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.dental.caries}
                    onChange={(e) => updateField('dental', 'caries', e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-700">Dental Caries Detected</span>
                </div>
              </div>

              {/* ENT */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50/50">
                <div className="text-xs font-black text-purple-900 uppercase tracking-wider">
                  E.N.T. Examination
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Nose</label>
                    <input
                      type="text"
                      value={formData.ent.nose}
                      onChange={(e) => updateField('ent', 'nose', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Throat</label>
                    <input
                      type="text"
                      value={formData.ent.throat}
                      onChange={(e) => updateField('ent', 'throat', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Eye Examination Refraction Table */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-xs font-black text-blue-900 uppercase tracking-wider">
                  Eye Examination & Vision Screening Grid
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600">Vision Screening:</span>
                  <select
                    value={formData.eye.vision_screening}
                    onChange={(e) => updateField('eye', 'vision_screening', e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-blue-900"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Refractive Error">Refractive Error</option>
                    <option value="Needs Further Evaluation">Needs Further Evaluation</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-300 bg-white">
                  <thead>
                    <tr className="bg-slate-100 text-[10px] font-bold uppercase text-slate-700 text-center">
                      <th className="border border-slate-300 p-1.5">Eye</th>
                      <th className="border border-slate-300 p-1.5">SPH</th>
                      <th className="border border-slate-300 p-1.5">CYL</th>
                      <th className="border border-slate-300 p-1.5">AXIS</th>
                      <th className="border border-slate-300 p-1.5">VISION</th>
                      <th className="border border-slate-300 p-1.5">ADD</th>
                      <th className="border border-slate-300 p-1.5">COLOR VISION</th>
                      <th className="border border-slate-300 p-1.5">REMARKS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Right Eye */}
                    <tr className="text-center">
                      <td className="border border-slate-300 p-1.5 font-bold text-slate-900">Right Eye (OD)</td>
                      {['sph', 'cyl', 'axis', 'vision', 'add', 'color_vision', 'remarks'].map((col) => (
                        <td key={col} className="border border-slate-300 p-1">
                          <input
                            type="text"
                            value={formData.eye.right_eye[col]}
                            onChange={(e) => updateEyeRow('right_eye', col, e.target.value)}
                            className="w-full text-center bg-slate-50 rounded px-1 py-1 text-xs"
                          />
                        </td>
                      ))}
                    </tr>

                    {/* Left Eye */}
                    <tr className="text-center">
                      <td className="border border-slate-300 p-1.5 font-bold text-slate-900">Left Eye (OS)</td>
                      {['sph', 'cyl', 'axis', 'vision', 'add', 'color_vision', 'remarks'].map((col) => (
                        <td key={col} className="border border-slate-300 p-1">
                          <input
                            type="text"
                            value={formData.eye.left_eye[col]}
                            onChange={(e) => updateEyeRow('left_eye', col, e.target.value)}
                            className="w-full text-center bg-slate-50 rounded px-1 py-1 text-xs"
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hearing Screening */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs font-black text-amber-900 uppercase tracking-wider">
                Hearing Screening
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span>Right Ear:</span>
                  <select
                    value={formData.hearing.right_ear}
                    onChange={(e) => updateField('hearing', 'right_ear', e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Reduced">Reduced</option>
                    <option value="Referred">Referred</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span>Left Ear:</span>
                  <select
                    value={formData.hearing.left_ear}
                    onChange={(e) => updateField('hearing', 'left_ear', e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Reduced">Reduced</option>
                    <option value="Referred">Referred</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: PATHOLOGY & DIET */}
        {activeSubTab === 'lifestyle' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 animate-fadeIn">
            
            {/* Pathology Test Report */}
            <div>
              <div className="text-xs font-black text-teal-900 uppercase tracking-wider mb-3">
                Pathology Test Report
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Blood Group</label>
                  <select
                    value={formData.pathology.blood_group}
                    onChange={(e) => updateField('pathology', 'blood_group', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Hemoglobin (Hb in g/dL)</label>
                  <input
                    type="text"
                    value={formData.pathology.hemoglobin}
                    onChange={(e) => updateField('pathology', 'hemoglobin', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Cholesterol (mg/dL)</label>
                  <input
                    type="text"
                    value={formData.pathology.cholesterol}
                    onChange={(e) => updateField('pathology', 'cholesterol', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Dietitian Recommendation Checkboxes */}
            <div className="border-t border-slate-100 pt-4">
              <div className="text-xs font-black text-amber-900 uppercase tracking-wider mb-3">
                Dietitian Recommendations & Advice
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-semibold text-slate-700 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.diet_flags.high_protein}
                    onChange={(e) => updateField('diet_flags', 'high_protein', e.target.checked)}
                    className="w-4 h-4 text-shwf-orange rounded"
                  />
                  <span>High Protein Diet</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.diet_flags.iron_rich}
                    onChange={(e) => updateField('diet_flags', 'iron_rich', e.target.checked)}
                    className="w-4 h-4 text-shwf-orange rounded"
                  />
                  <span>Iron Rich Diet</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.diet_flags.calcium_rich}
                    onChange={(e) => updateField('diet_flags', 'calcium_rich', e.target.checked)}
                    className="w-4 h-4 text-shwf-orange rounded"
                  />
                  <span>Calcium Rich Diet</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.diet_flags.weight_gain}
                    onChange={(e) => updateField('diet_flags', 'weight_gain', e.target.checked)}
                    className="w-4 h-4 text-shwf-orange rounded"
                  />
                  <span>Weight Gain Diet Plan</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.diet_flags.weight_management}
                    onChange={(e) => updateField('diet_flags', 'weight_management', e.target.checked)}
                    className="w-4 h-4 text-shwf-orange rounded"
                  />
                  <span>Weight Management Diet</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Dietitian's Advice (Based on Test Results)</label>
                <textarea
                  rows="2"
                  value={formData.dietitian_advice_line1}
                  onChange={(e) => setFormData({ ...formData, dietitian_advice_line1: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 5: DOCTOR'S ASSESSMENT & SIGN-OFF */}
        {activeSubTab === 'doctor' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 animate-fadeIn">
            
            {/* Overall Health Classification */}
            <div>
              <label className="block text-xs font-black text-shwf-navy uppercase tracking-wider mb-2">
                Overall Health Status Classification *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'Normal / Healthy', label: 'Normal / Healthy' },
                  { id: 'Minor Issues', label: 'Minor Issues (Advice Given)' },
                  { id: 'Needs Medical Follow-up', label: 'Needs Medical Follow-up' },
                  { id: 'Refer to Specialist', label: 'Refer to Specialist' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => updateField('doctor_info', 'overall_status', st.id)}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      formData.doctor_info.overall_status === st.id
                        ? 'border-shwf-navy bg-shwf-navy text-white shadow-md'
                        : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Doctor Remarks / Medical Opinion</label>
              <textarea
                rows="3"
                value={formData.doctor_info.doctor_remarks}
                onChange={(e) => updateField('doctor_info', 'doctor_remarks', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Doctor's Name & Qualifications</label>
                <input
                  type="text"
                  value={formData.doctor_info.doctor_name}
                  onChange={(e) => updateField('doctor_info', 'doctor_name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Examination Date</label>
                <input
                  type="date"
                  value={formData.doctor_info.exam_date}
                  onChange={(e) => updateField('doctor_info', 'exam_date', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit & Generate Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-500">
            Certified Playwright PDF generation engine • WHO LMS Z-score compliance
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-shwf-navy via-slate-900 to-shwf-navy hover:from-shwf-navy-dark hover:to-shwf-navy text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Record & Rendering Certified PDF...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-shwf-orange" />
                <span>Save Record & Generate Certified PDF</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generation Result Banner & Download Button */}
      {result && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-6 shadow-md animate-fadeIn space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-emerald-950">
                  {result.message || 'Report Card Generated Successfully!'}
                </h4>
                <p className="text-xs text-emerald-800">
                  WHO Status: <strong>{result.summary?.who_status || 'Normal Growth'}</strong> (BMI: {result.summary?.bmi})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAdminDownloadPdf}
                disabled={downloadingPdf}
                className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-xs px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                {downloadingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{downloadingPdf ? 'Generating PDF...' : 'Download Certified PDF Report Card'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
