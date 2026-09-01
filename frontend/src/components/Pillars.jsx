import React, { useState } from 'react';
import {
  HeartPulse,
  Utensils,
  Activity,
  Sparkles,
  Stethoscope,
  Award,
  Users2,
  Compass,
  X,
  CheckCircle2,
  ChevronRight,
  Calculator,
  Search,
  Phone
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Pillars() {
  const { t, language } = useLanguage();
  const [activeModalPillar, setActiveModalPillar] = useState(null);

  const pillars = [
    {
      id: 1,
      icon: Stethoscope,
      color: 'navy',
      badge_en: 'Pediatric Care',
      badge_hi: 'बाल स्वास्थ्य देखभाल',
      title: t('pillars.p1Title', '1. Comprehensive Screenings'),
      desc: t('pillars.p1Desc', 'Annual on-campus clinical screenings by certified medical doctors, capturing vital signs, dental hygiene, vision acuity, and systemic pediatric wellness.'),
      methodology_title_en: 'Clinical Examination & Pediatric Protocol',
      methodology_title_hi: 'नैदानिक परीक्षण एवं बाल चिकित्सा प्रोटोकॉल',
      methodology_points_en: [
        'Standardized 6/6 Snellen & Tumbling E visual refraction testing to detect refractive errors early.',
        'Pediatric dental cavity probe, caries grading, oral hygiene review, and fluoride varnish guidance.',
        'Systemic physical vitals: accurate stadiometer height, digital weight, blood pressure, and ENT inspection.'
      ],
      methodology_points_hi: [
        'दृष्टि दोषों की समय पर पहचान के लिए 6/6 स्नेलेन चार्ट द्वारा नेत्र परीक्षण।',
        'दांतों की कैविटी जांच, मसूड़ों की स्वच्छता और फ्लोराइड द्वारा दंत सुरक्षा मार्गदर्शन।',
        'शारीरिक माप: स्टेडियोमीटर से सटीक लंबाई, वजन, रक्तचाप एवं कान-नाक-गले (ENT) की जांच।'
      ],
      cta_text_en: 'Book School Health Camp',
      cta_text_hi: 'विद्यालय स्वास्थ्य शिविर बुक करें',
      cta_type: 'call'
    },
    {
      id: 2,
      icon: Activity,
      color: 'green',
      badge_en: 'Scientific Precision',
      badge_hi: 'सटीक वैज्ञानिक विश्लेषण',
      title: t('pillars.p2Title', '2. WHO AI Growth Analytics'),
      desc: t('pillars.p2Desc', 'Scientific calculation of exact WHO LMS Z-scores (HAZ, WAZ, BAZ) to reliably flag malnutrition, stunting, wasting, and severe underweight risk in children.'),
      methodology_title_en: 'WHO LMS Growth Curve Algorithm',
      methodology_title_hi: 'WHO LMS विकास वक्र एवं Z-स्कोर प्रणाली',
      methodology_points_en: [
        'Box-Cox LMS power transformations calculating exact Height-for-Age (HAZ), Weight-for-Age (WAZ), and BMI-for-Age (BAZ).',
        'Automated stunting (-2 SD) & wasting detection to prevent irreversible developmental delays.',
        '6-month & 12-month milestone growth trajectory forecasting based on pediatric height velocity curves.'
      ],
      methodology_points_hi: [
        'WHO LMS मानकों के आधार पर उम्र के अनुसार लंबाई (HAZ), वजन (WAZ) एवं बीएमआई (BAZ) की सटीक गणना।',
        'बौनेपन (-2 SD) एवं गंभीर कुपोषण की समय पूर्व पहचान ताकि शारीरिक विकास बाधित न हो।',
        'बाल वृद्धि वक्र के आधार पर 6-माह एवं 12-माह की अनुमानित लंबाई व विकास माइलस्टोन ट्रैकिंग।'
      ],
      cta_text_en: 'Try WHO Growth Calculator',
      cta_text_hi: 'WHO वृद्धि कैलकुलेटर आजमाएं',
      cta_type: 'calculator'
    },
    {
      id: 3,
      icon: Utensils,
      color: 'orange',
      badge_en: 'Zero Malnutrition',
      badge_hi: 'कुपोषण मुक्त अभियान',
      title: t('pillars.p3Title', '3. Regional Nutrition & Diets'),
      desc: t('pillars.p3Desc', 'Personalized meal regimens utilizing affordable, high-nutrition regional Indian ingredients (sprouts, pulses, millets, dairy) to restore healthy growth.'),
      methodology_title_en: 'Regional Indigenous Nutritional Framework',
      methodology_title_hi: 'पारंपरिक भारतीय पौष्टिक आहार रूपरेखा',
      methodology_points_en: [
        'Evidence-based integration of high-protein Indian staples: Ragi, Bajra, Moong dal, Paneer, and Moringa leaves.',
        'Iron bioavailability optimization: pairing plant-based non-heme iron with Vitamin C (Amla/lemon) to cure juvenile anemia.',
        '100% whole-food approach tailored to regional culinary habits without costly synthetic supplements.'
      ],
      methodology_points_hi: [
        'उच्च प्रोटीन पारंपरिक भारतीय खाद्य पदार्थ: रागी, बाजरा, मूंग दाल, पनीर और सहजन का दैनिक भोजन में समावेश।',
        'आयरन अवशोषण में वृद्धि: एनीमिया दूर करने के लिए वनस्पति आयरन के साथ विटामिन-सी (आंवला/नींबू) का संयोजन।',
        'बिना महंगे सप्लीमेंट्स के, घर में आसानी से उपलब्ध पौष्टिक आहार द्वारा प्राकृतिक स्वास्थ्य सुधार।'
      ],
      cta_text_en: 'Consult Nutrition Team',
      cta_text_hi: 'पोषण विशेषज्ञों से परामर्श लें',
      cta_type: 'call'
    },
    {
      id: 4,
      icon: Compass,
      color: 'gold',
      badge_en: 'Community Reach',
      badge_hi: 'समुदाय एवं अभिभावक सशक्तिकरण',
      title: t('pillars.p4Title', '4. Direct Parent Empowerment'),
      desc: t('pillars.p4Desc', 'Zero-barrier digital access for parents via phone OTP and instant PDF report cards to make healthcare transparent and actionable.'),
      methodology_title_en: 'Zero-Knowledge Security & Digital Report Cards',
      methodology_title_hi: 'सुरक्षित डिजिटल स्वास्थ्य रिपोर्ट एवं ओटीपी प्रणाली',
      methodology_points_en: [
        'Secure guardian verification via 6-digit OTP dispatched directly to registered parent mobile numbers.',
        'Instant certified bilingual PDF medical report cards with scannable verification QR code.',
        '1-Click Voice Audio Explainer in Hindi and English ensuring health literacy for every parent.'
      ],
      methodology_points_hi: [
        'पंजीकृत अभिभावक के मोबाइल पर 6-अंकीय ओटीपी द्वारा पूर्णतः सुरक्षित और निजी स्वास्थ्य रिकॉर्ड पहुंच।',
        'डिजिटल क्यूआर कोड के साथ प्रमाणित द्विभाषी (हिंदी/अंग्रेजी) पीडीएफ स्वास्थ्य रिपोर्ट कार्ड।',
        '1-क्लिक ऑडियो रिपोर्ट व्याख्याता (हिंदी व अंग्रेजी आवाज) जो हर अभिभावक के लिए समझना आसान बनाती है।'
      ],
      cta_text_en: 'Open Student Health Portal',
      cta_text_hi: 'छात्र स्वास्थ्य पोर्टल खोलें',
      cta_type: 'portal'
    }
  ];

  const handleCtaClick = (type) => {
    setActiveModalPillar(null);
    if (type === 'calculator') {
      const el = document.getElementById('calculator');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (type === 'portal') {
      const el = document.getElementById('portal');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (type === 'call') {
      window.location.href = 'tel:+919424761140';
    }
  };

  return (
    <section id="pillars" className="py-20 bg-white relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-shwf-green-subtle text-shwf-green-dark font-extrabold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-3 shadow-sm">
            {t('pillars.badge', 'Core Healthcare Pillars')}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-shwf-navy tracking-tight mb-4">
            {t('pillars.title', 'Transforming Child Health in India')}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {t('pillars.subtitle', 'Our multi-dimensional approach ensures comprehensive diagnostic coverage, early medical intervention, and sustained nutritional wellness.')}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {pillars.map((p) => {
            const Icon = p.icon;
            const badge = language === 'hi' ? p.badge_hi : p.badge_en;
            return (
              <div
                key={p.id}
                onClick={() => setActiveModalPillar(p)}
                className="bg-slate-50 hover:bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 hover:border-shwf-navy/30 hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1.5 cursor-pointer"
              >
                <div>
                  {/* Icon Box */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-transform duration-300 group-hover:scale-110 ${
                      p.color === 'navy'
                        ? 'bg-shwf-navy-subtle text-shwf-navy'
                        : p.color === 'green'
                        ? 'bg-shwf-green-subtle text-shwf-green'
                        : p.color === 'orange'
                        ? 'bg-shwf-orange-subtle text-shwf-orange'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                    {badge}
                  </span>
                  
                  <h3 className="text-xl font-bold text-shwf-navy mb-3 group-hover:text-shwf-navy-light transition-colors">
                    {p.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-shwf-navy group-hover:text-shwf-orange transition-colors">
                  <span>{t('pillars.learnMore', 'Learn more about our methodology')} &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* Interactive Methodology Deep-Dive Modal */}
      {/* ========================================================================= */}
      {activeModalPillar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Close Button */}
            <button
              onClick={() => setActiveModalPillar(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors z-10 cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4 mb-6 pr-8">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                  activeModalPillar.color === 'navy'
                    ? 'bg-shwf-navy text-white'
                    : activeModalPillar.color === 'green'
                    ? 'bg-shwf-green text-white'
                    : activeModalPillar.color === 'orange'
                    ? 'bg-shwf-orange text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                {React.createElement(activeModalPillar.icon, { className: 'w-7 h-7' })}
              </div>

              <div>
                <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-shwf-orange mb-1">
                  {language === 'hi' ? activeModalPillar.badge_hi : activeModalPillar.badge_en}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {language === 'hi' ? activeModalPillar.methodology_title_hi : activeModalPillar.methodology_title_en}
                </h3>
              </div>
            </div>

            {/* Methodology Content Points */}
            <div className="space-y-4 mb-8 overflow-y-auto pr-1">
              {(language === 'hi'
                ? activeModalPillar.methodology_points_hi
                : activeModalPillar.methodology_points_en
              ).map((point, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {point}
                  </p>
                </div>
              ))}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setActiveModalPillar(null)}
                className="w-full sm:w-auto text-xs font-bold text-slate-500 hover:text-slate-800 py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
              >
                {t('common.close', 'Close')}
              </button>

              <button
                onClick={() => handleCtaClick(activeModalPillar.cta_type)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-shwf-navy to-slate-900 hover:from-shwf-navy-dark hover:to-slate-950 text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                {activeModalPillar.cta_type === 'calculator' && <Calculator className="w-4 h-4 text-shwf-orange" />}
                {activeModalPillar.cta_type === 'portal' && <Search className="w-4 h-4 text-emerald-400" />}
                {activeModalPillar.cta_type === 'call' && <Phone className="w-4 h-4 text-amber-400" />}
                <span>{language === 'hi' ? activeModalPillar.cta_text_hi : activeModalPillar.cta_text_en}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
