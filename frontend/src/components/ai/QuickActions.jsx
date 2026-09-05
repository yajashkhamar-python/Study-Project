import React from 'react';
import { Calendar, Target, BarChart2, BookOpen, Brain } from 'lucide-react';

export const QuickActions = ({ onSelectAction }) => {
  const actions = [
    {
      id: 'plan-day',
      label: 'Plan My Day',
      icon: Calendar,
      prompt: 'Based on my current StudyPulse data, create a practical study plan for today.',
      color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 hover:border-blue-500/50',
    },
    {
      id: 'prepare-exam',
      label: 'Prepare for My Exam',
      icon: Target,
      prompt: 'Review my upcoming exams and suggest a targeted exam preparation strategy.',
      color: 'from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400 hover:border-purple-500/50',
    },
    {
      id: 'analyze-progress',
      label: 'Analyze My Progress',
      icon: BarChart2,
      prompt: 'Analyze my current study progress, task completion rate, and overdue items to give me constructive feedback.',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500/50',
    },
    {
      id: 'explain-topic',
      label: 'Explain a Topic',
      icon: BookOpen,
      prompt: 'Help me understand a key topic simply with clear examples.',
      color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:border-amber-500/50',
    },
    {
      id: 'quiz-me',
      label: 'Quiz Me',
      icon: Brain,
      prompt: 'Generate 3 quick practice quiz questions based on my subjects and upcoming exams.',
      color: 'from-rose-500/10 to-red-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 hover:border-rose-500/50',
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 my-auto py-8 px-4 animate-fadeIn">
      <div className="text-center space-y-2">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          How can I help you study today?
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Select a quick prompt or type your message below to get personalized guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onSelectAction(action.prompt)}
              className={`flex items-center gap-3.5 p-4 rounded-2xl border bg-gradient-to-r ${action.color} backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] text-left group shadow-sm`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/60 dark:bg-slate-800/60 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  {action.label}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-medium mt-0.5">
                  {action.prompt}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
