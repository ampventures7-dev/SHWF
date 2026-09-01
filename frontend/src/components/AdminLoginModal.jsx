import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  X,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { API } from '../services/api';

export default function AdminLoginModal({ isOpen, onClose, onSuccess, onToast }) {
  const [username, setUsername] = useState('admin@smarthealthyindia.com');
  const [password, setPassword] = useState('Admin@SHWF2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both administrative username and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const result = await API.adminLogin(username.trim(), password);
      if (onToast) {
        onToast(`Welcome Admin (${result.username})! Data Ingestion unlocked.`, 'success');
      }
      onSuccess(result.access_token);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Invalid username or password entered.');
      if (onToast) {
        onToast(err.message || 'Authentication Failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 animate-zoomIn">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition-all"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Security Badge Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-shwf-navy via-slate-900 to-shwf-navy text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-shwf-navy/20 border border-slate-700">
            <ShieldAlert className="w-8 h-8 text-shwf-orange" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-[11px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full mb-2">
            <Lock className="w-3 h-3 text-amber-700" />
            <span>Restricted Access</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Admin Sign-In
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Sign in with administrative credentials to manage student registrations, CSV feeds & health camp vitals.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username / Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Admin Username or Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@smarthealthyindia.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-shwf-navy focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Password with Show/Hide */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-11 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-shwf-navy focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Default Dev Hint Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-shwf-orange flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Local Dev Credentials:</span><br />
              User: <code className="font-mono text-shwf-navy font-bold">admin@smarthealthyindia.com</code><br />
              Pass: <code className="font-mono text-shwf-navy font-bold">Admin@SHWF2026</code>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-shwf-navy to-slate-800 hover:from-shwf-navy-dark hover:to-shwf-navy text-white font-bold text-sm py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Admin...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Sign In to Admin Portal</span>
              </>
            )}
          </button>
        </form>

        {/* Security Footer Note */}
        <p className="text-[11px] text-center text-slate-400 mt-4">
          Protected with role-based JWT authorization & bcrypt cryptography.
        </p>

      </div>
    </div>
  );
}
