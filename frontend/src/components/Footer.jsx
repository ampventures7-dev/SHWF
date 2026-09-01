import React from 'react';
import { Phone, Globe, ShieldCheck, HeartHandshake, MapPin, ArrowRight } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer id="about" className="bg-shwf-navy-dark text-white pt-16 pb-8 border-t-4 border-shwf-green">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Col 1: Brand & Registration (Span 5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white/10 p-3 rounded-2xl inline-block backdrop-blur-md">
              <Logo />
            </div>

            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-slate-200 border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-shwf-orange" />
              <span>Govt. Reg. No. 04/16/03/20319/24</span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed pr-4">
              Smart Health Welfare Foundation is a non-profit humanitarian organization dedicated to early child health diagnostics, eradicating malnutrition, and improving healthcare accessibility across Indian schools.
            </p>

            <div className="font-serif italic text-sm text-[#a7f3d0]">
              "Let's join hands for a healthy, educated and compassionate society."
            </div>
          </div>

          {/* Col 2: Quick Links (Span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-base font-bold text-white uppercase tracking-wider relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-shwf-orange">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <a href="#home" className="hover:text-shwf-orange transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-shwf-green" /> Home
                </a>
              </li>
              <li>
                <a href="#donate" className="hover:text-shwf-orange transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-shwf-green" /> Scan & Donate
                </a>
              </li>
              <li>
                <a href="#portal" className="hover:text-shwf-orange transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-shwf-green" /> Student Health Portal
                </a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-shwf-orange transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-shwf-green" /> WHO Growth Calculator
                </a>
              </li>
              <li>
                <a href="#pillars" className="hover:text-shwf-orange transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-shwf-green" /> Core Impact Pillars
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Official Contact & Bank Summary (Span 4) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-base font-bold text-white uppercase tracking-wider relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-shwf-orange">
              Contact & Donations
            </h4>

            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-shwf-green flex-shrink-0 mt-1" />
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Helpline Contacts:</div>
                  <a href="tel:+919424761140" className="text-white font-bold hover:text-shwf-orange block">
                    +91 9424 761140
                  </a>
                  <a href="tel:+919713673141" className="text-white font-bold hover:text-shwf-orange block">
                    +91 9713 673141
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-shwf-orange flex-shrink-0 mt-1" />
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Official Website:</div>
                  <a href="http://www.smarthealthyindia.com" target="_blank" rel="noreferrer" className="text-white hover:text-shwf-orange">
                    www.smarthealthyindia.com
                  </a>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300">
                <strong className="text-white block font-bold mb-0.5">Union Bank of India</strong>
                A/C: 418502010224987 &bull; IFSC: UBIN0541851
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} Smart Health Welfare Foundation. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="text-slate-300 font-medium">Reg. No. 04/16/03/20319/24</span>
            <a href="#donate" className="text-shwf-orange hover:text-amber-300 font-bold transition-colors">
              Support Our Mission &uarr;
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
