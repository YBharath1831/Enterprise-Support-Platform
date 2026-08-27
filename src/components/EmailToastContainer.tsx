import React from 'react';
import { EmailToast } from '../types';
import { Mail, CheckCircle2, X, Send } from 'lucide-react';

interface EmailToastContainerProps {
  toasts: EmailToast[];
  onDismiss: (id: string) => void;
}

export const EmailToastContainer: React.FC<EmailToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-slate-900 text-white rounded-xl p-4 shadow-2xl border border-blue-500/30 flex flex-col space-y-2 animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                  Automated Email Dispatched
                </span>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{toast.timestamp}</p>
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-100 line-clamp-1">{toast.subject}</p>
            <p className="text-xs text-slate-300 mt-1">
              To: <span className="font-mono text-cyan-300">{toast.recipient}</span>
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="font-mono text-slate-400">Ref: #{toast.ticketId}</span>
            <span className="inline-flex items-center space-x-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>Status: {toast.status}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
