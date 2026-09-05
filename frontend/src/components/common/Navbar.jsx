import React, { useState } from 'react';
import { Sun, Moon, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationDropdown } from '../notifications/NotificationBell';

export const Navbar = ({ toggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {toggleMobileSidebar && (
            <button
              onClick={toggleMobileSidebar}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 md:hidden transition-all duration-200"
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                S
              </div>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                StudyPulse
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 hidden sm:block">
                Academic Planner
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <NotificationDropdown />

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-200 active:scale-95 shadow-sm"
            title="Toggle theme"
            aria-label="Toggle dark/light theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                  alt={user.name}
                  className="w-7 h-7 rounded-xl object-cover ring-2 ring-indigo-500/40"
                />
                <span className="hidden md:inline text-xs font-bold text-slate-700 dark:text-slate-200">
                  {user.name}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-200 active:scale-95"
                title="Logout"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

