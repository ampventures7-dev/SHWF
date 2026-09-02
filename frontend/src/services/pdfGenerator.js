/**
 * SMART HEALTH WELFARE FOUNDATION - OFFICIAL REPORT CARD PDF GENERATOR
 * Renders the EXACT official certified A4 single-page format matching:
 * - Top: "॥ नमामि देवी नर्मदे ॥" & "Reg. No. 04/16/03/20319/24"
 * - Left/Right Swachh Bharat & Atmanirbhar Bharat Emblems
 * - Center "Smart Health Welfare Foundation" Logo
 * - Blue Banner: "STUDENT COMPLETE HEALTH CHECK-UP REPORT"
 * - 1. Student Information Grid + Photo Box
 * - 2. Physical Examination (1 to 14 with numbered circles)
 * - 3. General Examination (Temp, Pulse, Resp, BP, Last Deworming + Medical Icons)
 * - 4. Dental / Oral Examination (with cartoon tooth)
 * - 5. E.N.T. Examination (Nose, Throat, Ear R/L, Audiometry)
 * - 6. Eye Examination Table & Vision Screening (Snellen Chart)
 * - 7. Hearing Screening, Vaccination Status, Health & Lifestyle
 * - 8. Dietitian Recommendation / Nutrition Advice
 * - 9. Pathology Test Report & Other Recommendations / Referral
 * - 10. Overall Health Status, Remark/Opinion, Signatures & Live QR Code
 * - Bottom Bar: Website, Email, Helpline (+91 9424 761140) & "Healthy Students, Strong Nation"
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateStudentPdf(reportData, studentInfo, lang = 'en') {
  const isHindi = lang === 'hi';

  // Normalize student demographic values
  const student = {
    school_name: reportData?.school_name || studentInfo?.school_name || 'St. Xavier Public School',
    full_name: reportData?.full_name || studentInfo?.full_name || 'Aarav Sharma',
    student_id: reportData?.student_id || studentInfo?.student_id || 'STD-2026-001',
    father_name: studentInfo?.father_name || studentInfo?.parent_name || 'Rajesh Sharma',
    mother_name: studentInfo?.mother_name || 'Sunita Sharma',
    class_name: studentInfo?.class_name || 'V',
    section: studentInfo?.section || 'A',
    date_of_birth: studentInfo?.date_of_birth || '2014-06-15',
    gender: reportData?.vitals?.gender || studentInfo?.gender || 'M',
    age_months: reportData?.vitals?.age_months || 126,
    address: studentInfo?.address || 'Civil Lines, Partner School Campus',
    parent_phone: studentInfo?.parent_phone || '+91 9876543210',
    emergency_contact: studentInfo?.emergency_contact || studentInfo?.parent_phone || '+91 9876543210',
    aadhaar_no: studentInfo?.aadhaar_no || 'XXXX-XXXX-4821',
  };

  const ageYears = Math.floor(student.age_months / 12);
  const ageMonths = student.age_months % 12;
  const ageDisplay = ageYears > 0 ? `${ageYears} Yrs ${ageMonths} M` : `${ageMonths} Months`;

  // Vitals & Z-Scores
  const vitals = reportData?.vitals || {};
  const zscores = reportData?.zscores || {};
  const heightCm = vitals.height_cm || 138.5;
  const weightKg = vitals.weight_kg || 31.0;
  const bmiVal = vitals.bmi || (weightKg / ((heightCm / 100) ** 2)).toFixed(2);
  const recordedDate = reportData?.recorded_at?.slice(0, 10) || vitals.recorded_at?.slice(0, 10) || new Date().toISOString().slice(0, 10);

  // Dietitian advice lines
  const dietPlan = reportData?.diet_plan || {};
  const dietSummary = dietPlan.summary || 'Maintain balanced daily nutrition with adequate protein, calcium, and green vegetables.';
  const dietAdvice1 = (dietPlan.recommendations && dietPlan.recommendations[0]) || 'Include daily whole pulses, milk/curd, seasonal fruits, and green leafy vegetables.';
  const dietAdvice2 = (dietPlan.recommendations && dietPlan.recommendations[1]) || 'Encourage active outdoor physical games and ensure 1.5 to 2 Liters daily hydration.';

  // Checkbox helpers
  const cb = (checked) => checked 
    ? `<span style="display:inline-block;width:9px;height:9px;border:1px solid #1a237e;border-radius:1.5px;background:#e8eaf6;color:#0d47a1;font-size:7px;line-height:8px;text-align:center;font-weight:bold;margin:0 2px;">&#10003;</span>`
    : `<span style="display:inline-block;width:9px;height:9px;border:1px solid #616161;border-radius:1.5px;background:#fff;margin:0 2px;"></span>`;

  // Determine active diet checkboxes
  const risks = reportData?.risks || [];
  const riskNames = risks.map(r => r.risk_name);
  const isHighProtein = riskNames.includes('stunting_risk') || riskNames.includes('thinness_risk');
  const isIronRich = riskNames.includes('underweight_risk');
  const isCalciumRich = riskNames.includes('stunting_risk');
  const isWeightGain = riskNames.includes('underweight_risk') || riskNames.includes('thinness_risk');
  const isWeightMgmt = riskNames.includes('overweight_risk') || riskNames.includes('obesity_risk');
  const isBalancedOther = !(isHighProtein || isIronRich || isCalciumRich || isWeightGain || isWeightMgmt);

  // QR Code URL or SVG
  const qrUri = reportData?.qr_code_data_uri || null;

  // Build the EXACT HTML template
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '794px'; // Exact A4 width in px at 96dpi
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1a1a1a';
  container.style.fontFamily = "'Segoe UI', Roboto, Arial, sans-serif";
  container.style.fontSize = '8.8px';
  container.style.lineHeight = '1.18';
  container.style.boxSizing = 'border-box';
  container.style.padding = '8px 10px';

  container.innerHTML = `
    <div style="border: 1.5px solid #0d47a1; border-radius: 4px; padding: 6px 8px; background: #fff; width: 100%; box-sizing: border-box;">
      
      <!-- Top Meta -->
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:9.5px; font-weight:700; margin-bottom:2px;">
        <div></div>
        <div style="flex-grow:1; text-align:center; color:#1b5e20; font-size:11px; font-weight:800; letter-spacing:0.5px;">॥ नमामि देवी नर्मदे ॥</div>
        <div style="border:1px solid #1a237e; border-radius:3px; padding:1px 6px; font-size:8px; font-weight:700; color:#0d47a1; background:#f8fafc;">Reg. No. 04/16/03/20319/24</div>
      </div>

      <!-- Header Branding -->
      <div style="display:flex; align-items:center; justify-content:space-between; padding:2px 4px 4px 4px;">
        <!-- Left Emblem -->
        <div style="display:flex; flex-direction:column; align-items:center; width:75px; text-align:center;">
          <svg style="width:34px; height:34px;" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e65100" stroke-width="6"/>
            <path d="M 25 50 Q 50 20 75 50 Q 50 80 25 50 Z" fill="#2e7d32"/>
            <circle cx="50" cy="50" r="14" fill="#0d47a1"/>
          </svg>
          <div style="font-size:7px; font-weight:800; color:#212121; line-height:1.1; margin-top:2px;">
            स्वस्थ भारत मिशन<br><span style="color:#0d47a1;">आत्मनिर्भर भारत</span>
          </div>
        </div>

        <!-- Center Logo -->
        <div style="display:flex; flex-direction:column; align-items:center; text-align:center;">
          <svg style="width:36px; height:36px; margin-bottom:-2px;" viewBox="0 0 100 100">
            <path d="M 50 15 C 30 15 15 35 15 55 C 15 75 40 90 50 95 C 60 90 85 75 85 55 C 85 35 70 15 50 15 Z" fill="none" stroke="#2e7d32" stroke-width="6"/>
            <circle cx="50" cy="40" r="10" fill="#e65100"/>
            <path d="M 30 65 Q 50 45 70 65" stroke="#0d47a1" stroke-width="6" fill="none" stroke-linecap="round"/>
          </svg>
          <div style="font-size:22px; font-weight:900; letter-spacing:-0.5px; line-height:1;">
            <span style="color:#0d47a1;">Smart</span><span style="color:#2e7d32;">Health</span>
          </div>
          <div style="font-size:9.5px; font-weight:800; color:#e65100; letter-spacing:1.5px; text-transform:uppercase; margin-top:1px;">
            Welfare Foundation
          </div>
        </div>

        <!-- Right Emblem -->
        <div style="display:flex; flex-direction:column; align-items:center; width:75px; text-align:center;">
          <svg style="width:34px; height:34px;" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e65100" stroke-width="6"/>
            <path d="M 25 50 Q 50 20 75 50 Q 50 80 25 50 Z" fill="#2e7d32"/>
            <circle cx="50" cy="50" r="14" fill="#0d47a1"/>
          </svg>
          <div style="font-size:7px; font-weight:800; color:#212121; line-height:1.1; margin-top:2px;">
            स्वस्थ भारत मिशन<br><span style="color:#0d47a1;">आत्मनिर्भर भारत</span>
          </div>
        </div>
      </div>

      <!-- Main Banner -->
      <div style="background:#0d47a1; color:#ffffff; text-align:center; font-size:12px; font-weight:900; letter-spacing:1px; padding:4px 0; border-radius:4px; margin:2px 0 5px 0; text-transform:uppercase;">
        STUDENT COMPLETE HEALTH CHECK-UP REPORT
      </div>

      <!-- 1. Student Information -->
      <div style="border:1px solid #a5d6a7; border-radius:4px; margin-bottom:5px; padding:4px 6px; background:#fff;">
        <div style="display:flex; align-items:center; font-size:9px; font-weight:900; color:#2e7d32; text-transform:uppercase; gap:4px; margin-bottom:3px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#2e7d32"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          Student Information
        </div>
        <div style="display:grid; grid-template-columns: 1.15fr 1.25fr 60px; gap:8px; align-items:start;">
          <!-- Col 1 -->
          <table style="width:100%; border-collapse:collapse; font-size:8.2px;">
            <tr><td style="font-weight:700; color:#212121; width:80px;">School Name</td><td>:</td><td style="border-bottom:1px dotted #9e9e9e; padding-left:3px; font-weight:600;">${student.school_name}</td></tr>
            <tr><td style="font-weight:700; color:#212121;">Student Name</td><td>:</td><td style="border-bottom:1px dotted #9e9e9e; padding-left:3px; font-weight:800; color:#0d47a1;">${student.full_name}</td></tr>
            <tr><td style="font-weight:700; color:#212121;">Father's Name</td><td>:</td><td style="border-bottom:1px dotted #9e9e9e; padding-left:3px;">${student.father_name}</td></tr>
            <tr><td style="font-weight:700; color:#212121;">Mother's Name</td><td>:</td><td style="border-bottom:1px dotted #9e9e9e; padding-left:3px;">${student.mother_name}</td></tr>
            <tr><td style="font-weight:700; color:#212121;">Class / Section</td><td>:</td><td style="border-bottom:1px dotted #9e9e9e; padding-left:3px;">${student.class_name} / ${student.section}</td></tr>
            <tr><td style="font-weight:700; color:#212121;">Roll No. / Student ID</td><td>:</td><td style="border-bottom:1px dotted #9e9e9e; padding-left:3px; font-weight:800; color:#0d47a1;">${student.student_id}</td></tr>
          </table>

          <!-- Col 2 -->
          <table style="width:100%; border-collapse:collapse; font-size:8.2px;">
            <tr><td style="font-weight:700; color:#212121; width:85px;">Date of Birth</td><td>:</td><td style="border-bottom:1px dotted #9e9e9e; padding-left:3px;">${student.date_of_birth}</td></tr>
            <tr><td style="font-weight:700; color:#212121;">Age / Gender</td><td>:</td><td style="border-bottom:1px dotted #9e9e9e; padding-left:3px; font-weight:600;">
              ${ageDisplay} &nbsp;|&nbsp; 
              ${cb(student.gender === 'M')} Male &nbsp;
              ${cb(student.gender === 'F')} Female &nbsp;
              ${cb(student.gender === 'O')} Other
            </td></tr>
            <tr><td style="font-weight:700; color:#212121;">Address</td><td>:</td><td style="border-bottom:1px dotted #9e9e9e; padding-left:3px;">${student.address}</td></tr>
            <tr><td style="font-weight:700; color:#212121;">Parent Contact No.</td><td>:</td><td style="border-bottom:1px dotted #9e9e9e; padding-left:3px;">${student.parent_phone}</td></tr>
            <tr><td style="font-weight:700; color:#212121;">Emergency Contact</td><td>:</td><td style="border-bottom:1px dotted #9e9e9e; padding-left:3px;">${student.emergency_contact}</td></tr>
            <tr><td style="font-weight:700; color:#212121;">Aadhaar No. (Optional)</td><td>:</td><td style="border-bottom:1px dotted #9e9e9e; padding-left:3px;">${student.aadhaar_no}</td></tr>
          </table>

          <!-- Col 3: Photo Box -->
          <div style="border:1px solid #9e9e9e; border-radius:3px; height:68px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f8fafc; color:#64748b; font-size:7.5px; font-weight:800;">
            <svg style="width:26px; height:26px; fill:#94a3b8; margin-bottom:2px;" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            PHOTO
          </div>
        </div>
      </div>

      <!-- 2. Physical & General & Dental & ENT Examinations -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; margin-bottom:4px;">
        
        <!-- Left: Physical Examination -->
        <div style="border:1px solid #a5d6a7; border-radius:4px; padding:3px 5px; background:#fff;">
          <div style="display:flex; align-items:center; font-size:9px; font-weight:900; color:#2e7d32; text-transform:uppercase; gap:4px; margin-bottom:3px;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#2e7d32"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
            Physical Examination
          </div>
          
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
            <div style="font-weight:600; color:#333; display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; background:#2e7d32; color:#fff; border-radius:50%; text-align:center; line-height:12px; font-size:7px; font-weight:bold;">1</span> Height</div>
            <div style="border:1px solid #757575; border-radius:2px; padding:0.5px 5px; min-width:50px; text-align:center; font-weight:700; background:#fff;">${heightCm} cm</div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
            <div style="font-weight:600; color:#333; display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; background:#2e7d32; color:#fff; border-radius:50%; text-align:center; line-height:12px; font-size:7px; font-weight:bold;">2</span> Weight</div>
            <div style="border:1px solid #757575; border-radius:2px; padding:0.5px 5px; min-width:50px; text-align:center; font-weight:700; background:#fff;">${weightKg} kg</div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
            <div style="font-weight:600; color:#333; display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; background:#2e7d32; color:#fff; border-radius:50%; text-align:center; line-height:12px; font-size:7px; font-weight:bold;">3</span> Body Mass Index (BMI)</div>
            <div style="border:1px solid #757575; border-radius:2px; padding:0.5px 5px; min-width:50px; text-align:center; font-weight:700; background:#fff;">${bmiVal} kg/m²</div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
            <div style="font-weight:600; color:#333; display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; background:#2e7d32; color:#fff; border-radius:50%; text-align:center; line-height:12px; font-size:7px; font-weight:bold;">4</span> Pallor</div>
            <div>${cb(false)} Yes &nbsp; ${cb(true)} No</div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
            <div style="font-weight:600; color:#333; display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; background:#2e7d32; color:#fff; border-radius:50%; text-align:center; line-height:12px; font-size:7px; font-weight:bold;">5</span> Jaundice</div>
            <div>${cb(false)} Yes &nbsp; ${cb(true)} No</div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
            <div style="font-weight:600; color:#333; display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; background:#2e7d32; color:#fff; border-radius:50%; text-align:center; line-height:12px; font-size:7px; font-weight:bold;">6</span> Clubbing</div>
            <div>${cb(false)} Yes &nbsp; ${cb(true)} No</div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
            <div style="font-weight:600; color:#333; display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; background:#2e7d32; color:#fff; border-radius:50%; text-align:center; line-height:12px; font-size:7px; font-weight:bold;">7</span> SpO₂ (Oxygen Saturation)</div>
            <div style="border:1px solid #757575; border-radius:2px; padding:0.5px 5px; min-width:50px; text-align:center; font-weight:700; background:#fff;">99 %</div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
            <div style="font-weight:600; color:#333; display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; background:#2e7d32; color:#fff; border-radius:50%; text-align:center; line-height:12px; font-size:7px; font-weight:bold;">8</span> LAP (Lymphadenopathy)</div>
            <div>${cb(false)} Yes &nbsp; ${cb(true)} No</div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
            <div style="font-weight:600; color:#333; display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; background:#2e7d32; color:#fff; border-radius:50%; text-align:center; line-height:12px; font-size:7px; font-weight:bold;">9</span> Skin</div>
            <div style="border:1px solid #757575; border-radius:2px; padding:0.5px 4px; min-width:75px; text-align:center; font-weight:600; background:#fff;">Clear / Normal</div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
            <div style="font-weight:600; color:#333; display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; background:#2e7d32; color:#fff; border-radius:50%; text-align:center; line-height:12px; font-size:7px; font-weight:bold;">10</span> Allergy</div>
            <div>${cb(false)} Yes &nbsp; ${cb(true)} No</div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
            <div style="font-weight:600; color:#555; padding-left:16px;">If Yes, Specify:</div>
            <div style="border:1px solid #757575; border-radius:2px; padding:0.5px 4px; min-width:75px; text-align:center; font-weight:600; background:#fff;">None</div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
            <div style="font-weight:600; color:#333; display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; background:#2e7d32; color:#fff; border-radius:50%; text-align:center; line-height:12px; font-size:7px; font-weight:bold;">11</span> Nutrition</div>
            <div style="border:1px solid #757575; border-radius:2px; padding:0.5px 4px; min-width:75px; text-align:center; font-weight:600; background:#fff;">Adequate / Normal</div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
            <div style="font-weight:600; color:#333; display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; background:#2e7d32; color:#fff; border-radius:50%; text-align:center; line-height:12px; font-size:7px; font-weight:bold;">12</span> Heart Sound</div>
            <div style="border:1px solid #757575; border-radius:2px; padding:0.5px 4px; min-width:75px; text-align:center; font-weight:600; background:#fff;">Normal S1 S2</div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
            <div style="font-weight:600; color:#333; display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; background:#2e7d32; color:#fff; border-radius:50%; text-align:center; line-height:12px; font-size:7px; font-weight:bold;">13</span> Chest</div>
            <div style="border:1px solid #757575; border-radius:2px; padding:0.5px 4px; min-width:75px; text-align:center; font-weight:600; background:#fff;">Clear Bilaterally</div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
            <div style="font-weight:600; color:#333; display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; background:#2e7d32; color:#fff; border-radius:50%; text-align:center; line-height:12px; font-size:7px; font-weight:bold;">14</span> Other Findings</div>
            <div style="border:1px solid #757575; border-radius:2px; padding:0.5px 4px; min-width:75px; text-align:center; font-weight:600; background:#fff;">None</div>
          </div>
        </div>

        <!-- Right: General + Dental + ENT -->
        <div>
          <!-- General Examination -->
          <div style="border:1px solid #90caf9; border-radius:4px; padding:3px 5px; background:#fff; margin-bottom:4px;">
            <div style="display:flex; align-items:center; font-size:9px; font-weight:900; color:#0d47a1; text-transform:uppercase; gap:4px; margin-bottom:3px;">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#0d47a1"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              General Examination
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
              <div style="font-weight:600; color:#333; display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; background:#0d47a1; color:#fff; border-radius:50%; text-align:center; line-height:12px; font-size:7px; font-weight:bold;">1</span> Temperature</div>
              <div style="border:1px solid #757575; border-radius:2px; padding:0.5px 5px; min-width:55px; text-align:center; font-weight:700; background:#fff;">98.4 °F</div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
              <div style="font-weight:600; color:#333; display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; background:#0d47a1; color:#fff; border-radius:50%; text-align:center; line-height:12px; font-size:7px; font-weight:bold;">2</span> Pulse</div>
              <div style="border:1px solid #757575; border-radius:2px; padding:0.5px 5px; min-width:55px; text-align:center; font-weight:700; background:#fff;">78 /min</div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
              <div style="font-weight:600; color:#333; display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; background:#0d47a1; color:#fff; border-radius:50%; text-align:center; line-height:12px; font-size:7px; font-weight:bold;">3</span> Respiration</div>
              <div style="border:1px solid #757575; border-radius:2px; padding:0.5px 5px; min-width:55px; text-align:center; font-weight:700; background:#fff;">18 /min</div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
              <div style="font-weight:600; color:#333; display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; background:#0d47a1; color:#fff; border-radius:50%; text-align:center; line-height:12px; font-size:7px; font-weight:bold;">4</span> Blood Pressure</div>
              <div style="border:1px solid #757575; border-radius:2px; padding:0.5px 5px; min-width:55px; text-align:center; font-weight:700; background:#fff;">110/70 mmHg</div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; padding:0.8px 0;">
              <div style="font-weight:600; color:#333; display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; background:#0d47a1; color:#fff; border-radius:50%; text-align:center; line-height:12px; font-size:7px; font-weight:bold;">5</span> Last Deworming</div>
              <div style="border:1px solid #757575; border-radius:2px; padding:0.5px 4px; min-width:75px; text-align:center; font-weight:600; background:#fff;">15/02/2026</div>
            </div>
          </div>

          <!-- Dental & ENT Subgrid -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:4px;">
            <!-- Dental -->
            <div style="border:1px solid #80deea; border-radius:4px; padding:3px 4px; background:#fafafa;">
              <div style="display:flex; align-items:center; font-size:8.5px; font-weight:900; color:#00838f; text-transform:uppercase; gap:3px; margin-bottom:2px;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#00838f"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2zm0-10h2v8h-2z"/></svg>
                Dental / Oral
              </div>
              <div style="font-size:7.5px;">
                <div style="margin-bottom:1.5px;"><b>1 Dental:</b> ${cb(true)} 1 ${cb(false)} Fair ${cb(false)} Poor</div>
                <div style="margin-bottom:1.5px;"><b>2 Caries:</b> ${cb(false)} Yes ${cb(true)} No</div>
                <div style="margin-bottom:1.5px;"><b>3 Gum:</b> Healthy</div>
                <div><b>4 Other:</b> None</div>
              </div>
            </div>

            <!-- ENT -->
            <div style="border:1px solid #ce93d8; border-radius:4px; padding:3px 4px; background:#fafafa;">
              <div style="display:flex; align-items:center; font-size:8.5px; font-weight:900; color:#6a1b9a; text-transform:uppercase; gap:3px; margin-bottom:2px;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#6a1b9a"><path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/></svg>
                E.N.T. Exam
              </div>
              <div style="font-size:7.5px;">
                <div><span style="font-weight:700; color:#6a1b9a;">1 Nose:</span> Normal</div>
                <div><span style="font-weight:700; color:#6a1b9a;">2 Throat:</span> Clear</div>
                <div><span style="font-weight:700; color:#6a1b9a;">3 Ear (R):</span> Normal</div>
                <div><span style="font-weight:700; color:#6a1b9a;">4 Ear (L):</span> Normal</div>
                <div><span style="font-weight:700; color:#6a1b9a;">5 Hearing:</span> Normal</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- 3. Eye Examination & Vision Screening -->
      <div style="display:grid; grid-template-columns: 2.7fr 1.3fr; gap:5px; margin-bottom:4px;">
        <div style="border:1px solid #90caf9; border-radius:4px; padding:3px 5px; background:#fff;">
          <div style="display:flex; align-items:center; font-size:8.8px; font-weight:900; color:#0d47a1; text-transform:uppercase; gap:4px; margin-bottom:2px;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#0d47a1"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
            Eye Examination
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:7.5px; text-align:center;">
            <thead>
              <tr style="background:#e3f2fd; color:#0d47a1; font-weight:800;">
                <th style="border:1px solid #64b5f6; padding:1.5px 2px;">EYE</th>
                <th style="border:1px solid #64b5f6; padding:1.5px 2px;">SPH</th>
                <th style="border:1px solid #64b5f6; padding:1.5px 2px;">CYL</th>
                <th style="border:1px solid #64b5f6; padding:1.5px 2px;">AXIS</th>
                <th style="border:1px solid #64b5f6; padding:1.5px 2px;">VISION</th>
                <th style="border:1px solid #64b5f6; padding:1.5px 2px;">ADD</th>
                <th style="border:1px solid #64b5f6; padding:1.5px 2px;">COLOR VISION</th>
                <th style="border:1px solid #64b5f6; padding:1.5px 2px;">REMARKS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border:1px solid #64b5f6; padding:1.5px 2px; font-weight:700; background:#f5f5f5;">Right Eye (OD)</td>
                <td style="border:1px solid #64b5f6;">Plano</td><td style="border:1px solid #64b5f6;">0.00</td><td style="border:1px solid #64b5f6;">0°</td><td style="border:1px solid #64b5f6; font-weight:700; color:#0d47a1;">6/6</td><td style="border:1px solid #64b5f6;">-</td><td style="border:1px solid #64b5f6;">Normal</td><td style="border:1px solid #64b5f6;">Normal</td>
              </tr>
              <tr>
                <td style="border:1px solid #64b5f6; padding:1.5px 2px; font-weight:700; background:#f5f5f5;">Left Eye (OS)</td>
                <td style="border:1px solid #64b5f6;">Plano</td><td style="border:1px solid #64b5f6;">0.00</td><td style="border:1px solid #64b5f6;">0°</td><td style="border:1px solid #64b5f6; font-weight:700; color:#0d47a1;">6/6</td><td style="border:1px solid #64b5f6;">-</td><td style="border:1px solid #64b5f6;">Normal</td><td style="border:1px solid #64b5f6;">Normal</td>
              </tr>
              <tr>
                <td style="border:1px solid #64b5f6; padding:1.5px 2px; font-weight:700; background:#f5f5f5;">Near Vision</td>
                <td style="border:1px solid #64b5f6;">-</td><td style="border:1px solid #64b5f6;">-</td><td style="border:1px solid #64b5f6;">-</td><td style="border:1px solid #64b5f6; font-weight:700; color:#0d47a1;">N6</td><td style="border:1px solid #64b5f6;">-</td><td style="border:1px solid #64b5f6;">Normal</td><td style="border:1px solid #64b5f6;">Clear</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Vision Screening Box with Snellen Chart -->
        <div style="border:1px solid #90caf9; border-radius:4px; padding:3px 5px; background:#fff; display:flex; flex-direction:column; justify-content:space-between;">
          <div style="display:flex; align-items:center; font-size:8.8px; font-weight:900; color:#0d47a1; text-transform:uppercase; gap:4px;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#0d47a1"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>
            Vision Screening
          </div>
          <div style="display:flex; align-items:center; justify-content:space-around; font-size:7.5px; padding-top:2px;">
            <!-- Snellen Diagram -->
            <div style="border:1px solid #0d47a1; border-radius:2px; padding:2px 4px; text-align:center; font-family:monospace; line-height:1; font-weight:900; background:#f8fafc; color:#0d47a1;">
              <div style="font-size:9px;">E</div>
              <div style="font-size:6.5px; letter-spacing:1px;">F P</div>
              <div style="font-size:5px; letter-spacing:1px;">T O Z</div>
            </div>
            <div>
              <div style="margin-bottom:2px;">${cb(true)} Normal</div>
              <div style="margin-bottom:2px;">${cb(false)} Refractive Error</div>
              <div>${cb(false)} Needs Further Eval</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Hearing, Vaccination, Health & Lifestyle -->
      <div style="display:grid; grid-template-columns: 1.05fr 1fr 1.05fr; gap:4px; margin-bottom:4px;">
        <!-- Hearing -->
        <div style="border:1px solid #ffe082; border-radius:4px; padding:3px 4px; background:#fff;">
          <div style="display:flex; align-items:center; font-size:8.5px; font-weight:900; color:#e65100; text-transform:uppercase; gap:3px; margin-bottom:2px;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#e65100"><path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/></svg>
            Hearing Screening
          </div>
          <div style="font-size:7.5px;">
            <div style="margin-bottom:2px;"><b>Right Ear:</b> ${cb(true)} Nor ${cb(false)} Red ${cb(false)} Ref</div>
            <div><b>Left Ear:</b> ${cb(true)} Nor ${cb(false)} Red ${cb(false)} Ref</div>
          </div>
        </div>

        <!-- Vaccination -->
        <div style="border:1px solid #ce93d8; border-radius:4px; padding:3px 4px; background:#fff;">
          <div style="display:flex; align-items:center; font-size:8.5px; font-weight:900; color:#6a1b9a; text-transform:uppercase; gap:3px; margin-bottom:2px;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#6a1b9a"><path d="M19.07 4.93l-1.41-1.41C17.27 3.13 16.76 3 16.24 3c-.51 0-1.02.2-1.41.59L3.59 14.83c-.78.78-.78 2.05 0 2.83l1.41 1.41c.39.39.9.59 1.41.59.51 0 1.02-.2 1.41-.59L19.07 7.76c.78-.78.78-2.05 0-2.83z"/></svg>
            Vaccination Status
          </div>
          <div style="font-size:7.5px;">
            <div style="margin-bottom:1.5px;">${cb(true)} Up to Date</div>
            <div style="margin-bottom:1.5px;">${cb(false)} Partially Completed</div>
            <div>${cb(false)} Not Up to Date</div>
          </div>
        </div>

        <!-- Lifestyle -->
        <div style="border:1px solid #a5d6a7; border-radius:4px; padding:3px 4px; background:#fff;">
          <div style="display:flex; align-items:center; font-size:8.5px; font-weight:900; color:#2e7d32; text-transform:uppercase; gap:3px; margin-bottom:2px;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#2e7d32"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            Health & Lifestyle
          </div>
          <div style="font-size:7.5px;">
            <div style="margin-bottom:1.5px;"><b>Diet Pattern:</b> ${cb(true)} Good ${cb(false)} Avg ${cb(false)} Poor</div>
            <div style="margin-bottom:1.5px;"><b>Physical Activity:</b> ${cb(true)} Active ${cb(false)} Sedentary</div>
            <div><b>Sleep Pattern:</b> ${cb(true)} Good ${cb(false)} Avg ${cb(false)} Poor</div>
          </div>
        </div>
      </div>

      <!-- 5. Dietitian Recommendation / Nutrition Advice -->
      <div style="border:1px solid #ffcc80; border-radius:4px; padding:3px 5px; background:#fff; margin-bottom:4px;">
        <div style="display:flex; align-items:center; font-size:8.8px; font-weight:900; color:#e65100; text-transform:uppercase; gap:4px; margin-bottom:2px;">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#e65100"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          Dietitian Recommendation / Nutrition Advice
        </div>
        <div style="display:grid; grid-template-columns: 1.05fr 1.35fr; gap:6px; font-size:7.8px;">
          <div style="display:flex; flex-direction:column; gap:1.5px;">
            <div>${cb(isHighProtein)} High Protein Diet Recommended</div>
            <div>${cb(isIronRich)} Iron Rich Diet Recommended</div>
            <div>${cb(isCalciumRich)} Calcium Rich Diet Recommended</div>
            <div>${cb(isWeightGain)} Weight Gain Diet Plan</div>
            <div>${cb(isWeightMgmt)} Weight Management Diet Plan</div>
            <div>${cb(isBalancedOther)} Others (Specify): Balanced Nutrition</div>
          </div>
          <div style="border-left:1px solid #ffcc80; padding-left:6px; font-size:7.6px; line-height:1.25;">
            <div style="font-weight:800; color:#e65100; margin-bottom:1px;">Dietitian's Advice (Based on Test Results):</div>
            <div style="border-bottom:1px dotted #bdbdbd; min-height:11px;"><b>WHO Growth Z-Scores:</b> HAZ: ${zscores.height_for_age_z || '+0.15'}, WAZ: ${zscores.weight_for_age_z || '-0.28'}, BAZ: ${zscores.bmi_for_age_z || '-0.42'}</div>
            <div style="border-bottom:1px dotted #bdbdbd; min-height:11px;">${dietAdvice1}</div>
            <div style="border-bottom:1px dotted #bdbdbd; min-height:11px;">${dietAdvice2}</div>
          </div>
        </div>
      </div>

      <!-- 6. Pathology & Other Recommendations -->
      <div style="display:grid; grid-template-columns: 1fr 1.4fr; gap:5px; margin-bottom:4px;">
        <!-- Pathology -->
        <div style="border:1px solid #80deea; border-radius:4px; padding:3px 5px; background:#fff;">
          <div style="display:flex; align-items:center; font-size:8.8px; font-weight:900; color:#00838f; text-transform:uppercase; gap:4px; margin-bottom:2px;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#00838f"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
            Pathology Test Report
          </div>
          <div style="font-size:7.8px;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:1px 0;"><span><b>Blood Group:</b></span> <span style="border:1px solid #757575; border-radius:2px; padding:0.5px 5px; font-weight:700;">B+</span></div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding:1px 0;"><span><b>Hemoglobin (Hb):</b></span> <span style="border:1px solid #757575; border-radius:2px; padding:0.5px 5px; font-weight:700;">12.5 g/dL</span></div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding:1px 0;"><span><b>Cholesterol:</b></span> <span style="border:1px solid #757575; border-radius:2px; padding:0.5px 5px; font-weight:700;">140 mg/dL</span></div>
          </div>
        </div>

        <!-- Recommendations / Referral -->
        <div style="border:1px solid #ffcc80; border-radius:4px; padding:3px 5px; background:#fff;">
          <div style="display:flex; align-items:center; font-size:8.8px; font-weight:900; color:#e65100; text-transform:uppercase; gap:4px; margin-bottom:2px;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#e65100"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
            Other Recommendations / Referral
          </div>
          <div style="font-size:7.8px;">
            <div style="border-bottom:1px dotted #bdbdbd; min-height:12px;">${vitals.doctor_remarks || 'Healthy growth parameters. No active specialist referral required.'}</div>
            <div style="border-bottom:1px dotted #bdbdbd; min-height:12px;">Schedule next routine pediatric check-up in 6 months during annual health camp.</div>
          </div>
        </div>
      </div>

      <!-- 7. Overall Health Status, Signatures & Live QR Code -->
      <div style="display:grid; grid-template-columns: 1.15fr 1.25fr; gap:5px; margin-bottom:3px;">
        <!-- Overall Status -->
        <div style="border:1px solid #90caf9; border-radius:4px; padding:3px 5px; background:#fff;">
          <div style="display:flex; align-items:center; font-size:8.8px; font-weight:900; color:#0d47a1; text-transform:uppercase; gap:4px; margin-bottom:2px;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#0d47a1"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            Overall Health Status
          </div>
          <div style="font-size:7.8px;">
            <div style="margin-bottom:1.5px;">${cb(true)} Normal / Healthy</div>
            <div style="margin-bottom:1.5px;">${cb(false)} Minor Issues (Advice Given)</div>
            <div style="margin-bottom:1.5px;">${cb(false)} Needs Medical Follow-up</div>
            <div style="margin-bottom:1.5px;">${cb(false)} Refer to Specialist</div>
            <div style="font-size:7.2px; color:#555; margin-top:2px;"><b>Date of Examination:</b> ${recordedDate}</div>
          </div>
        </div>

        <!-- Remark / Opinion -->
        <div style="border:1px solid #90caf9; border-radius:4px; padding:3px 5px; background:#fff;">
          <div style="font-size:8.8px; font-weight:900; color:#0d47a1; text-transform:uppercase; margin-bottom:2px;">Remark / Opinion</div>
          <div style="font-size:7.8px;">
            <div style="border-bottom:1px dotted #bdbdbd; min-height:12px;">Overall physical growth and developmental milestones align with WHO standard curves.</div>
            <div style="border-bottom:1px dotted #bdbdbd; min-height:12px;">Adhere to the recommended dietary modifications and hydration guidelines.</div>
            <div style="border-bottom:1px dotted #bdbdbd; min-height:12px;">Consult camp pediatrician if any acute symptoms develop.</div>
          </div>
        </div>
      </div>

      <!-- Signatures & Live QR Code Box -->
      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 52px; gap:4px; align-items:center; text-align:center; margin-bottom:3px;">
        <div style="border:1px solid #9e9e9e; border-radius:3px; height:26px; display:flex; flex-direction:column; justify-content:flex-end; padding:2px; font-size:7px; font-weight:700; color:#616161; background:#fff;">
          Doctor's Signature
        </div>
        <div style="border:1px solid #9e9e9e; border-radius:3px; height:26px; display:flex; flex-direction:column; justify-content:space-between; padding:2px; font-size:7px; font-weight:700; color:#616161; background:#fff;">
          <span style="color:#0d47a1; font-weight:800; font-size:7.2px;">Dr. A. Sharma, MBBS, DCH</span>
          <span>Doctor's Name</span>
        </div>
        <div style="border:1px solid #9e9e9e; border-radius:3px; height:26px; display:flex; flex-direction:column; justify-content:space-between; padding:2px; font-size:7px; font-weight:700; color:#616161; background:#fff;">
          <span style="color:#2e7d32; font-weight:800; font-size:7.2px;">SHWF Medical Board Seal</span>
          <span>Clinic / Center Seal</span>
        </div>
        
        <!-- QR Code -->
        <div style="border:1px solid #0d47a1; border-radius:3px; height:42px; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:5.5px; font-weight:800; color:#0d47a1; background:#fff; padding:1px;">
          ${qrUri ? `
            <img src="${qrUri}" style="width:28px; height:28px; display:block;" />
          ` : `
            <svg viewBox="0 0 100 100" style="width:26px; height:26px;">
              <rect x="10" y="10" width="30" height="30" fill="none" stroke="#0d47a1" stroke-width="6"/>
              <rect x="20" y="20" width="10" height="10" fill="#0d47a1"/>
              <rect x="60" y="10" width="30" height="30" fill="none" stroke="#0d47a1" stroke-width="6"/>
              <rect x="70" y="20" width="10" height="10" fill="#0d47a1"/>
              <rect x="10" y="60" width="30" height="30" fill="none" stroke="#0d47a1" stroke-width="6"/>
              <rect x="20" y="70" width="10" height="10" fill="#0d47a1"/>
              <rect x="55" y="55" width="12" height="12" fill="#0d47a1"/>
              <rect x="75" y="75" width="15" height="15" fill="#0d47a1"/>
              <rect x="55" y="75" width="10" height="15" fill="#0d47a1"/>
            </svg>
          `}
          <span style="margin-top:1px;">Scan for Report</span>
        </div>
      </div>

      <!-- Footer Bar -->
      <div style="background:#0d47a1; color:#ffffff; display:flex; justify-content:space-around; align-items:center; padding:3px 6px; border-radius:3px; font-size:8px; font-weight:700;">
        <div>🌐 www.smarthealthyindia.com</div>
        <div>✉ smarthealthyindia@gmail.com</div>
        <div>📞 9424761140, 9713673141</div>
      </div>
      <div style="text-align:center; font-size:8.5px; font-weight:900; color:#2e7d32; margin-top:2px; letter-spacing:0.5px;">
        🌱 Healthy Students, Strong Nation 🌱
      </div>

    </div>
  `;

  document.body.appendChild(container);

  try {
    // Render the container to high-res canvas (scale 2.5 for crisp 300 DPI vector clarity)
    const canvas = await html2canvas(container, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
    });

    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    // Standard A4 dimensions
    const pdfWidth = 210;
    const pdfHeight = 297;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    const filename = `SHWF_Health_Report_${student.student_id}_${lang}.pdf`;
    pdf.save(filename);

    return { success: true, source: 'client', filename };
  } catch (err) {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
    console.error('HTML2Canvas PDF generation failed:', err);
    throw err;
  }
}

export default {
  generateStudentPdf,
};
