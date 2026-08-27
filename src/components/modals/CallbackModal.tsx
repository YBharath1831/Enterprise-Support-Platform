import React, { useState } from 'react';
import { X, Phone, Clock, Calendar, CheckCircle2 } from 'lucide-react';

interface CallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestCallback: (phone: string, timeSlot: string, reason: string) => void;
}

export const CallbackModal: React.FC<CallbackModalProps> = ({
  isOpen,
  onClose,
  onRequestCallback,
}) => {
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [timeSlot, setTimeSlot] = useState('Immediate (Next available AI/Human Specialist)');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !reason) return;

    setSubmitting(true);
    setTimeout(() => {
      onRequestCallback(phone, timeSlot, reason);
      setSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Request Phone Support Callback</h3>
              <p className="text-xs text-slate-400">Enterprise SLA guaranteed under 15 minutes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Direct Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Preferred Callback Slot
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="Immediate (Next available AI/Human Specialist)">Immediate (Under 15 Mins)</option>
              <option value="Today Afternoon (2:00 PM - 4:00 PM EST)">Today Afternoon (2:00 PM - 4:00 PM EST)</option>
              <option value="Tomorrow Morning (10:00 AM - 12:00 PM EST)">Tomorrow Morning (10:00 AM - 12:00 PM EST)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Call Topic / Issue Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Briefly state what you need assistance with..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 flex items-center space-x-2 transition disabled:opacity-50"
            >
              {submitting ? (
                <span>Scheduling...</span>
              ) : (
                <>
                  <Phone className="w-4 h-4" />
                  <span>Request Callback</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
