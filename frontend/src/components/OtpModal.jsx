import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, X, Loader2, KeyRound, RefreshCw, AlertCircle } from 'lucide-react';
import { API } from '../services/api';

export default function OtpModal({
  student,
  onClose,
  onSuccess,
  onToast,
  skipInitialDispatch = false,
}) {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const inputRefs = useRef([]);

  // Send OTP on modal open if not already dispatched
  useEffect(() => {
    if (!skipInitialDispatch) {
      sendOtp();
    }
    // Auto focus first input
    setTimeout(() => {
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }, 150);
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const sendOtp = async () => {
    setSending(true);
    setErrorMessage('');
    try {
      const contact = student.parent_phone || '+919876543210';
      await API.requestOtp(student.student_id, contact);
      if (onToast) onToast('OTP sent to registered parent number! (Test code active)', 'info');
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch OTP');
      if (onToast) onToast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (index, value) => {
    if (value.length > 1) {
      // Handled in onPaste
      return;
    }
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    // Auto advance focus
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpValues(digits);
      if (inputRefs.current[5]) inputRefs.current[5].focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const otpCode = otpValues.join('');
    if (otpCode.length < 6) {
      setErrorMessage('Please enter all 6 digits of the OTP');
      return;
    }

    setVerifying(true);
    setErrorMessage('');
    try {
      const contact = student.parent_phone || '+919876543210';
      const result = await API.verifyOtp(student.student_id, contact, otpCode);
      if (onToast) onToast('OTP Verified! Opening Child Health Dashboard...', 'success');
      onSuccess(result.access_token || 'sample_token', student);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired OTP code entered');
      if (onToast) onToast(err.message, 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-shwf-navy-dark/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative border border-slate-100 animate-zoomIn">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Heading */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-shwf-navy-subtle text-shwf-navy flex items-center justify-center mx-auto mb-4 shadow-sm">
            <KeyRound className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-shwf-navy">
            Parent OTP Verification
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Accessing records for: <strong className="text-slate-800">{student.full_name} ({student.student_id})</strong>
          </p>
          <div className="mt-2 inline-block bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold text-slate-600">
            Sent to: {student.parent_phone_masked || '+91 ******1140'}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 6 Digit OTP Inputs */}
        <form onSubmit={handleVerify}>
          <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
            {otpValues.map((val, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                maxLength={1}
                value={val}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black text-shwf-navy bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-shwf-navy focus:bg-white focus:ring-2 focus:ring-shwf-navy/20 transition-all"
              />
            ))}
          </div>

          {/* Timer & Resend */}
          <div className="text-center text-xs text-slate-500 mb-6">
            {!canResend ? (
              <span>Resend OTP in <strong className="text-shwf-navy">{timer}s</strong></span>
            ) : (
              <button
                type="button"
                onClick={sendOtp}
                disabled={sending}
                className="text-shwf-orange hover:text-shwf-orange-dark font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Resend OTP Code</span>
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={verifying || otpValues.join('').length < 6}
            className="w-full bg-gradient-to-r from-shwf-navy to-shwf-navy-light hover:from-shwf-navy-dark hover:to-shwf-navy text-white font-bold text-sm py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & View Report Card</span>
              </>
            )}
          </button>
        </form>

        {/* Security Note */}
        <p className="text-[11px] text-center text-slate-400 mt-4">
          Protected by bcrypt hashed zero-knowledge token isolation.
        </p>

      </div>
    </div>
  );
}
