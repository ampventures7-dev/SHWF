import React from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl shadow-2xl border text-sm font-semibold transition-all duration-300 animate-slideInRight ${
            t.type === 'success'
              ? 'bg-white text-slate-800 border-emerald-500 border-l-4'
              : t.type === 'error'
              ? 'bg-white text-slate-800 border-red-500 border-l-4'
              : t.type === 'warning'
              ? 'bg-white text-slate-800 border-amber-500 border-l-4'
              : 'bg-white text-slate-800 border-shwf-navy border-l-4'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {t.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />}
            {(!t.type || t.type === 'info') && <Info className="w-5 h-5 text-shwf-navy flex-shrink-0" />}
            <span className="text-slate-800 text-xs sm:text-sm">{t.message}</span>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-slate-400 hover:text-slate-700 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
