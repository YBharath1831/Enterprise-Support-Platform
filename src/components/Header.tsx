import React from 'react';
import { ViewMode } from '../types';
import { 
  Bot, 
  UserCheck, 
  LayoutDashboard, 
  MessageSquare, 
  LifeBuoy, 
  Bell, 
  Sparkles,
  ShieldAlert,
  Mail
} from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  pendingApprovalsCount: number;
  openTicketsCount: number;
  onTriggerDemoEmail: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  pendingApprovalsCount,
  openTicketsCount,
  onTriggerDemoEmail,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectView('portal')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-md shadow-blue-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Umashankar K H
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  AI Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Multi-Channel Support & Autonomous RAG
              </p>
            </div>
          </div>

          {/* Navigation Views */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              id="nav-btn-portal"
              onClick={() => onSelectView('portal')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentView === 'portal'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LifeBuoy className="w-4 h-4 text-cyan-300" />
              <span>Customer Portal</span>
            </button>

            <button
              id="nav-btn-chat"
              onClick={() => onSelectView('chat')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentView === 'chat'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Live Support Chat</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>

            <button
              id="nav-btn-admin"
              onClick={() => onSelectView('admin')}
              className={`relative flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentView === 'admin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span>Admin Dashboard</span>
              {pendingApprovalsCount > 0 && (
                <span className="ml-1 bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full shadow">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Actions & Simulation Status */}
          <div className="flex items-center space-x-3">
            <button
              id="btn-demo-email-trigger"
              onClick={onTriggerDemoEmail}
              title="Trigger a simulated automated email notification toast"
              className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs transition"
            >
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Test Email Alert</span>
            </button>

            <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-slate-300">RAG Engine:</span>
                <span className="text-emerald-400 font-medium">Online</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
