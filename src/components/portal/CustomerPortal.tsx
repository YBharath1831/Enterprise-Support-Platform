import React, { useState, useMemo } from 'react';
import { KBArticle, TicketPriority } from '../../types';
import { 
  Search, 
  MessageSquare, 
  Mail, 
  Phone, 
  Slack, 
  Send, 
  BookOpen, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  Filter,
  CheckCircle2,
  LifeBuoy
} from 'lucide-react';
import { SubmitTicketModal } from '../modals/SubmitTicketModal';
import { EmailModal } from '../modals/EmailModal';
import { CallbackModal } from '../modals/CallbackModal';
import { SlackModal } from '../modals/SlackModal';
import { KBArticleModal } from '../modals/KBArticleModal';

interface CustomerPortalProps {
  articles: KBArticle[];
  onOpenChat: (initialQuery?: string) => void;
  onCreateTicket: (ticketData: {
    subject: string;
    category: string;
    priority: TicketPriority;
    description: string;
    channel: 'chat' | 'email' | 'call' | 'slack' | 'portal';
    attachmentName?: string;
  }) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  articles,
  onOpenChat,
  onCreateTicket,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Modals state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [isSlackModalOpen, setIsSlackModalOpen] = useState(false);
  const [activeKBArticle, setActiveKBArticle] = useState<KBArticle | null>(null);

  // Categories list
  const categories = ['All', 'Hardware & Media', 'Browser & Web App', 'Account & Security', 'Software & Desktop', 'Network & Connectivity', 'Email & Workspace', 'Billing & Subscriptions', 'Storage & Transfer'];

  // Filtered Articles
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchesSearch = 
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCat = selectedCategory === 'All' || art.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [articles, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      
      {/* Hero Welcome Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 pt-12 pb-16 border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/50 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Autonomous Support Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            How can we help you today?
          </h1>
          
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Search our knowledge base for instant diagnostic guides or connect with our RAG-grounded AI support agent across any channel.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative mt-4">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                id="kb-search-input"
                type="text"
                placeholder="Search error codes, issues (e.g. camera, password reset, VPN, billing)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-800/90 text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base shadow-xl backdrop-blur-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-slate-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        
        {/* Support Channels Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <LifeBuoy className="w-5 h-5 text-cyan-400" />
                <span>Choose a Support Channel</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Multi-channel support connected to unified AI context</p>
            </div>
            <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20 font-mono hidden sm:inline-block">
              24/7 AI Availability
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* 1. Live Chat Tile */}
            <div
              id="channel-tile-chat"
              onClick={() => onOpenChat()}
              className="group relative bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-semibold text-white text-base">Live Chat</h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Instant RAG AI Agent resolution under 30 seconds.</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-medium text-cyan-400">
                <span>Start Chat</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* 2. Email Support Tile */}
            <div
              id="channel-tile-email"
              onClick={() => setIsEmailModalOpen(true)}
              className="group relative bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 group-hover:scale-110 transition">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Email Support</h3>
                  <p className="text-xs text-slate-400 mt-1">Compose structured inquiry to umashankarkh@outlook.com</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-medium text-indigo-400">
                <span>Compose Email</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
              {/* Real mailto - opens the visitor's own email app (device-level, not simulated),
                  addressed to the live mailbox wired into the Logic App -> /api/email-intake
                  pipeline. Kept separate from the tile's onClick (structured in-app form,
                  still simulated) via stopPropagation so the two don't fight each other. */}
              <a
                href="mailto:umashankarkh@outlook.com?subject=Support%20Request&body=Please%20describe%20your%20issue%20here..."
                onClick={(e) => e.stopPropagation()}
                className="mt-2 text-[11px] text-slate-500 hover:text-indigo-300 underline decoration-dotted underline-offset-2 w-fit"
              >
                or open in your device's email app (real, live)
              </a>
            </div>

            {/* 3. Call Support Tile */}
            <div
              id="channel-tile-call"
              onClick={() => setIsCallbackModalOpen(true)}
              className="group relative bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Call Support</h3>
                  <p className="text-xs text-slate-400 mt-1">Request an immediate phone callback from tier specialists.</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-medium text-emerald-400">
                <span>Request Call</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* 4. Slack Support Tile */}
            <div
              id="channel-tile-slack"
              onClick={() => setIsSlackModalOpen(true)}
              className="group relative bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition">
                  <Slack className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Slack Support</h3>
                  <p className="text-xs text-slate-400 mt-1">Connect ApexSupport bot directly into your Slack workspace.</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-medium text-purple-400">
                <span>Slack Connect</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* 5. Submit a Ticket Tile */}
            <div
              id="channel-tile-ticket"
              onClick={() => setIsSubmitModalOpen(true)}
              className="group relative bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Submit a Ticket</h3>
                  <p className="text-xs text-slate-400 mt-1">Structured ticket form with attachment support & severity level.</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-medium text-amber-400">
                <span>Submit Form</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>

          </div>
        </section>

        {/* Knowledge Base Section */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span>Knowledge Base & Troubleshooting Articles</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Showing {filteredArticles.length} of {articles.length} verified diagnostic guides
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-2 scrollbar-none max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-800">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">No knowledge base articles match your query.</p>
              <p className="text-slate-500 text-xs mt-1">Try resetting search filters or launch Live Chat with our AI Agent.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs rounded-xl font-medium border border-slate-700"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((art) => (
                <div
                  key={art.id}
                  className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 hover:border-blue-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all duration-200 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                        {art.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{art.readTime}</span>
                    </div>

                    <h3 className="font-semibold text-slate-100 text-base group-hover:text-cyan-300 transition line-clamp-1">
                      {art.title}
                    </h3>

                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                      {art.summary}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verified Policy</span>
                    </span>

                    <button
                      onClick={() => setActiveKBArticle(art)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-cyan-300 hover:text-white text-xs font-semibold flex items-center space-x-1 transition border border-blue-500/30"
                    >
                      <span>Read Guide</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Modals */}
      <SubmitTicketModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={(data) => {
          onCreateTicket({ ...data, channel: 'portal' });
        }}
      />

      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSendEmail={(subject, description) => {
          onCreateTicket({
            subject,
            category: 'Email & Workspace',
            priority: 'Medium',
            description,
            channel: 'email',
          });
        }}
      />

      <CallbackModal
        isOpen={isCallbackModalOpen}
        onClose={() => setIsCallbackModalOpen(false)}
        onRequestCallback={(phone, timeSlot, reason) => {
          onCreateTicket({
            subject: `Phone Callback Request: ${reason}`,
            category: 'Hardware & Media',
            priority: 'High',
            description: `Callback requested for number ${phone} during slot: ${timeSlot}. Reason: ${reason}`,
            channel: 'call',
          });
        }}
      />

      <SlackModal
        isOpen={isSlackModalOpen}
        onClose={() => setIsSlackModalOpen(false)}
        onConnectSlack={(workspace) => {
          onCreateTicket({
            subject: `Slack Connect Ticket via ${workspace}`,
            category: 'Software & Desktop',
            priority: 'Medium',
            description: `User connected workspace ${workspace} and requested assistance.`,
            channel: 'slack',
          });
        }}
      />

      <KBArticleModal
        article={activeKBArticle}
        onClose={() => setActiveKBArticle(null)}
        onOpenChatWithTopic={(topic) => {
          onOpenChat(`I need help regarding: ${topic}`);
        }}
      />

    </div>
  );
};
