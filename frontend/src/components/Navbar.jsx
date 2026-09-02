import React, { useState } from 'react';
import { Menu, X, HeartHandshake, KeyRound, UserCheck, Shield, Languages } from 'lucide-react';
import Logo from './Logo';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({
  onOpenAdmin,
  onOpenUserLogin,
  isAdminLoggedIn,
  isUserLoggedIn,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { name: t('nav.home', 'Home'), href: '#home' },
    { name: t('nav.portal', 'Student Portal'), href: '#portal' },
    { name: t('nav.calculator', 'Growth Calculator'), href: '#calculator' },
    { name: t('nav.pillars', 'Pillars & Impact'), href: '#pillars' },
    { name: t('nav.gallery', 'Camp Gallery'), href: '#gallery' },
    { name: t('nav.about', 'About Us'), href: '#about' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex justify-between items-center h-20 gap-2 xl:gap-4">
          {/* Logo */}
          <a href="#home" className="flex items-center flex-shrink-0">
            <Logo />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-3.5 2xl:gap-6 flex-shrink-0">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] 2xl:text-[14px] font-bold text-shwf-navy hover:text-shwf-orange transition-colors relative py-1.5 whitespace-nowrap tracking-tight after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-shwf-orange after:rounded-full after:transition-all hover:after:w-full"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 flex-shrink-0">
            {/* Parent Register & Sign-In Button */}
            <button
              onClick={onOpenUserLogin}
              className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 font-bold text-xs px-3 py-2 rounded-full shadow-sm hover:shadow transition-all whitespace-nowrap cursor-pointer"
            >
              {isUserLoggedIn ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden xl:inline">{t('nav.parentActive', 'Parent Session Active')}</span>
                  <span className="xl:hidden">Active</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('nav.parentRegisterSignIn', 'Parent Register & Sign-In')}</span>
                </>
              )}
            </button>


            {/* Admin Portal Button (Only visible after staff logs in) */}
            {isAdminLoggedIn && (
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs px-3 py-2 rounded-full shadow-sm hover:shadow transition-all whitespace-nowrap cursor-pointer animate-fadeIn"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <Shield className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('nav.adminPortal', 'Admin Portal (Active)')}</span>
              </button>
            )}

            {/* Donate CTA */}
            <a
              href="#donate"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-shwf-orange to-amber-500 hover:from-shwf-orange-dark hover:to-shwf-orange text-white font-extrabold text-xs px-3.5 py-2 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>{t('nav.donateNow', 'Donate Now')}</span>
            </a>
          </div>

          {/* Mobile Direct Action & Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Direct Parent Login Button on Mobile Header */}
            <button
              onClick={onOpenUserLogin}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-shwf-orange hover:from-amber-600 hover:to-shwf-orange text-white font-extrabold text-[11px] sm:text-xs px-3 sm:px-3.5 py-1.5 rounded-full shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <KeyRound className="w-3.5 h-3.5 shrink-0" />
              <span>{isUserLoggedIn ? (language === 'hi' ? 'सत्र सक्रिय' : 'Active Session') : (language === 'hi' ? 'अभिभावक लॉगिन' : 'Parent Login')}</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-xl text-shwf-navy hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>



        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 bg-white shadow-xl rounded-b-2xl animate-fadeIn">
            <div className="flex flex-col gap-2 px-2">
              {/* Mobile Language Switcher */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-xl mb-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Languages className="w-4 h-4 text-shwf-navy" />
                  <span>Language / भाषा:</span>
                </div>
                <div className="inline-flex bg-slate-200 p-0.5 rounded-lg text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      language === 'en' ? 'bg-white text-shwf-navy shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('hi')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      language === 'hi' ? 'bg-shwf-orange text-white shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    हिंदी
                  </button>
                </div>
              </div>

              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-shwf-navy hover:bg-shwf-navy-subtle rounded-lg transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-2 px-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenUserLogin) onOpenUserLogin();
                  }}
                  className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-300 text-amber-900 font-bold text-sm py-2.5 rounded-xl shadow-sm"
                >
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>{t('nav.parentRegisterSignIn', 'Parent Register & Sign-In')}</span>
                </button>


                {/* Admin Portal (Only when staff is logged in) */}
                {isAdminLoggedIn && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenAdmin) onOpenAdmin();
                    }}
                    className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-sm py-2.5 rounded-xl shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{t('nav.adminPortal', 'Admin Portal (Active Session)')}</span>
                  </button>
                )}

                <a
                  href="#donate"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-shwf-orange text-white font-bold text-sm py-3 rounded-xl shadow-md"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>{t('nav.donateNow', 'Donate & Support')}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
