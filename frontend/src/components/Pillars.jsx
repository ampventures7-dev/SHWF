import React from 'react';
import { HeartPulse, Utensils, Activity, Sparkles, Stethoscope, Award, Users2, Compass } from 'lucide-react';

export default function Pillars() {
  const pillars = [
    {
      icon: Stethoscope,
      color: 'navy',
      title: 'School Health Camps',
      desc: 'Annual on-campus clinical screenings by certified medical doctors, capturing vital signs, dental hygiene, vision acuity, and systemic pediatric wellness.',
      badge: 'Pediatric Care'
    },
    {
      icon: Activity,
      color: 'green',
      title: 'WHO Growth Analytics',
      desc: 'Scientific calculation of exact WHO LMS Z-scores (HAZ, WAZ, BAZ) to reliably flag malnutrition, stunting, wasting, and severe underweight risk in children.',
      badge: 'Scientific Precision'
    },
    {
      icon: Utensils,
      color: 'orange',
      title: 'Custom Nutrition Plans',
      desc: 'Personalized meal regimens utilizing affordable, high-nutrition regional Indian ingredients (sprouts, pulses, millets, dairy) to restore healthy growth.',
      badge: 'Zero Malnutrition'
    },
    {
      icon: Compass,
      color: 'gold',
      title: 'Rural Health Outreach',
      desc: 'Extending preventive healthcare and health literacy to remote rural schools and underprivileged student communities across India.',
      badge: 'Community Reach'
    }
  ];

  return (
    <section id="pillars" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-shwf-green-subtle text-shwf-green-dark font-extrabold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
            Pillars of Transformation
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-shwf-navy tracking-tight mb-4">
            Committed to Holistic Child Wellness & Health Literacy
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Our multi-pronged approach combines clinical expertise, algorithmic growth tracking, and grassroots nutritional interventions.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50 hover:bg-white rounded-3xl p-8 border border-slate-200 hover:border-shwf-navy/20 hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1.5"
              >
                <div>
                  {/* Icon Box */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${
                      p.color === 'navy'
                        ? 'bg-shwf-navy-subtle text-shwf-navy'
                        : p.color === 'green'
                        ? 'bg-shwf-green-subtle text-shwf-green'
                        : p.color === 'orange'
                        ? 'bg-shwf-orange-subtle text-shwf-orange'
                        : 'bg-shwf-gold-light text-shwf-gold'
                    }`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                    {p.badge}
                  </span>
                  
                  <h3 className="text-xl font-bold text-shwf-navy mb-3 group-hover:text-shwf-navy-light transition-colors">
                    {p.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-bold text-shwf-navy group-hover:text-shwf-orange transition-colors">
                  <span>Learn more about our methodology &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
