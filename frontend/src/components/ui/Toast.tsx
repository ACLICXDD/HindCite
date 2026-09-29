import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl transition-all duration-300 transform translate-y-0 opacity-100 bg-card/95 backdrop-blur-md',
            toast.type === 'success' && 'border-emerald-500/40 text-foreground',
            toast.type === 'error' && 'border-rose-500/40 text-foreground',
            toast.type === 'warning' && 'border-amber-500/40 text-foreground',
            toast.type === 'info' && 'border-sky-500/40 text-foreground'
          )}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'success' && (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="h-5 w-5 text-rose-400" />
            )}
            {toast.type === 'warning' && (
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            )}
            {toast.type === 'info' && (
              <Info className="h-5 w-5 text-sky-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold tracking-tight leading-snug">
              {toast.title}
            </h4>
            {toast.message && (
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {toast.message}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
