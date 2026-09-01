import React, { useState } from 'react';
import { Menu, X, HeartHandshake, KeyRound, UserCheck, Shield } from 'lucide-react';
import Logo from './Logo';

export default function Navbar({
  onOpenAdmin,
  onOpenUserLogin,
  isAdminLoggedIn,
  isUserLoggedIn,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Donate & Bank Details', href: '#donate' },
    { name: 'Student Portal', href: '#portal' },
    { name: 'Growth Calculator', href: '#calculator' },
    { name: 'Pillars & Impact', href: '#pillars' },
    { name: 'About Us', href: '#about' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center">
            <Logo />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[14px] font-semibold text-shwf-navy hover:text-shwf-orange transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-shwf-orange after:transition-all hover:after:w-full"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Parent Sign-In Button */}
            <button
              onClick={onOpenUserLogin}
              className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 font-bold text-xs px-3.5 py-2 rounded-full shadow-sm hover:shadow transition-all"
            >
              {isUserLoggedIn ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Student Session Active</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>Parent Sign-In (OTP)</span>
                </>
              )}
            </button>

            {/* Admin Ingestion Button */}
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-shwf-navy border border-slate-300 font-bold text-xs px-3.5 py-2 rounded-full shadow-sm hover:shadow transition-all"
            >
              <span className={`w-2 h-2 rounded-full ${isAdminLoggedIn ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <Shield className="w-3.5 h-3.5 text-shwf-navy" />
              <span>{isAdminLoggedIn ? 'Admin Portal' : 'Admin Ingestion'}</span>
            </button>

            {/* Donate CTA */}
            <a
              href="#donate"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-shwf-orange to-amber-500 hover:from-shwf-orange-dark hover:to-shwf-orange text-white font-bold text-xs px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Donate Now</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-shwf-navy hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 bg-white shadow-xl rounded-b-2xl animate-fadeIn">
            <div className="flex flex-col gap-2 px-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
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
                  <span>Parent Sign-In (OTP Verification)</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAdmin) onOpenAdmin();
                  }}
                  className="flex items-center justify-center gap-2 bg-slate-100 border border-slate-300 text-shwf-navy font-bold text-sm py-2.5 rounded-xl shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Admin & Data Ingestion (Password)</span>
                </button>

                <a
                  href="#donate"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-shwf-orange text-white font-bold text-sm py-3 rounded-xl shadow-md"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Donate & Support</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
