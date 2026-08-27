import React, { useState } from 'react';
import { X, MessageSquare, CheckCircle2, ExternalLink, Sparkles, Terminal } from 'lucide-react';

interface SlackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectSlack: (workspaceName: string) => void;
}

export const SlackModal: React.FC<SlackModalProps> = ({ isOpen, onClose, onConnectSlack }) => {
  const [workspace, setWorkspace] = useState('acme-corp.slack.com');
  const [connected, setConnected] = useState(false);

  if (!isOpen) return null;

  const handleConnect = () => {
    setConnected(true);
    setTimeout(() => {
      onConnectSlack(workspace);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Connect ApexSupport Slack Bot</h3>
              <p className="text-xs text-slate-400">Resolve tickets directly inside your team's Slack channels</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-slate-800">
          
          {/* Card Preview */}
          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 font-sans space-y-3 shadow-inner">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center text-[10px] font-bold">
                #
              </div>
              <span className="font-mono text-xs text-slate-300">#help-it-support</span>
              <span className="ml-auto text-[10px] font-semibold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                Slack Connect Active
              </span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-xs space-y-1.5">
              <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ApexSupport Bot App</span>
              </div>
              <p className="text-slate-300">
                Type <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono">/support ticket "Password reset"</code> to invoke AI search & ticket creation right in Slack!
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Your Slack Workspace Domain
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </div>

          {connected ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Slack Workspace Connected! Ticket created in #help-it-support.</span>
            </div>
          ) : null}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConnect}
              disabled={connected}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 flex items-center space-x-2 transition disabled:opacity-50"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{connected ? 'Connected' : 'Add to Slack Workspace'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
