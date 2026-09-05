import React from 'react';
import { Sparkles, BookOpen, Brain, CreditCard, Loader2 } from 'lucide-react';

export const NoteAIToolbar = ({ onAction, activeAction, loading }) => {
  const actions = [
    { id: 'summarize', label: 'Summarize', icon: Sparkles, color: 'from-purple-600 to-indigo-600' },
    { id: 'explain', label: 'Explain', icon: BookOpen, color: 'from-blue-600 to-cyan-600' },
    { id: 'quiz', label: 'Generate Quiz', icon: Brain, color: 'from-amber-600 to-orange-600' },
    { id: 'flashcards', label: 'Flashcards', icon: CreditCard, color: 'from-emerald-600 to-teal-600' },
  ];

  return (
    <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-slate-900/50 border border-purple-500/20 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" /> StudyPulse AI Tools
        </span>
        <span className="text-[10px] text-slate-400 font-bold">Powered by Gemini 3.6 Flash</span>
      </div>

      {/* Buttons Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          const isLoadingThis = loading && activeAction === act.id;

          return (
            <button
              key={act.id}
              disabled={loading}
              onClick={() => onAction(act.id)}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-black text-white shadow-md transition-all duration-200 active:scale-95 disabled:opacity-50 ${
                isLoadingThis
                  ? 'bg-slate-800 border border-slate-700'
                  : `bg-gradient-to-r ${act.color} hover:brightness-110 hover:shadow-lg`
              }`}
            >
              {isLoadingThis ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
