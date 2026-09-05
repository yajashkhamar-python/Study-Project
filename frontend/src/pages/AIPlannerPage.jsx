import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  RefreshCw,
  Trash2,
  AlertCircle,
  BookOpen,
  Brain,
  FileText,
  Target,
  Trophy,
  ArrowRight,
  Sliders,
  Check,
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { taskService } from '../services/taskService';
import { useToast } from '../context/ToastContext';

const FOCUS_OPTIONS = [
  { id: 'exams', label: 'Upcoming Exams' },
  { id: 'tasks', label: 'Pending Tasks' },
  { id: 'goals', label: 'Goals' },
  { id: 'weakSubjects', label: 'Weak Subjects' },
  { id: 'revision', label: 'Revision' },
  { id: 'practice', label: 'Practice' },
];

const TIME_PRESETS = [
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: '4 hours', value: 240 },
  { label: 'Custom', value: 'custom' },
];

const DAY_PRESETS = [3, 7, 14, 30];

const SESSION_TYPE_CONFIG = {
  'exam-prep': { label: 'Exam Prep', icon: Target, bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  practice: { label: 'Practice', icon: Brain, bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  revision: { label: 'Revision', icon: BookOpen, bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  assignment: { label: 'Assignment', icon: FileText, bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  goal: { label: 'Goal', icon: Trophy, bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  reading: { label: 'Reading', icon: BookOpen, bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
};

export const AIPlannerPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast() || {};
  const showToast = (msg, type) => {
    if (typeof addToast === 'function') {
      addToast(msg, type);
    }
  };

  // Configuration state
  const [selectedTimePreset, setSelectedTimePreset] = useState(120);
  const [customMinutes, setCustomMinutes] = useState(120);
  const [planningDays, setPlanningDays] = useState(7);
  const [selectedFocus, setSelectedFocus] = useState(['exams', 'tasks', 'weakSubjects']);

  // UI Flow state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isAddedToCalendar, setIsAddedToCalendar] = useState(false);
  const [addingToCalendar, setAddingToCalendar] = useState(false);

  // Focus checkbox toggle
  const toggleFocus = (id) => {
    if (selectedFocus.includes(id)) {
      if (selectedFocus.length > 1) {
        setSelectedFocus(selectedFocus.filter((item) => item !== id));
      } else {
        showToast('Please select at least one focus area.', 'info');
      }
    } else {
      setSelectedFocus([...selectedFocus, id]);
    }
  };

  // Get active daily study minutes
  const getActiveDailyMinutes = () => {
    if (selectedTimePreset === 'custom') {
      const val = parseInt(customMinutes, 10);
      if (isNaN(val) || val < 15) return 15;
      if (val > 720) return 720;
      return val;
    }
    return selectedTimePreset;
  };

  // Handle plan generation call
  const handleGenerate = async () => {
    const minutes = getActiveDailyMinutes();
    setError(null);
    setLoading(true);
    setLoadingStep(0);
    setIsApproved(false);
    setIsAddedToCalendar(false);

    // Visual step sequence for user feedback
    const stepsInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 600);

    try {
      const res = await aiService.generateStudyPlan({
        dailyMinutes: minutes,
        days: planningDays,
        focus: selectedFocus,
      });

      clearInterval(stepsInterval);

      if (res && res.success && res.plan && Array.isArray(res.plan.days)) {
        setGeneratedPlan(res.plan);
        showToast('AI Study Plan generated successfully!', 'success');
      } else {
        throw new Error(res?.message || 'Invalid plan response format.');
      }
    } catch (err) {
      clearInterval(stepsInterval);
      console.error('Plan Generation Error:', err);
      setError(err.message || 'Unable to generate your study plan right now.');
      showToast('Plan generation failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Remove session from preview plan
  const handleRemoveSession = (dayIdx, sessionIdx) => {
    if (!generatedPlan) return;
    const newDays = [...generatedPlan.days];
    newDays[dayIdx].sessions.splice(sessionIdx, 1);
    setGeneratedPlan({ ...generatedPlan, days: newDays });
    showToast('Session removed from draft plan.', 'info');
  };

  // Edit duration of a session
  const handleDurationChange = (dayIdx, sessionIdx, newMins) => {
    if (!generatedPlan) return;
    const mins = Math.max(10, Math.min(360, parseInt(newMins, 10) || 15));
    const newDays = [...generatedPlan.days];
    newDays[dayIdx].sessions[sessionIdx].durationMinutes = mins;
    setGeneratedPlan({ ...generatedPlan, days: newDays });
  };

  // Handle Plan Approval
  const handleApprovePlan = () => {
    setIsApproved(true);
    showToast('Study Plan approved! You can now add it to your Calendar.', 'success');
  };

  // Handle Adding Approved Plan to Calendar
  const handleAddToCalendar = async () => {
    if (!generatedPlan || isAddedToCalendar) return;

    setAddingToCalendar(true);
    try {
      let createdCount = 0;
      for (const day of generatedPlan.days) {
        for (const session of day.sessions) {
          const taskData = {
            title: `📘 ${session.title}`,
            subject: session.subject || 'General',
            dueDate: new Date(day.date),
            estimatedMinutes: session.durationMinutes || 45,
            priority: session.type === 'exam-prep' ? 'high' : 'medium',
            description: `AI Study Plan session (${session.type.toUpperCase()}). Reason: ${session.reason}`,
            tags: ['AI Plan', session.type],
          };
          await taskService.createTask(taskData);
          createdCount++;
        }
      }

      setIsAddedToCalendar(true);
      showToast(`Successfully added ${createdCount} study sessions to your Calendar!`, 'success');
    } catch (err) {
      console.error('Error adding plan to calendar:', err);
      showToast('Failed to add plan to Calendar. Please try again.', 'error');
    } finally {
      setAddingToCalendar(false);
    }
  };

  // Render Format Date nicely
  const formatDateDisplay = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return {
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        dayMonth: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      };
    } catch (e) {
      return { weekday: 'DAY', dayMonth: dateStr };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="relative glass-panel p-6 sm:p-8 rounded-3xl overflow-hidden border border-indigo-500/20 shadow-xl bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-slate-900/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs tracking-wide uppercase">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Smart Study AI</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              🤖 AI Study Planner
            </h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl font-medium text-sm sm:text-base">
              Let StudyPulse create a personalized study plan based on your exams, tasks, goals and study performance.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
          <Sliders className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Planning Preferences</h2>
        </div>

        {/* 1. Daily Study Time */}
        <div className="space-y-3">
          <label className="text-sm font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>How much time can you study daily?</span>
          </label>
          <div className="flex flex-wrap gap-2.5">
            {TIME_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setSelectedTimePreset(preset.value)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  selectedTimePreset === preset.value
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-[1.03]'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/80'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {selectedTimePreset === 'custom' && (
            <div className="mt-3 flex items-center gap-3 animate-slideDown">
              <input
                type="number"
                min="15"
                max="720"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                className="w-36 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Minutes"
              />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                minutes per day (15 min - 12 hours)
              </span>
            </div>
          )}
        </div>

        {/* 2. Planning Period */}
        <div className="space-y-3">
          <label className="text-sm font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-purple-500" />
            <span>Planning period:</span>
          </label>
          <div className="flex flex-wrap gap-2.5">
            {DAY_PRESETS.map((days) => (
              <button
                key={days}
                onClick={() => setPlanningDays(days)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  planningDays === days
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-[1.03]'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/80'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* 3. Focus Priorities */}
        <div className="space-y-3">
          <label className="text-sm font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-500" />
            <span>Focus priorities:</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FOCUS_OPTIONS.map((opt) => {
              const checked = selectedFocus.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleFocus(opt.id)}
                  type="button"
                  className={`flex items-center gap-3 p-3 rounded-2xl border text-xs sm:text-sm font-bold text-left transition-all ${
                    checked
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-300'
                      : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                      checked
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-base shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>{loading ? 'Generating Plan...' : '✨ Generate Study Plan'}</span>
          </button>
        </div>
      </div>

      {/* Loading Animation Card */}
      {loading && (
        <div className="glass-panel p-8 rounded-3xl border border-indigo-500/30 text-center space-y-6 animate-pulse">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              🤖 StudyPulse AI is planning...
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Analyzing your actual workspace context
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-2 text-left bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
            {[
              'Exams & Deadlines',
              'Tasks & Overdue Items',
              'Active Goals & Milestones',
              'Study Performance & Weaknesses',
              'Calendar & Time Availability',
            ].map((label, idx) => (
              <div key={label} className="flex items-center gap-3 text-xs font-bold">
                <CheckCircle2
                  className={`w-4 h-4 transition-colors ${
                    loadingStep >= idx ? 'text-emerald-400' : 'text-slate-700'
                  }`}
                />
                <span className={loadingStep >= idx ? 'text-slate-200' : 'text-slate-600'}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs font-semibold text-indigo-400">Creating your personalized plan...</p>
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-bold text-sm sm:text-base">Unable to generate your study plan right now.</h4>
            <p className="text-xs sm:text-sm font-medium opacity-90">{error}</p>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Generated Study Plan Display */}
      {generatedPlan && !loading && (
        <div className="space-y-6 animate-fadeIn">
          {/* Plan Header Info */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                <span>Personalized Plan</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                YOUR PERSONALIZED STUDY PLAN
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Generated for {generatedPlan.days.length} days • Available: {getActiveDailyMinutes()} mins/day
              </p>
            </div>

            {/* Status Badges */}
            <div className="flex items-center gap-2">
              {isApproved && (
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-extrabold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approved</span>
                </span>
              )}
              {isAddedToCalendar && (
                <span className="px-3.5 py-1.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-extrabold flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Added to Calendar</span>
                </span>
              )}
            </div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {generatedPlan.days.map((day, dayIdx) => {
              const dateInfo = formatDateDisplay(day.date);
              const totalMins = day.sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

              return (
                <div
                  key={day.date + dayIdx}
                  className="glass-panel p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between space-y-4 hover:border-indigo-500/30 transition-all duration-200"
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {dateInfo.weekday}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {dateInfo.dayMonth}
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs">
                      {totalMins} min
                    </span>
                  </div>

                  {/* Sessions List */}
                  <div className="space-y-3 flex-1">
                    {day.sessions.length === 0 ? (
                      <p className="text-xs font-medium text-slate-400 italic py-4 text-center">
                        No sessions scheduled for this day
                      </p>
                    ) : (
                      day.sessions.map((session, sessionIdx) => {
                        const typeConfig = SESSION_TYPE_CONFIG[session.type] || SESSION_TYPE_CONFIG.revision;
                        const TypeIcon = typeConfig.icon;

                        return (
                          <div
                            key={session.id || sessionIdx}
                            className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-2 relative group"
                          >
                            {/* Session Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-1 rounded-xl border font-black text-[10px] uppercase flex items-center gap-1 ${typeConfig.bg}`}
                                >
                                  <TypeIcon className="w-3 h-3" />
                                  <span>{typeConfig.label}</span>
                                </span>
                                <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">
                                  {session.subject}
                                </span>
                              </div>

                              {/* Remove Session button */}
                              <button
                                onClick={() => handleRemoveSession(dayIdx, sessionIdx)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                title="Remove session"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Session Title */}
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                              {session.title}
                            </h4>

                            {/* Duration & Reason */}
                            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-bold">
                                <Clock className="w-3.5 h-3.5" />
                                <input
                                  type="number"
                                  min="10"
                                  max="300"
                                  value={session.durationMinutes}
                                  onChange={(e) =>
                                    handleDurationChange(dayIdx, sessionIdx, e.target.value)
                                  }
                                  className="w-12 bg-transparent text-slate-900 dark:text-white font-black underline text-right"
                                />
                                <span>min</span>
                              </div>
                            </div>

                            {/* Session Reason */}
                            {session.reason && (
                              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200/30 dark:border-slate-800/30">
                                💡 {session.reason}
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Bar Footer */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={handleGenerate}
              className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>🔄 Regenerate</span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              {!isApproved ? (
                <button
                  onClick={handleApprovePlan}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ Approve Plan</span>
                </button>
              ) : (
                <>
                  {!isAddedToCalendar ? (
                    <button
                      onClick={handleAddToCalendar}
                      disabled={addingToCalendar}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        {addingToCalendar ? 'Adding to Calendar...' : '📅 Add to Calendar'}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/calendar')}
                      className="px-8 py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-500/25 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      <span>View Calendar</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPlannerPage;
