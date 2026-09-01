import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  MessageSquare,
  KeyRound,
  Loader2,
  X,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { API } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function UserLoginModal({
  isOpen,
  onClose,
  onOtpRequested,
  onToast,
  initialStudentId,
}) {
  const { t } = useLanguage();
  const [studentId, setStudentId] = useState(initialStudentId || 'STD-2026-001');
  const [contactChannel, setContactChannel] = useState('phone'); // 'phone' | 'whatsapp' | 'email'
  const [contactValue, setContactValue] = useState('+919876543210');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialStudentId) {
      setStudentId(initialStudentId);
    }
  }, [initialStudentId, isOpen]);

  if (!isOpen) return null;


  const handleChannelChange = (channel) => {
    setContactChannel(channel);
    if (channel === 'email') {
      if (!contactValue.includes('@')) {
        setContactValue('parent@example.com');
      }
    } else {
      if (contactValue.includes('@') || !contactValue.startsWith('+91')) {
        setContactValue('+919876543210');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanId = studentId.trim().toUpperCase();
    const cleanContact = contactValue.trim();

    if (!cleanId) {
      setErrorMessage('Please enter the Student ID or Roll Number.');
      return;
    }
    if (!cleanContact || cleanContact.length < 5) {
      setErrorMessage('Please enter a valid registered mobile number or email address.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await API.requestOtp(cleanId, cleanContact);
      if (onToast) {
        onToast(
          `OTP dispatched to ${cleanContact} via ${contactChannel.toUpperCase()}!`,
          'success'
        );
      }

      // Close this sign-in modal and launch OtpModal
      onOtpRequested({
        student_id: cleanId,
        full_name: cleanId === 'STD-2026-001' ? 'Aarav Sharma' : `Student (${cleanId})`,
        parent_phone: cleanContact,
        parent_phone_masked: cleanContact.includes('@')
          ? cleanContact.replace(/(.{2})(.*)(@.*)/, '$1***$3')
          : cleanContact.replace(/(\+?\d{2})\d{6}(\d{4})/, '$1 ******$2'),
      });
      onClose();
    } catch (err) {
      setErrorMessage(
        err.detail || err.message || 'Failed to dispatch verification code. Please check details.'
      );
      if (onToast) {
        onToast(err.message || 'OTP dispatch failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-shwf-navy-dark/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 animate-zoomIn">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition-all"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Heading */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-shwf-orange/20 to-amber-100 text-shwf-orange flex items-center justify-center mx-auto mb-3 shadow-md border border-amber-200">
            <KeyRound className="w-8 h-8 text-shwf-orange" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full mb-2 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>{t('userLogin.title', 'Parent Registration & Sign-In')}</span>
          </div>
          <h3 className="text-2xl font-black text-shwf-navy tracking-tight">
            {t('userLogin.title', 'Parent Registration & Sign-In')}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {t('userLogin.subtitle', 'Enter your child\'s Student ID and registered Mobile number to register or sign-in with instant 6-digit OTP verification.')}
          </p>

        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Channel Selector Tabs (SMS / WhatsApp / Email) */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 mb-5">
          <button
            type="button"
            onClick={() => handleChannelChange('phone')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              contactChannel === 'phone'
                ? 'bg-white text-shwf-navy shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-shwf-navy" />
            <span>Mobile SMS</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleChannelChange('whatsapp')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              contactChannel === 'whatsapp'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => handleChannelChange('email')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              contactChannel === 'email'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-amber-600" />
            <span>Email</span>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Student ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('userLogin.studentIdLabel', 'Student ID / Roll No')} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                placeholder="e.g. STD-2026-001"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-shwf-navy focus:bg-white focus:ring-2 focus:ring-shwf-navy focus:border-transparent transition-all uppercase"
                required
              />
            </div>
            
            {/* Quick Demo Student Pills */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px] text-slate-500">
              <span>Try Demo ID:</span>
              {['STD-2026-001', 'STD-2026-002', 'STD-2026-003'].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setStudentId(id)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px] transition-colors border border-slate-200"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('userLogin.contactLabel', 'Registered Mobile Number or Email')} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                {contactChannel === 'email' ? (
                  <Mail className="w-4 h-4" />
                ) : contactChannel === 'whatsapp' ? (
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Phone className="w-4 h-4" />
                )}
              </div>
              <input
                type={contactChannel === 'email' ? 'email' : 'text'}
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={
                  contactChannel === 'email'
                    ? 'parent@example.com'
                    : '+919876543210'
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-shwf-navy focus:border-transparent transition-all"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-slate-400" />
              <span>{t('userLogin.helpText', 'If you do not know your child\'s Student ID, use the search portal above.')}</span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-shwf-orange to-amber-500 hover:from-shwf-orange-dark hover:to-shwf-orange text-white font-bold text-sm py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-3 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('userLogin.sendingOtp', 'Dispatching OTP...')}</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>{t('userLogin.requestOtpBtn', 'Send Verification OTP')}</span>
              </>
            )}
          </button>
        </form>

        {/* Security Note */}
        <p className="text-[11px] text-center text-slate-400 mt-4">
          {t('portal.privacyNotice', 'Anti-enumeration zero-knowledge verification powered by MSG91 & Bcrypt.')}
        </p>

      </div>
    </div>
  );
}

