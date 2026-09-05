import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  GraduationCap,
  Target,
  BookOpen,
  Calendar,
  Timer,
  BarChart2,
  Sparkles,
  Bot,
  Settings,
  Flame,
  Zap,
} from 'lucide-react';

export const Sidebar = ({ isMobile = false, onItemClick }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Exams', path: '/exams', icon: GraduationCap },
    { label: 'Goals', path: '/goals', icon: Target },
    { label: 'Notes', path: '/notes', icon: BookOpen },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
    { label: 'Focus Center', path: '/focus-center', icon: Target },
    { label: 'Analytics', path: '/analytics', icon: BarChart2 },
    { label: 'AI Assistant', path: '/ai-assistant', icon: Sparkles },
    { label: 'AI Planner', path: '/ai-planner', icon: Bot },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];




  const containerClasses = isMobile
    ? 'w-full flex flex-col justify-between h-full p-4'
    : 'w-64 glass-panel border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)] sticky top-[65px]';

  return (
    <aside className={containerClasses}>
      <div className="space-y-1.5 p-2">
        <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 hover:translate-x-1'
                }`
              }
            >
              <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 m-2 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 text-center relative overflow-hidden backdrop-blur-md">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-center gap-1.5 text-amber-500 dark:text-amber-400 font-extrabold text-sm mb-1">
          <Flame className="w-5 h-5 fill-amber-500 animate-bounce" />
          <span>Daily Focus</span>
        </div>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Consistency creates mastery. Keep up the momentum!
        </p>
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/15 py-1 px-3 rounded-full">
          <Zap className="w-3.5 h-3.5" />
          <span>3 Day Streak</span>
        </div>
      </div>
    </aside>
  );
};

