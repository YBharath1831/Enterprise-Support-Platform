import React, { useState } from 'react';
import { X, Mail, Send, Paperclip } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendEmail: (subject: string, description: string) => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, onSendEmail }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    setSending(true);
    setTimeout(() => {
      onSendEmail(subject, description);
      setSending(false);
      setSubject('');
      setDescription('');
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Compose Email Support Request</h3>
              <p className="text-xs text-slate-400">Directly dispatches to umashankarkh@outlook.com</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              To
            </label>
            <input
              type="text"
              disabled
              value="umashankarkh@outlook.com (AI Intake System)"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 bg-slate-100 text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., VPN Tunnel disconnects every 10 minutes"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Issue Explanation <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              placeholder="Provide complete details regarding your inquiry or technical difficulty..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
              disabled={sending}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 flex items-center space-x-2 transition disabled:opacity-50"
            >
              {sending ? (
                <span>Sending Email...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Email</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
