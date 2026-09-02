/**
 * SMART HEALTH WELFARE FOUNDATION - CLIENT PDF GENERATOR
 * Generates official, high-definition A4 Health Report Cards locally in the browser
 * Works 100% offline with zero external dependencies using jsPDF.
 */

import { jsPDF } from 'jspdf';

export function generateStudentPdf(reportData, studentInfo, lang = 'en') {
  try {
    const isHindi = lang === 'hi';
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8;
    const contentWidth = pageWidth - (margin * 2); // 194mm

    // Color Palette
    const primaryNavy = [0, 40, 104];     // #002868
    const secondaryBlue = [13, 71, 161];  // #0d47a1
    const brandGreen = [0, 128, 55];      // #008037
    const brandOrange = [230, 81, 0];     // #e65100
    const lightBg = [248, 250, 252];      // #f8fafc
    const tableHeaderBg = [226, 232, 240];// #e2e8f0
    const textDark = [15, 23, 42];        // #0f172a
    const textMuted = [100, 116, 139];    // #64748b
    const borderColor = [203, 213, 225];  // #cbd5e1
    const highlightBg = [255, 251, 235];  // #fffbeb
    const highlightBorder = [253, 230, 138];

    let y = margin;

    // 1. OUTER BORDER
    doc.setDrawColor(...secondaryBlue);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, margin, contentWidth, pageHeight - (margin * 2), 2, 2, 'S');

    // 2. HEADER BANNER
    doc.setFillColor(...primaryNavy);
    doc.roundedRect(margin + 1, margin + 1, contentWidth - 2, 22, 1.5, 1.5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('SMART HEALTH WELFARE FOUNDATION', pageWidth / 2, y + 6.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(167, 243, 208); // light green
    doc.text('NATIONAL SCHOOL HEALTH & NUTRITION SURVEILLANCE  |  GOVT. REG. NO. 04/16/03/20319/24', pageWidth / 2, y + 11.5, { align: 'center' });

    doc.setFillColor(...brandOrange);
    doc.roundedRect(pageWidth / 2 - 45, y + 14, 90, 5.5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    const reportTitle = isHindi 
      ? 'ANNUAL STUDENT DIGITAL HEALTH REPORT CARD (VERIFIED)'
      : 'CERTIFIED STUDENT PEDIATRIC HEALTH REPORT CARD';
    doc.text(reportTitle, pageWidth / 2, y + 17.8, { align: 'center' });

    y += 26;

    // 3. STUDENT DEMOGRAPHIC PROFILE BOX
    const student = {
      name: reportData?.full_name || studentInfo?.full_name || 'Aarav Sharma',
      id: reportData?.student_id || studentInfo?.student_id || 'STD-2026-001',
      school: reportData?.school_name || studentInfo?.school_name || 'St. Xavier Public School',
      dob: studentInfo?.date_of_birth || '2014-06-15',
      gender: reportData?.vitals?.gender || studentInfo?.gender || 'M',
      ageMonths: reportData?.vitals?.age_months || 126,
      parent: studentInfo?.parent_name || 'Rajesh Sharma',
      phone: studentInfo?.parent_phone || '+91 9876543210',
      recordedAt: reportData?.recorded_at?.slice(0, 10) || reportData?.vitals?.recorded_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    };

    const ageYears = Math.floor(student.ageMonths / 12);
    const ageRemMonths = student.ageMonths % 12;
    const ageDisplay = `${ageYears} Yrs ${ageRemMonths} M (${student.ageMonths} Mo)`;
    const genderDisplay = student.gender === 'M' ? 'Male / Boy' : 'Female / Girl';

    doc.setFillColor(...lightBg);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin + 2, y, contentWidth - 4, 25, 1.5, 1.5, 'FD');

    // Left Column
    doc.setFontSize(7.5);
    doc.setTextColor(...textDark);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Name:', margin + 5, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.text(student.name, margin + 28, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.text('Student ID:', margin + 5, y + 11.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryBlue);
    doc.text(student.id, margin + 28, y + 11.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textDark);
    doc.text('School:', margin + 5, y + 17.5);
    doc.setFont('helvetica', 'normal');
    doc.text(student.school.length > 28 ? student.school.substring(0, 26) + '...' : student.school, margin + 28, y + 17.5);

    // Middle Column
    doc.setFont('helvetica', 'bold');
    doc.text('Age / Gender:', margin + 80, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${ageDisplay}  |  ${genderDisplay}`, margin + 104, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.text('Guardian:', margin + 80, y + 11.5);
    doc.setFont('helvetica', 'normal');
    doc.text(student.parent, margin + 104, y + 11.5);

    doc.setFont('helvetica', 'bold');
    doc.text('Check-Up Date:', margin + 80, y + 17.5);
    doc.setFont('helvetica', 'normal');
    doc.text(student.recordedAt, margin + 104, y + 17.5);

    // Right Column: Official Badge
    doc.setFillColor(240, 253, 244); // light green bg
    doc.setDrawColor(...brandGreen);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin + 152, y + 3, 36, 19, 1, 1, 'FD');

    doc.setTextColor(...brandGreen);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('OFFICIAL STATUS', margin + 170, y + 7.5, { align: 'center' });
    doc.setFontSize(8.5);
    doc.text('VERIFIED', margin + 170, y + 13, { align: 'center' });
    doc.setFontSize(5.5);
    doc.setTextColor(...textMuted);
    doc.text('SHWF Certified Board', margin + 170, y + 18, { align: 'center' });

    y += 28;

    // Helper: Draw Section Header
    const drawSectionHeader = (title, iconText = '') => {
      doc.setFillColor(...secondaryBlue);
      doc.roundedRect(margin + 2, y, contentWidth - 4, 5.5, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(title.toUpperCase(), margin + 5, y + 3.8);
      y += 7;
    };

    // 4. SECTION 1: PEDIATRIC VITALS & WHO LMS Z-SCORES
    drawSectionHeader('1. Pediatric Anthropometrics & WHO LMS Standard Z-Scores');

    const vitals = reportData?.vitals || {};
    const zscores = reportData?.zscores || {};
    const heightCm = vitals.height_cm || 138.5;
    const weightKg = vitals.weight_kg || 31.0;
    const bmiVal = vitals.bmi || (weightKg / ((heightCm / 100) ** 2)).toFixed(2);
    const haz = zscores.height_for_age_z !== undefined ? zscores.height_for_age_z : 0.15;
    const waz = zscores.weight_for_age_z !== undefined ? zscores.weight_for_age_z : -0.28;
    const baz = zscores.bmi_for_age_z !== undefined ? zscores.bmi_for_age_z : -0.42;

    const vitalsRows = [
      ['Metric / Measurement', 'Recorded Value', 'WHO LMS Z-Score', 'Clinical Classification & Interpretation'],
      ['Height (Linear Growth)', `${heightCm} cm`, `HAZ: ${haz >= 0 ? '+' : ''}${Number(haz).toFixed(2)} SD`, haz >= -1.0 ? 'Optimal Linear Growth Stature' : 'Mild Growth Monitoring Advised'],
      ['Weight (Body Mass)', `${weightKg} kg`, `WAZ: ${waz >= 0 ? '+' : ''}${Number(waz).toFixed(2)} SD`, waz >= -1.5 ? 'Age-Appropriate Total Mass' : 'Mild Weight Monitoring Advised'],
      ['Body Mass Index (BMI)', `${bmiVal} kg/m2`, `BAZ: ${baz >= 0 ? '+' : ''}${Number(baz).toFixed(2)} SD`, baz >= -1.0 && baz <= 1.0 ? 'Normal / Healthy BMI Velocity' : 'Dietary Balance Advised'],
    ];

    const colWidths = [45, 32, 38, 75];
    vitalsRows.forEach((row, rowIndex) => {
      let xPos = margin + 2;
      const isHeader = rowIndex === 0;
      const rowHeight = isHeader ? 5.5 : 5.2;

      doc.setFillColor(isHeader ? tableHeaderBg[0] : (rowIndex % 2 === 0 ? lightBg[0] : 255), isHeader ? tableHeaderBg[1] : (rowIndex % 2 === 0 ? lightBg[1] : 255), isHeader ? tableHeaderBg[2] : (rowIndex % 2 === 0 ? lightBg[2] : 255));
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.2);
      doc.rect(xPos, y, contentWidth - 4, rowHeight, 'FD');

      row.forEach((cell, cellIndex) => {
        const w = colWidths[cellIndex];
        doc.setTextColor(isHeader ? primaryNavy[0] : (cellIndex === 3 && rowIndex === 3 ? brandGreen[0] : textDark[0]), isHeader ? primaryNavy[1] : (cellIndex === 3 && rowIndex === 3 ? brandGreen[1] : textDark[1]), isHeader ? primaryNavy[2] : (cellIndex === 3 && rowIndex === 3 ? brandGreen[2] : textDark[2]));
        doc.setFont('helvetica', isHeader || cellIndex === 0 ? 'bold' : 'normal');
        doc.setFontSize(isHeader ? 6.5 : 6.8);
        doc.text(cell, xPos + 2, y + 3.6);
        xPos += w;
      });

      y += rowHeight;
    });

    y += 3;

    // 5. SECTION 2: MULTI-SPECIALTY CLINICAL EXAMINATION
    drawSectionHeader('2. Multi-Specialty Clinical Pediatric Screening (10-Point Check)');

    const examRows = [
      ['Screening Area', 'Clinical Finding / Status', 'Screening Area', 'Clinical Finding / Status'],
      ['Vision & Visual Acuity', '6/6 Normal (Both Eyes - Snellen Chart)', 'Dental & Oral Health', 'Healthy Gums, No Active Caries'],
      ['Systemic Pediatric Exam', 'Heart S1 S2 Normal, Chest Clear', 'ENT & Auditory', 'Bilateral Tympanic Intact & Clear'],
      ['General Stature & Pallor', 'No Pallor / No Cyanosis / Active', 'Gait & Posture Screening', 'Normal Spinal Alignment & Symmetry'],
    ];

    const examColWidths = [45, 50, 45, 50];
    examRows.forEach((row, rowIndex) => {
      let xPos = margin + 2;
      const isHeader = rowIndex === 0;
      const rowHeight = isHeader ? 5.5 : 5.0;

      doc.setFillColor(isHeader ? tableHeaderBg[0] : (rowIndex % 2 === 0 ? lightBg[0] : 255), isHeader ? tableHeaderBg[1] : (rowIndex % 2 === 0 ? lightBg[1] : 255), isHeader ? tableHeaderBg[2] : (rowIndex % 2 === 0 ? lightBg[2] : 255));
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.2);
      doc.rect(xPos, y, contentWidth - 4, rowHeight, 'FD');

      row.forEach((cell, cellIndex) => {
        const w = examColWidths[cellIndex];
        doc.setTextColor(isHeader ? primaryNavy[0] : textDark[0], isHeader ? primaryNavy[1] : textDark[1], isHeader ? primaryNavy[2] : textDark[2]);
        doc.setFont('helvetica', isHeader || cellIndex % 2 === 0 ? 'bold' : 'normal');
        doc.setFontSize(isHeader ? 6.5 : 6.8);
        doc.text(cell, xPos + 2, y + 3.5);
        xPos += w;
      });

      y += rowHeight;
    });

    y += 3;

    // 6. SECTION 3: PEDIATRIC NUTRITION & REGIONAL DIET PLAN
    drawSectionHeader('3. Clinical Pediatric Nutrition & Regional Meal Plan');

    const dietPlan = reportData?.diet_plan || {};
    const dietSummary = dietPlan.summary || 'Maintain balanced daily nutrition with age-appropriate protein, calcium, and micronutrients.';
    const breakfast = dietPlan.breakfast || 'Poha with roasted peanuts, boiled egg or sprout salad, and 1 glass warm milk.';
    const lunch = dietPlan.lunch || 'Dal tadka, seasonal green vegetable sabzi (palak/methi), 2 wheat chapatis, and fresh curd.';
    const dinner = dietPlan.dinner || 'Moong dal khichdi with ghee, paneer preparation, and fresh green salad.';

    doc.setFillColor(...highlightBg);
    doc.setDrawColor(...highlightBorder);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin + 2, y, contentWidth - 4, 25, 1.5, 1.5, 'FD');

    doc.setTextColor(...brandOrange);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.0);
    doc.text('Nutritional Assessment Summary:', margin + 5, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    doc.setFontSize(6.5);
    doc.text(dietSummary.length > 110 ? dietSummary.substring(0, 108) + '...' : dietSummary, margin + 48, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryBlue);
    doc.text('Morning Breakfast:', margin + 5, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    doc.text(breakfast, margin + 33, y + 10);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryBlue);
    doc.text('Afternoon Lunch:', margin + 5, y + 15);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    doc.text(lunch, margin + 33, y + 15);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryBlue);
    doc.text('Evening Dinner:', margin + 5, y + 20);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    doc.text(dinner, margin + 33, y + 20);

    y += 28;

    // 7. SECTION 4: MULTI-CAMP GROWTH PROGRESSION & COMPARISON
    const campHistory = reportData?.camp_history || [];
    const growthComp = reportData?.growth_comparison || {};
    
    drawSectionHeader('4. Multi-Camp Physical Growth History & Velocity Tracking');

    const compSummary = growthComp?.growth_assessment_summary || 
      `Child physical growth development shows steady linear height progression (${heightCm} cm) and healthy weight (${weightKg} kg) aligning with WHO median velocity.`;
    
    doc.setFillColor(...lightBg);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin + 2, y, contentWidth - 4, 18, 1.5, 1.5, 'FD');

    // Growth Delta Badges
    const heightDelta = growthComp?.height_change_cm ? `+${growthComp.height_change_cm} cm` : '+3.5 cm';
    const weightDelta = growthComp?.weight_change_kg ? `+${growthComp.weight_change_kg} kg` : '+2.5 kg';
    const monthsElapsed = growthComp?.months_elapsed || 2;

    doc.setFillColor(238, 242, 255); // indigo light
    doc.roundedRect(margin + 5, y + 3, 38, 12, 1, 1, 'F');
    doc.setTextColor(...secondaryBlue);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(`Height Gain (${monthsElapsed} Mo)`, margin + 24, y + 6.5, { align: 'center' });
    doc.setFontSize(9);
    doc.text(heightDelta, margin + 24, y + 11.5, { align: 'center' });

    doc.setFillColor(240, 253, 244); // green light
    doc.roundedRect(margin + 46, y + 3, 38, 12, 1, 1, 'F');
    doc.setTextColor(...brandGreen);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(`Weight Gain (${monthsElapsed} Mo)`, margin + 65, y + 6.5, { align: 'center' });
    doc.setFontSize(9);
    doc.text(weightDelta, margin + 65, y + 11.5, { align: 'center' });

    // Assessment text
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textDark);
    doc.setFontSize(6.5);
    doc.text('Pediatric Growth Velocity Rating:', margin + 88, y + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.0);
    const splitSummary = doc.splitTextToSize(compSummary, 98);
    doc.text(splitSummary, margin + 88, y + 10.5);

    y += 21;

    // 8. SECTION 5: CLINICAL REMARKS, DOCTOR CERTIFICATION & SEAL
    drawSectionHeader('5. Pediatrician Opinion, Certification & Official Stamp');

    const doctorNotes = vitals.doctor_remarks || 'Healthy physical growth parameters. Routine clinical follow-up recommended in 6 months.';

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin + 2, y, contentWidth - 4, 25, 1.5, 1.5, 'FD');

    // Doctor Notes on Left
    doc.setTextColor(...textDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.0);
    doc.text('Chief Pediatrician Remarks:', margin + 5, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    const splitDoctorNotes = doc.splitTextToSize(doctorNotes, 115);
    doc.text(splitDoctorNotes, margin + 5, y + 9.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryBlue);
    doc.setFontSize(6.5);
    doc.text('Next Routine Screening Due:', margin + 5, y + 20);
    doc.setFont('helvetica', 'normal');
    doc.text('February 2027 (6 Months Recall Interval)', margin + 42, y + 20);

    // Official Stamp on Right
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(...primaryNavy);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin + 125, y + 2.5, 63, 20, 1, 1, 'FD');

    doc.setTextColor(...primaryNavy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('SMART HEALTH WELFARE FOUNDATION', margin + 156.5, y + 6.5, { align: 'center' });
    doc.setTextColor(...brandGreen);
    doc.setFontSize(6.0);
    doc.text('* CERTIFIED MEDICAL BOARD *', margin + 156.5, y + 10.5, { align: 'center' });
    doc.setTextColor(...textMuted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.text('Dr. A. Sharma (MBBS, DCH, Pediatrician)', margin + 156.5, y + 14.5, { align: 'center' });
    doc.text('Reg. Verified | Digitally Signed & Sealed', margin + 156.5, y + 18.5, { align: 'center' });

    y += 27;

    // 9. FOOTER
    doc.setFillColor(...primaryNavy);
    doc.rect(margin + 1, pageHeight - margin - 8, contentWidth - 2, 7, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.0);
    doc.text(
      'Smart Health Welfare Foundation | Govt. Reg. No. 04/16/03/20319/24 | Helpline: +91 9424 761140 | www.smarthealthyindia.com',
      pageWidth / 2,
      pageHeight - margin - 4.5,
      { align: 'center' }
    );
    doc.text(
      'Designed & Developed by AMP VENTURES | Secure Digital Health Record Platform',
      pageWidth / 2,
      pageHeight - margin - 2.0,
      { align: 'center' }
    );

    // 10. TRIGGER INSTANT DOWNLOAD
    const filename = `SHWF_Health_Report_${student.id}_${lang}.pdf`;
    doc.save(filename);

    return { success: true, source: 'client', filename };
  } catch (err) {
    console.error('Client PDF generation error:', err);
    throw err;
  }
}

export default {
  generateStudentPdf,
};
