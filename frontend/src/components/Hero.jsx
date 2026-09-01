import React from 'react';
import { ShieldCheck, Award, Users, CheckCircle2, ArrowRight, HeartHandshake, QrCode } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home" className="relative bg-gradient-to-br from-shwf-navy-dark via-shwf-navy to-[#003882] text-white pt-16 pb-28 overflow-hidden">
      {/* Background Decorative Glow Orbs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-shwf-green/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-shwf-orange/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Mission Headline & CTAs */}
          <div className="lg:col-span-7">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#a7f3d0] mb-6">
              <span className="w-2 h-2 rounded-full bg-shwf-green animate-ping"></span>
              Transforming Lives, Nurturing Healthier Futures
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black leading-[1.15] text-white tracking-tight mb-6">
              Building a <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-shwf-orange">Healthier, Educated</span> & Compassionate Society
            </h1>

            {/* Lead Narrative */}
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed mb-8 max-w-2xl">
              Smart Health Welfare Foundation is committed to grassroots child nutrition, comprehensive school health screenings, WHO LMS growth assessments, and preventive pediatric interventions across India.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 items-center mb-10">
              <a
                href="#donate"
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-shwf-orange to-amber-500 hover:from-shwf-orange-dark hover:to-shwf-orange text-white font-bold text-base px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 pulse-button"
              >
                <HeartHandshake className="w-5 h-5" />
                <span>Donate & Support</span>
              </a>
              <a
                href="#portal"
                className="inline-flex items-center gap-2.5 bg-white/15 hover:bg-white text-white hover:text-shwf-navy border border-white/40 font-bold text-base px-7 py-3.5 rounded-full backdrop-blur-md transition-all"
              >
                <span>Student Health Portal</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Quick Guarantees */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-shwf-green" />
                <span>Govt. Registered NGO</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-shwf-green" />
                <span>Certified Medical Team</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-shwf-green" />
                <span>WHO LMS Anthro Analytics</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Feature Card */}
          <div className="lg:col-span-5">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-white/15 pb-5 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Our Core Mission</h3>
                  <p className="text-xs text-slate-300 mt-0.5">Empowering every child with wellness & education</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-shwf-orange/20 border border-shwf-orange/40 flex items-center justify-center text-shwf-orange">
                  <HeartHandshake className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-200">
                <div className="flex items-start gap-3 bg-white/5 p-3.5 rounded-xl border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-shwf-green flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">School Health Camps</strong>
                    On-ground pediatric screenings, vitals recording, and vision/dental evaluations.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 p-3.5 rounded-xl border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-shwf-green flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">WHO Growth Z-Score Diagnostics</strong>
                    Scientific identification of stunting, wasting, underweight, and BMI anomalies.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 p-3.5 rounded-xl border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-shwf-green flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Customized Indian Nutrition Plans</strong>
                    Prescribed regional diet strategies to eliminate child malnutrition.
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/15 flex items-center justify-between">
                <span className="text-xs text-slate-300">Quick Parent Access:</span>
                <a
                  href="#portal"
                  className="text-xs font-bold text-shwf-orange hover:text-amber-300 flex items-center gap-1 transition-colors"
                >
                  Search Student Record &rarr;
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Impact Ribbon (Floating Statistics Card) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-900">
          
          <div className="text-center md:border-r border-slate-200 md:last:border-r-0 px-2">
            <div className="text-3xl sm:text-4xl font-black text-shwf-navy mb-1">150+</div>
            <div className="text-xs sm:text-sm font-bold text-slate-600">Partner Schools</div>
          </div>

          <div className="text-center md:border-r border-slate-200 md:last:border-r-0 px-2">
            <div className="text-3xl sm:text-4xl font-black text-shwf-green mb-1">45,000+</div>
            <div className="text-xs sm:text-sm font-bold text-slate-600">Children Screened</div>
          </div>

          <div className="text-center md:border-r border-slate-200 md:last:border-r-0 px-2">
            <div className="text-3xl sm:text-4xl font-black text-shwf-orange mb-1">98.4%</div>
            <div className="text-xs sm:text-sm font-bold text-slate-600">Nutrition Interventions</div>
          </div>

          <div className="text-center px-2">
            <div className="text-3xl sm:text-4xl font-black text-shwf-navy mb-1">100%</div>
            <div className="text-xs sm:text-sm font-bold text-slate-600">NGO Transparency</div>
          </div>

        </div>
      </div>
    </section>
  );
}
