import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const TOAST_THEMES = {
  success: {
    bg: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
    icon: CheckCircle2,
    progress: 'bg-emerald-400',
  },
  error: {
    bg: 'bg-rose-950/90 border-rose-500/30 text-rose-100',
    iconBg: 'bg-rose-500/20 text-rose-400',
    icon: AlertCircle,
    progress: 'bg-rose-400',
  },
  warning: {
    bg: 'bg-amber-950/90 border-amber-500/30 text-amber-100',
    iconBg: 'bg-amber-500/20 text-amber-400',
    icon: AlertTriangle,
    progress: 'bg-amber-400',
  },
  info: {
    bg: 'bg-slate-900/90 border-brand-500/30 text-slate-100',
    iconBg: 'bg-brand-500/20 text-brand-400',
    icon: Info,
    progress: 'bg-brand-400',
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-20 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((t) => {
        const theme = TOAST_THEMES[t.type] || TOAST_THEMES.info;
        const Icon = theme.icon;

        return (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-0 opacity-100 animate-in fade-in slide-in-from-top-5 ${theme.bg}`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${theme.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 pt-0.5 min-w-0">
                {t.title && (
                  <h4 className="text-sm font-bold tracking-tight text-white mb-0.5">
                    {t.title}
                  </h4>
                )}
                <p className="text-xs text-slate-300 leading-relaxed break-words">
                  {t.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subtle bottom progress bar */}
            {t.duration > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden">
                <div
                  className={`h-full ${theme.progress}`}
                  style={{
                    animation: `shrinkWidth ${t.duration}ms linear forwards`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
