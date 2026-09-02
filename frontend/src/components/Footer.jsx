import React from 'react';
import { Phone, Globe, ShieldCheck, HeartHandshake, MapPin, ArrowRight, Instagram, ExternalLink } from 'lucide-react';
import Logo from './Logo';
import { useLanguage } from '../context/LanguageContext';

export default function Footer({ onOpenAdmin, isAdminLoggedIn }) {
  const { t } = useLanguage();

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

            <p className="text-slate-300 text-sm leading-relaxed pr-4 font-normal">
              {t('footer.tagline', 'Smart Health Welfare Foundation is a non-profit humanitarian organization dedicated to early child health diagnostics, eradicating malnutrition, and improving healthcare accessibility across Indian schools.')}
            </p>

            <div className="font-serif italic text-sm text-[#a7f3d0]">
              {t('common.mantra', '"सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः" — Empowering Healthier Futures')}
            </div>

            <div className="pt-1">
              <span className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-200 border border-white/15 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-shwf-orange" />
                <span>{t('common.regNo', 'Govt. Reg. No. 04/16/03/20319/24')}</span>
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links (Span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-base font-bold text-white uppercase tracking-wider relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-shwf-orange">
              {t('footer.quickLinks', 'Quick Navigation')}
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <a href="#home" className="hover:text-shwf-orange transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-shwf-green" /> {t('nav.home', 'Home')}
                </a>
              </li>
              <li>
                <a href="#donate" className="hover:text-shwf-orange transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-shwf-green" /> {t('nav.donate', 'Scan & Donate')}
                </a>
              </li>
              <li>
                <a href="#portal" className="hover:text-shwf-orange transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-shwf-green" /> {t('nav.portal', 'Student Health Portal')}
                </a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-shwf-orange transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-shwf-green" /> {t('nav.calculator', 'WHO Growth Calculator')}
                </a>
              </li>
              <li>
                <a href="#pillars" className="hover:text-shwf-orange transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-shwf-green" /> {t('nav.pillars', 'Core Impact Pillars')}
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-shwf-orange transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-shwf-green" /> {t('nav.gallery', 'Camp Gallery')}
                </a>
              </li>
              <li>
                <a href="#enquiry" className="hover:text-shwf-orange transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-shwf-green" /> {t('enquiry.badge', 'Camp & Consultation Enquiry')}
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

        {/* Bottom Bar: Agency Advertisement & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Agency Advertisement Card (Compact & Refined) */}
          <div className="flex items-center gap-3 bg-black/40 border border-amber-400/30 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg hover:border-amber-400/60 transition-all">
            <a
              href="https://www.instagram.com/amp_ventures?igsi=Z2JieDA0ejFnbzJn"
              target="_blank"
              rel="noopener noreferrer"
              className="relative shrink-0 block group"
              title="AMP Ventures Official Instagram"
            >
              <img
                src="/amp_ventures_logo.jpg"
                alt="AMP Ventures"
                className="w-9 h-9 rounded-full object-cover border border-amber-400 shadow-sm group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-slate-900 rounded-full"></span>
            </a>

            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Crafted by</span>
                <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 tracking-wider">
                  AMP VENTURES
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
                {/* Instagram Direct Link with Refined DM Text */}
                <a
                  href="https://www.instagram.com/amp_ventures?igsi=Z2JieDA0ejFnbzJn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300 font-bold transition-colors group/insta"
                  title="DM on Instagram for Inquiries"
                >
                  <Instagram className="w-3 h-3 text-pink-400 group-hover/insta:scale-110 transition-transform shrink-0" />
                  <span>@amp_ventures</span>
                  <span className="text-[10px] font-normal text-pink-300/80">(DM for Inquiries)</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                </a>

                <span className="text-slate-600 hidden sm:inline">&bull;</span>

                {/* Direct Phone / Call Link */}
                <a
                  href="tel:+917000384330"
                  className="inline-flex items-center gap-1 text-amber-300 hover:text-white font-bold transition-colors"
                  title="Call AMP Ventures"
                >
                  <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>+91 7000384330</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Staff Link, Reg No & Mission Support */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-400 text-center sm:text-right">
            <div>
              &copy; {new Date().getFullYear()} Smart Health Welfare Foundation. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              {/* Discreet Staff Link */}
              <button
                type="button"
                onClick={onOpenAdmin}
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Staff & Doctor Ingestion Access"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isAdminLoggedIn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                <span>{isAdminLoggedIn ? 'Staff Portal (Active)' : 'Staff Access'}</span>
              </button>

              <a href="#donate" className="text-shwf-orange hover:text-amber-300 font-bold transition-colors">
                Support Our Mission &uarr;
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
