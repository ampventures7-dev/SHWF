import React from 'react';
import { Phone, ShieldCheck, Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function TopBar() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="bg-shwf-navy-dark text-slate-100 text-xs sm:text-sm font-medium py-3 sm:py-3.5 border-b border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-3">
        {/* Registration Badge & Sanskrit Shloka */}
        <div className="flex items-center flex-wrap gap-3 sm:gap-4">
          <span className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/25 text-white text-xs sm:text-[13px] font-extrabold px-3.5 py-1 rounded-md shadow-sm transition-colors">
            <ShieldCheck className="w-4 h-4 text-shwf-orange shrink-0" />
            <span>{t('common.regNo', 'Reg. No. 04/16/03/20319/24')}</span>
          </span>
          <span className="hidden md:inline font-serif text-[#a7f3d0] italic text-xs sm:text-sm font-medium tracking-wide">
            {t('common.mantra', '"सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः" — Empowering Healthier Futures')}
          </span>
        </div>

        {/* Helpline & Language Switcher */}
        <div className="flex items-center gap-3">
          {/* Language Switcher Button */}
          <div className="inline-flex items-center bg-white/10 border border-white/20 rounded-lg p-0.5 shadow-inner">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                language === 'en'
                  ? 'bg-white text-shwf-navy shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                language === 'hi'
                  ? 'bg-shwf-orange text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Helpline Phone */}
          <a
            href="tel:+919424761140"
            className="inline-flex items-center gap-2 text-white hover:text-shwf-orange transition-colors text-xs sm:text-sm font-bold bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-1 rounded-md"
            title="Call Official Helpline"
          >
            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300 font-normal">{t('common.helpline', 'Helpline')}:</span>
            <span className="tracking-wider">+91 9424 761140</span>
          </a>
        </div>
      </div>
    </div>
  );
}


