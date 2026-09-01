import React from 'react';
import { Phone, ShieldCheck } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="bg-shwf-navy-dark text-slate-100 text-xs sm:text-sm font-medium py-3 sm:py-3.5 border-b border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-3">
        {/* Registration Badge & Sanskrit Shloka */}
        <div className="flex items-center flex-wrap gap-3 sm:gap-4">
          <span className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/25 text-white text-xs sm:text-[13px] font-extrabold px-3.5 py-1 rounded-md shadow-sm transition-colors">
            <ShieldCheck className="w-4 h-4 text-shwf-orange shrink-0" />
            <span>Reg. No. 04/16/03/20319/24</span>
          </span>
          <span className="hidden md:inline font-serif text-[#a7f3d0] italic text-xs sm:text-sm font-medium tracking-wide">
            "सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः" — Empowering Healthier Futures
          </span>
        </div>

        {/* Official Helpline Phone Number */}
        <div className="flex items-center gap-2">
          <a
            href="tel:+919424761140"
            className="inline-flex items-center gap-2 text-white hover:text-shwf-orange transition-colors text-xs sm:text-sm font-bold bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-1 rounded-md"
            title="Call Official Helpline"
          >
            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300 font-normal">Helpline:</span>
            <span className="tracking-wider">+91 9424 761140</span>
          </a>
        </div>
      </div>
    </div>
  );
}

