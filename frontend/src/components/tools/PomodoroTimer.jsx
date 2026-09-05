import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Flame, Award } from 'lucide-react';
import { Button } from '../common/Button';
import { analyticsService } from '../../services/analyticsService';

export const PomodoroTimer = () => {
  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' | 'break'
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const totalTime = mode === 'work' ? WORK_TIME : BREAK_TIME;
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;
  const strokeDashoffset = 440 - (440 * progressPercent) / 100;

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (mode === 'work') {
        setSessionsCompleted((prev) => prev + 1);
        analyticsService.logFocusSession({ durationMinutes: 25, mode: 'work', subject: 'General' }).catch(() => {});
        setMode('break');
        setTimeLeft(BREAK_TIME);
      } else {
        setMode('work');
        setTimeLeft(WORK_TIME);
      }
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);


  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? WORK_TIME : BREAK_TIME);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(newMode === 'work' ? WORK_TIME : BREAK_TIME);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center max-w-md mx-auto shadow-2xl relative overflow-hidden backdrop-blur-2xl">
      {/* Background ambient glow behind circle */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500 ${
        mode === 'work' ? 'bg-indigo-500' : 'bg-emerald-500'
      }`} />

      {/* Mode Switcher Tabs */}
      <div className="flex justify-center gap-3 mb-8 relative z-10">
        <button
          onClick={() => switchMode('work')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
            mode === 'work'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
              : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Focus (25m)
        </button>
        <button
          onClick={() => switchMode('break')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
            mode === 'break'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
              : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Coffee className="w-4 h-4" /> Break (5m)
        </button>
      </div>

      {/* Radial Progress Timer Circle */}
      <div className="relative w-56 h-56 mx-auto my-6 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r="70"
            className="stroke-slate-200 dark:stroke-slate-800/80 fill-none"
            strokeWidth="10"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            className={`fill-none transition-all duration-500 ease-out ${
              mode === 'work' ? 'stroke-indigo-500' : 'stroke-emerald-500'
            }`}
            strokeWidth="10"
            strokeDasharray="440"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
          <span className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white font-mono drop-shadow-sm">
            {formatTime(timeLeft)}
          </span>
          <span className={`text-[10px] uppercase tracking-widest font-extrabold px-2.5 py-0.5 rounded-full ${
            mode === 'work' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
          }`}>
            {isRunning ? (mode === 'work' ? 'In Focus Mode' : 'On Break') : 'Paused'}
          </span>
        </div>
      </div>

      {/* Action Control Buttons */}
      <div className="flex justify-center items-center gap-4 my-6 relative z-10">
        <Button
          onClick={toggleTimer}
          variant={mode === 'work' ? 'primary' : 'secondary'}
          size="lg"
          className="px-8 py-3 rounded-2xl text-base shadow-xl"
        >
          {isRunning ? <Pause className="w-5 h-5 mr-1" /> : <Play className="w-5 h-5 mr-1 fill-white" />}
          {isRunning ? 'Pause' : 'Start Focus'}
        </Button>

        <button
          onClick={resetTimer}
          className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-200 active:scale-95 border border-slate-200/50 dark:border-slate-700/50"
          title="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Footer Accomplishment Streak Badge */}
      <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" /> Focus Target
        </span>
        <div className="flex items-center gap-1 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-3 py-1 rounded-full font-black">
          <Flame className="w-3.5 h-3.5 fill-indigo-400" />
          <span>{sessionsCompleted} Sessions</span>
        </div>
      </div>
    </div>
  );
};

