import React, { useState } from 'react';
import { Calculator, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export default function GrowthCalculator({ onToast }) {
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

    const heightM = h / 100.0;
    const bmi = (w / (heightM * heightM)).toFixed(1);
    const totalMonths = Math.round(yrs * 12 + mos);

    let category = 'Healthy / Normal Growth Parameter';
    let badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';

    if (bmi < 13.5) {
      category = 'Underweight / Mild Malnutrition Indicator';
      badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
    } else if (bmi > 22.5) {
      category = 'Elevated BMI / Overweight Indicator';
      badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
    }

    setResult({
      bmi,
      totalMonths,
      gender: gender === 'M' ? 'Boy' : 'Girl',
      category,
      badgeClass,
    });
  };

  return (
    <section id="calculator" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block bg-shwf-orange-subtle text-shwf-orange-dark font-extrabold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
            WHO Child Growth Sandbox
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-shwf-navy tracking-tight mb-3">
            Interactive Child Growth Calculator
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Enter your child's age, gender, height, and weight to preview preliminary BMI and growth parameters based on WHO standard curves.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-50 rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 max-w-3xl mx-auto">
          
          <form onSubmit={handleCalculate} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              {/* Age (Years & Months) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Age (Years & Months)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="1"
                    max="19"
                    value={ageYrs}
                    onChange={(e) => setAgeYrs(e.target.value)}
                    placeholder="Yrs"
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
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-shwf-navy"
                >
                  <option value="M">Male (Boy)</option>
                  <option value="F">Female (Girl)</option>
                </select>
              </div>

              {/* Height */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="e.g. 138.5"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-shwf-navy"
                />
              </div>

              {/* Weight */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Weight (kg)
                </label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="e.g. 31.2"
                    className="flex-grow bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-shwf-navy"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-shwf-navy hover:bg-shwf-navy-light text-white font-bold text-sm px-8 py-2.5 rounded-xl shadow-md transition-all flex-shrink-0"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Calculate BMI</span>
                  </button>
                </div>
              </div>

            </div>
          </form>

          {/* Results Block */}
          {result && (
            <div className="mt-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm animate-fadeIn">
              <h4 className="text-sm font-extrabold text-shwf-navy uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-shwf-orange" />
                <span>WHO Growth Calculation Estimate</span>
              </h4>

              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-extrabold text-slate-500 uppercase">BMI VALUE</div>
                  <div className="text-xl font-black text-shwf-navy">{result.bmi} <span className="text-xs font-normal">kg/m²</span></div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-extrabold text-slate-500 uppercase">TOTAL AGE</div>
                  <div className="text-xl font-black text-shwf-green">{result.totalMonths} <span className="text-xs font-normal">Months</span></div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-extrabold text-slate-500 uppercase">GENDER</div>
                  <div className="text-xl font-black text-shwf-orange">{result.gender}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Preliminary Assessment:</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${result.badgeClass}`}>
                  {result.category}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-4 border-t border-slate-100 pt-3">
                * Note: Full certified health report cards with certified pediatrician remarks and LMS z-scores are available in the Student Portal.
              </p>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
