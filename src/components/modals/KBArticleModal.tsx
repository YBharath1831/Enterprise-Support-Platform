import React from 'react';
import { KBArticle } from '../../types';
import { X, BookOpen, ThumbsUp, MessageSquare, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface KBArticleModalProps {
  article: KBArticle | null;
  onClose: () => void;
  onOpenChatWithTopic: (topicTitle: string) => void;
}

export const KBArticleModal: React.FC<KBArticleModalProps> = ({
  article,
  onClose,
  onOpenChatWithTopic,
}) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-cyan-400 flex items-center justify-center border border-blue-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                  {article.category}
                </span>
                {article.policyCode && (
                  <span className="text-[10px] font-mono text-slate-400">
                    Ref: {article.policyCode}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-base text-slate-100 line-clamp-1 mt-0.5">{article.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          
          {/* Article Summary Box */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 text-sm text-slate-800 leading-relaxed">
            <p className="font-medium text-blue-950">{article.summary}</p>
          </div>

          {/* Troubleshooting Steps */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Recommended Diagnostic & Resolution Steps</span>
            </h4>

            <div className="space-y-3">
              {article.steps.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-slate-700 leading-normal">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tags & Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-1.5">
              {article.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex items-center space-x-3 text-slate-500 font-medium">
              <span>{article.readTime}</span>
              <span>•</span>
              <span className="flex items-center space-x-1 text-slate-600">
                <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
                <span>{article.helpfulCount} people found this helpful</span>
              </span>
            </div>
          </div>

        </div>

        {/* Footer CTA */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800 flex-shrink-0">
          <div className="text-xs text-slate-300">
            <span>Did not solve your issue? Our AI support agent is online 24/7.</span>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenChatWithTopic(article.title);
            }}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-white shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition"
          >
            <MessageSquare className="w-4 h-4 text-cyan-200" />
            <span>Still need help? Chat with AI Agent</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
