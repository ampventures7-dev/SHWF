import React from 'react';
import { Phone, Globe, ShieldCheck, KeyRound, Lock, UserCheck } from 'lucide-react';

export default function TopBar({ onOpenAdmin, onOpenUserLogin, isAdminLoggedIn, isUserLoggedIn }) {
  return (
    <div className="bg-shwf-navy-dark text-slate-200 text-xs font-medium py-2 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-2">
        {/* Registration Badge & Mantra */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-shwf-orange" />
            Reg. No. 04/16/03/20319/24
          </span>
          <span className="hidden md:inline font-serif text-[#a7f3d0] italic text-xs">
            "सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः" — Empowering Healthier Futures
          </span>
        </div>

        {/* Official Contact & Portals Access */}
        <div className="flex items-center gap-3.5 text-xs">
          
          {/* Parent Login Button */}
          <button
            onClick={onOpenUserLogin}
            className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold transition-colors"
          >
            {isUserLoggedIn ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Student Active</span>
              </>
            ) : (
              <>
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Parent Sign-In (OTP)</span>
              </>
            )}
          </button>

          <span className="text-white/30">|</span>

          {/* Admin Login / Access Button */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isAdminLoggedIn ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400'}`}></span>
            <span>{isAdminLoggedIn ? 'Admin Portal (Live)' : 'Admin Access (Password)'}</span>
          </button>

          <span className="text-white/30">|</span>

          <a
            href="tel:+919424761140"
            className="flex items-center gap-1.5 text-white hover:text-shwf-orange transition-colors font-semibold"
          >
            <Phone className="w-3.5 h-3.5 text-shwf-green" />
            <span>+91 9424 761140</span>
          </a>

          <span className="hidden sm:inline text-white/30">|</span>

          <a
            href="http://www.smarthealthyindia.com"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-shwf-orange" />
            <span>smarthealthyindia.com</span>
          </a>
        </div>
      </div>
    </div>
  );
}
