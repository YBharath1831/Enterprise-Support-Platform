import React, { useState } from 'react';
import { TicketPriority } from '../../types';
import { X, Send, Paperclip, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SubmitTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    subject: string;
    category: string;
    priority: TicketPriority;
    description: string;
    attachmentName?: string;
  }) => void;
}

export const SubmitTicketModal: React.FC<SubmitTicketModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Hardware & Media');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({
        subject,
        category,
        priority,
        description,
        attachmentName: attachment ? attachment.name : undefined,
      });
      setIsSubmitting(false);
      setSubject('');
      setDescription('');
      setAttachment(null);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-cyan-400 flex items-center justify-center border border-blue-500/40">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Submit Enterprise Ticket</h3>
              <p className="text-xs text-slate-400">Routed automatically to AI Triage & Support Team</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Issue Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Camera not detected in browser meeting room"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="Hardware & Media">Hardware & Media</option>
                <option value="Browser & Web App">Browser & Web App</option>
                <option value="Account & Security">Account & Security</option>
                <option value="Software & Desktop">Software & Desktop</option>
                <option value="Network & Connectivity">Network & Connectivity</option>
                <option value="Email & Workspace">Email & Workspace</option>
                <option value="Billing & Subscriptions">Billing & Subscriptions</option>
                <option value="Storage & Transfer">Storage & Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Priority Severity
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="Low">Low — General Query</option>
                <option value="Medium">Medium — Standard Issue</option>
                <option value="High">High — Work Impacted</option>
                <option value="Urgent">Urgent — System Down</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe steps to reproduce, error codes, software versions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Attachment (Optional log file or screenshot)
            </label>
            <div className="flex items-center space-x-2 border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50">
              <Paperclip className="w-4 h-4 text-slate-400" />
              <input
                type="file"
                onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
                className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-slate-200 hover:file:bg-slate-300"
              />
            </div>
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
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 flex items-center space-x-2 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting Ticket...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
