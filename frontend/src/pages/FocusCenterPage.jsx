import React, { useState, useEffect, useRef } from 'react';
import {
  Target,
  Flame,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  BookOpen,
  Calendar as CalendarIcon,
  CheckSquare,
  AlertCircle,
  Plus,
  Minimize2,
  Maximize2,
  Award,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Check,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { taskService } from '../services/taskService';
import { analyticsService } from '../services/analyticsService';
import { useToast } from '../context/ToastContext';

export const FocusCenterPage = () => {
  const { addToast } = useToast();

  // State: Tasks & Goals Data
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // State: Selection & Setup
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCustomTask, setIsCustomTask] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customSubject, setCustomSubject] = useState('General');

  // Duration State (minutes)
  const [durationPreset, setDurationPreset] = useState(25); // 25 | 45 | 60 | 'custom'
  const [customMinutes, setCustomMinutes] = useState(30);

  // State: Active Session & Timer
  // Session Statuses: 'IDLE' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  const [sessionStatus, setSessionStatus] = useState('IDLE');
  const [activeSession, setActiveSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [distractionFree, setDistractionFree] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // State: Completion Form
  const [completionOutcome, setCompletionOutcome] = useState('completed'); // 'completed' | 'partially_completed' | 'not_completed'
  const [accomplishmentNotes, setAccomplishmentNotes] = useState('');
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [sessionSavedSuccess, setSessionSavedSuccess] = useState(false);

  // State: Daily Goal & Analytics History
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(180); // Default 3 Hours
  const [showGoalConfig, setShowGoalConfig] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const timerRef = useRef(null);

  // Load Daily Goal preference from LocalStorage
  useEffect(() => {
    const savedGoal = localStorage.getItem('study_planner_focus_goal');
    if (savedGoal) {
      setDailyGoalMinutes(parseInt(savedGoal, 10) || 180);
    }
  }, []);

  // Fetch Tasks & Analytics Data
  const fetchData = async () => {
    try {
      setLoadingTasks(true);
      setLoadingAnalytics(true);

      const [tasksRes, analyticsRes] = await Promise.all([
        taskService.getTasks().catch(() => ({ data: [] })),
        analyticsService.getAnalytics('7days').catch(() => ({ data: null })),
      ]);

      if (tasksRes.data && Array.isArray(tasksRes.data)) {
        setTasks(tasksRes.data.filter((t) => t.status !== 'completed'));
      }

      if (analyticsRes.data) {
        setAnalyticsData(analyticsRes.data);
      }
    } catch (err) {
      console.error('Error loading Focus Center data:', err);
    } finally {
      setLoadingTasks(false);
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Recover active session from LocalStorage if browser was refreshed
  useEffect(() => {
    try {
      const savedSessionRaw = localStorage.getItem('study_planner_active_focus_session');
      if (savedSessionRaw) {
        const savedSession = JSON.parse(savedSessionRaw);
        if (savedSession && savedSession.status === 'ACTIVE' && savedSession.startedAt) {
          const elapsedSecs = Math.floor((Date.now() - savedSession.startedAt) / 1000) - (savedSession.pausedSecs || 0);
          const totalSecs = savedSession.targetMinutes * 60;
          const remainingSecs = totalSecs - elapsedSecs;

          if (remainingSecs > 0) {
            setActiveSession(savedSession);
            setSessionStatus('ACTIVE');
            setTimeLeft(remainingSecs);
          } else {
            // Timer expired while page was closed
            setActiveSession(savedSession);
            setSessionStatus('COMPLETED');
            setTimeLeft(0);
            setShowCompletionModal(true);
          }
        }
      }
    } catch (e) {
      console.error('Error recovering active focus session:', e);
    }
  }, []);

  // Timer Tick Effect (Timestamp-based accuracy to prevent drift)
  useEffect(() => {
    if (sessionStatus === 'ACTIVE') {
      timerRef.current = setInterval(() => {
        if (!activeSession) return;

        const totalSecs = activeSession.targetMinutes * 60;
        const now = Date.now();
        const elapsedSecs = Math.floor((now - activeSession.startedAt) / 1000) - (activeSession.pausedSecs || 0);
        const remaining = totalSecs - elapsedSecs;

        if (remaining <= 0) {
          clearInterval(timerRef.current);
          setTimeLeft(0);
          setSessionStatus('COMPLETED');
          setShowCompletionModal(true);
          localStorage.removeItem('study_planner_active_focus_session');
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionStatus, activeSession]);

  // Selected duration calculation
  const getSelectedMinutes = () => {
    if (durationPreset === 'custom') {
      const mins = parseInt(customMinutes, 10);
      if (isNaN(mins) || mins < 5) return 5;
      if (mins > 180) return 180;
      return mins;
    }
    return durationPreset;
  };

  // Start Session Handler
  const handleStartSession = () => {
    let title = 'General Focus Session';
    let subject = 'General';
    let taskId = null;

    if (isCustomTask) {
      if (!customTitle.trim()) {
        addToast('Please enter what you want to work on.', 'error');
        return;
      }
      title = customTitle.trim();
      subject = customSubject.trim() || 'General';
    } else if (selectedTask) {
      title = selectedTask.title;
      subject = selectedTask.subject || 'General';
      taskId = selectedTask._id;
    } else {
      addToast('Please select a task or enter custom focus topic.', 'error');
      return;
    }

    const duration = getSelectedMinutes();
    const sessionObj = {
      id: `focus-${Date.now()}`,
      title,
      subject,
      taskId,
      targetMinutes: duration,
      startedAt: Date.now(),
      pausedSecs: 0,
      status: 'ACTIVE',
      taskObj: selectedTask,
    };

    setActiveSession(sessionObj);
    setSessionStatus('ACTIVE');
    setTimeLeft(duration * 60);
    setSessionSavedSuccess(false);

    localStorage.setItem('study_planner_active_focus_session', JSON.stringify(sessionObj));
    addToast(`Focus session started for ${duration} mins! 🚀`, 'success');
  };

  // Pause Timer
  const handlePauseSession = () => {
    if (sessionStatus === 'ACTIVE') {
      setSessionStatus('PAUSED');
      if (activeSession) {
        activeSession.pausedAt = Date.now();
        localStorage.setItem('study_planner_active_focus_session', JSON.stringify(activeSession));
      }
    }
  };

  // Resume Timer
  const handleResumeSession = () => {
    if (sessionStatus === 'PAUSED' && activeSession) {
      if (activeSession.pausedAt) {
        const addedPausedSecs = Math.floor((Date.now() - activeSession.pausedAt) / 1000);
        activeSession.pausedSecs = (activeSession.pausedSecs || 0) + addedPausedSecs;
        delete activeSession.pausedAt;
      }
      setSessionStatus('ACTIVE');
      localStorage.setItem('study_planner_active_focus_session', JSON.stringify(activeSession));
    }
  };

  // Complete Early or On Timer End
  const handleTriggerCompletion = () => {
    setSessionStatus('COMPLETED');
    setShowCompletionModal(true);
    if (timerRef.current) clearInterval(timerRef.current);
    localStorage.removeItem('study_planner_active_focus_session');
  };

  // Cancel / End Session
  const handleConfirmCancelSession = async () => {
    const elapsedMinutes = activeSession
      ? Math.max(1, Math.floor(((activeSession.targetMinutes * 60) - timeLeft) / 60))
      : 0;

    // Log as cancelled session if elapsed > 1 minute
    if (activeSession && elapsedMinutes >= 1) {
      try {
        await analyticsService.logFocusSession({
          durationMinutes: activeSession.targetMinutes,
          actualDurationMinutes: elapsedMinutes,
          mode: 'work',
          subject: activeSession.subject,
          taskId: activeSession.taskId,
          title: activeSession.title,
          completionStatus: 'cancelled',
          accomplishment: 'Session ended early.',
        });
      } catch (e) {}
    }

    setSessionStatus('IDLE');
    setActiveSession(null);
    setShowCancelModal(false);
    setDistractionFree(false);
    localStorage.removeItem('study_planner_active_focus_session');
    addToast('Focus session ended.', 'info');
    fetchData();
  };

  // Save Completed Focus Session
  const handleSaveCompletedSession = async () => {
    if (!activeSession || isSavingSession || sessionSavedSuccess) return;

    setIsSavingSession(true);
    try {
      const elapsedMinutes = Math.max(
        1,
        Math.floor(((activeSession.targetMinutes * 60) - timeLeft) / 60)
      );

      await analyticsService.logFocusSession({
        durationMinutes: activeSession.targetMinutes,
        actualDurationMinutes: elapsedMinutes,
        mode: 'work',
        subject: activeSession.subject,
        taskId: activeSession.taskId,
        title: activeSession.title,
        completionStatus: completionOutcome,
        accomplishment: accomplishmentNotes.trim(),
      });

      setSessionSavedSuccess(true);
      addToast('Focus session logged successfully! 🎉', 'success');
      fetchData();
    } catch (err) {
      console.error('Failed to save focus session:', err);
      addToast('Failed to save session. Please try again.', 'error');
    } finally {
      setIsSavingSession(false);
    }
  };

  // Mark Linked Task Complete
  const handleMarkTaskComplete = async () => {
    if (!activeSession?.taskId) return;
    try {
      await taskService.updateTaskStatus(activeSession.taskId, 'completed');
      addToast('Linked task marked as completed! ✅', 'success');
      fetchData();
    } catch (err) {
      addToast('Failed to update task status.', 'error');
    }
  };

  // Reset to Start New Focus Session
  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
    setSessionStatus('IDLE');
    setActiveSession(null);
    setAccomplishmentNotes('');
    setCompletionOutcome('completed');
    setDistractionFree(false);
  };

  // Update Daily Goal Preference
  const handleSaveGoal = (newMins) => {
    const parsed = parseInt(newMins, 10);
    if (!isNaN(parsed) && parsed >= 30 && parsed <= 720) {
      setDailyGoalMinutes(parsed);
      localStorage.setItem('study_planner_focus_goal', parsed.toString());
      setShowGoalConfig(false);
      addToast(`Daily focus goal updated to ${Math.round(parsed / 60 * 10) / 10} hours!`, 'success');
    }
  };

  // Helper formatting: seconds -> MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate Metrics from Analytics Data
  const focusTodayMins = analyticsData?.data?.focusAnalytics?.focusTimeTodayMins || 0;
  const currentStreak = analyticsData?.data?.overview?.currentStreak || 0;
  const longestStreak = analyticsData?.data?.overview?.longestStreak || currentStreak;
  const goalHours = (dailyGoalMinutes / 60).toFixed(1);
  const focusTodayHours = (focusTodayMins / 60).toFixed(1);
  const progressPct = Math.min(100, Math.round((focusTodayMins / dailyGoalMinutes) * 100));
  const remainingMins = Math.max(0, dailyGoalMinutes - focusTodayMins);

  const subjectStats = analyticsData?.data?.subjectDistribution || [];
  const weekdayBreakdown = analyticsData?.data?.focusAnalytics?.weekdayBreakdown || [];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 p-6 sm:p-8 rounded-3xl border border-indigo-500/20 shadow-xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Target className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Focus Center</h1>
          </div>
          <p className="text-sm font-medium text-slate-300">
            Turn your study time into measurable, distraction-free progress.
          </p>
        </div>

        {/* Daily Goal Quick Info */}
        <div className="flex items-center gap-4 relative z-10 self-start md:self-auto">
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Focus Streak</div>
              <div className="text-base font-black text-white">{currentStreak} Day Streak <span className="text-xs text-slate-400 font-normal">(Best: {longestStreak}d)</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Focus Overview Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Today's Progress</span>
            <h3 className="text-2xl font-black text-white mt-0.5">
              {focusTodayHours}h / {goalHours}h Target
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">
              {remainingMins > 0 ? `${remainingMins} mins remaining` : '🎉 Daily Goal Reached!'}
            </span>
            <button
              onClick={() => setShowGoalConfig(!showGoalConfig)}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20 transition"
            >
              Change Goal
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-4 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500 shadow-md"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Goal Configuration Modal Dropdown */}
        {showGoalConfig && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 flex items-center justify-between gap-4 animate-fadeIn">
            <span className="text-xs font-bold text-slate-300">Select Daily Target Focus Time:</span>
            <div className="flex items-center gap-2">
              {[120, 180, 240, 300].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSaveGoal(mins)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    dailyGoalMinutes === mins
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {mins / 60}h
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Focus Control & Setup Section */}
      {sessionStatus === 'IDLE' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Setup Form */}
          <div className="lg:col-span-2 space-y-6 glass-card p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl">
            {/* Step 1: Select Work Target */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-indigo-400" /> What do you want to work on?
                </h4>
                <button
                  onClick={() => {
                    setIsCustomTask(!isCustomTask);
                    setSelectedTask(null);
                  }}
                  className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isCustomTask ? 'Select Existing Task' : 'Focus on Something Else'}
                </button>
              </div>

              {isCustomTask ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Focus Title / Topic</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. DBMS — Normalization"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Subject</label>
                    <input
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {loadingTasks ? (
                    <div className="p-6 text-center text-xs text-slate-500 font-medium">Loading active tasks...</div>
                  ) : tasks.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                      <p className="text-xs font-medium text-slate-400">No active pending tasks found.</p>
                      <button
                        onClick={() => setIsCustomTask(true)}
                        className="mt-2 text-xs font-bold text-indigo-400 underline"
                      >
                        Create Custom Focus Topic
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {tasks.map((task) => {
                        const isSelected = selectedTask?._id === task._id;
                        return (
                          <div
                            key={task._id}
                            onClick={() => setSelectedTask(task)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                              isSelected
                                ? 'bg-indigo-600/15 border-indigo-500 shadow-lg scale-[1.01]'
                                : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{task.title}</span>
                                {task.subject && (
                                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300">
                                    {task.subject}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span>Priority: <strong className="text-amber-400 uppercase text-[10px]">{task.priority || 'medium'}</strong></span>
                                {task.dueDate && (
                                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isSelected ? (
                                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                                  <Check className="w-4 h-4" /> Selected
                                </span>
                              ) : (
                                <button className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800">
                                  Focus
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Duration Selector */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" /> How long?
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[25, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDurationPreset(mins)}
                    className={`py-3 px-4 rounded-2xl font-black text-sm transition-all duration-200 ${
                      durationPreset === mins
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
                <button
                  onClick={() => setDurationPreset('custom')}
                  className={`py-3 px-4 rounded-2xl font-black text-sm transition-all duration-200 ${
                    durationPreset === 'custom'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Custom
                </button>
              </div>

              {durationPreset === 'custom' && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3 animate-fadeIn">
                  <span className="text-xs font-bold text-slate-400">Duration (5 - 180 mins):</span>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(5, Math.min(180, parseInt(e.target.value, 10) || 5)))}
                    className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm font-bold text-white text-center focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-500 font-medium">minutes</span>
                </div>
              )}
            </div>

            {/* Start Focus Session Action */}
            <div className="pt-4 border-t border-slate-800">
              <Button
                onClick={handleStartSession}
                variant="primary"
                size="lg"
                className="w-full py-4 text-base font-black tracking-wide shadow-xl shadow-indigo-500/25"
              >
                <Play className="w-5 h-5 mr-2 fill-white" />
                <span>START FOCUS SESSION</span>
              </Button>
            </div>
          </div>

          {/* Right 1 Col: Quick Tips & Streak Info */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-black text-sm">
                <Sparkles className="w-4 h-4" /> Focus Engine Best Practices
              </div>
              <ul className="text-xs text-slate-300 space-y-2.5 font-medium leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span><strong>One Task Focus:</strong> Work exclusively on your selected item without tab switching.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span><strong>Distraction-Free Mode:</strong> Turn on full-screen timer to eliminate visual clutter.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span><strong>Measure Progress:</strong> Every saved session immediately feeds into your Analytics & Streak!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Active / Paused Focus Session View */
        <div className={`glass-card p-8 sm:p-12 rounded-3xl border border-slate-800/80 text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden backdrop-blur-2xl ${
          distractionFree ? 'fixed inset-0 z-50 rounded-none bg-slate-950 flex flex-col justify-center items-center p-6' : ''
        }`}>
          {/* Ambient Glow Background */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500 ${
            sessionStatus === 'ACTIVE' ? 'bg-indigo-500' : 'bg-amber-500'
          }`} />

          {/* Header Controls */}
          <div className="flex items-center justify-between w-full mb-6 relative z-10">
            <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              🎯 CURRENT FOCUS SESSION
            </span>

            <button
              onClick={() => setDistractionFree(!distractionFree)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white transition"
            >
              {distractionFree ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span>{distractionFree ? 'Exit Focus Mode' : 'Distraction Free'}</span>
            </button>
          </div>

          {/* Title & Subject Display */}
          <div className="space-y-2 relative z-10 mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {activeSession?.title}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-slate-800 text-indigo-300">
                {activeSession?.subject}
              </span>
            </div>
          </div>

          {/* Radial Timer Ring */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto my-4 flex items-center justify-center relative z-10">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" className="stroke-slate-800 fill-none" strokeWidth="8" />
              <circle
                cx="80"
                cy="80"
                r="70"
                className={`fill-none transition-all duration-1000 ease-linear ${
                  sessionStatus === 'ACTIVE' ? 'stroke-indigo-500' : 'stroke-amber-500'
                }`}
                strokeWidth="8"
                strokeDasharray="440"
                strokeDashoffset={440 - (440 * ((activeSession?.targetMinutes * 60 - timeLeft) / (activeSession?.targetMinutes * 60)))}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
              <span className="text-5xl sm:text-6xl font-black tracking-tighter text-white font-mono drop-shadow-md">
                {formatTime(timeLeft)}
              </span>
              <span className={`text-[11px] uppercase tracking-widest font-extrabold px-3 py-0.5 rounded-full ${
                sessionStatus === 'ACTIVE' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'
              }`}>
                {sessionStatus === 'ACTIVE' ? 'In Focus Mode' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center justify-center gap-4 my-8 relative z-10">
            {sessionStatus === 'ACTIVE' ? (
              <Button onClick={handlePauseSession} variant="secondary" size="lg" className="px-8 py-3.5 rounded-2xl font-bold">
                <Pause className="w-5 h-5 mr-2" /> Pause
              </Button>
            ) : (
              <Button onClick={handleResumeSession} variant="primary" size="lg" className="px-8 py-3.5 rounded-2xl font-bold">
                <Play className="w-5 h-5 mr-2 fill-white" /> Resume
              </Button>
            )}

            <Button onClick={handleTriggerCompletion} variant="primary" size="lg" className="px-8 py-3.5 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-500">
              <CheckCircle2 className="w-5 h-5 mr-2" /> Complete
            </Button>

            <button
              onClick={() => setShowCancelModal(true)}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
              title="End Session"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* History & Subject Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6 border-t border-slate-800/80">
        {/* Left 2 Cols: Subject Breakdown & Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-xl space-y-6">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" /> Subject Focus Distribution
            </h3>

            {subjectStats.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
                <Target className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-400">Start your first Focus Session</p>
                <p className="text-[11px] text-slate-500 mt-1">Your focused study time by subject will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {subjectStats.map((sub) => (
                  <div key={sub.subject} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-200">{sub.subject}</span>
                      <span className="text-slate-400">{(sub.minutes / 60).toFixed(1)} hrs ({sub.percentage}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${sub.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Focus Bar Chart */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-xl space-y-6">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" /> Weekly Focus Activity
            </h3>

            <div className="grid grid-cols-7 gap-2 items-end h-40 pt-4 px-2">
              {weekdayBreakdown.map((wd) => {
                const maxMins = 240;
                const barPct = Math.min(100, Math.round((wd.totalMinutes / maxMins) * 100));
                return (
                  <div key={wd.day} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition">
                      {Math.round(wd.totalMinutes)}m
                    </span>
                    <div className="w-full max-w-[28px] bg-slate-900 rounded-t-xl h-full flex items-end overflow-hidden p-0.5">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg transition-all duration-500"
                        style={{ height: `${Math.max(8, barPct)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-400">{wd.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Focus Sessions */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-xl space-y-4">
          <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" /> Recent Focus Sessions
          </h3>

          {analyticsData?.data?.overview?.pomodoroSessions === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400">No sessions recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(analyticsData?.data?.focusAnalytics?.weekdayBreakdown || []).slice(0, 5).map((s, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">Focus Session ({s.day})</div>
                    <div className="text-[11px] text-slate-400">{s.sessionCount} sessions completed</div>
                  </div>
                  <span className="font-mono font-bold text-indigo-400">{s.totalMinutes} mins</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 animate-scaleUp">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white">🎉 FOCUS SESSION COMPLETE!</h3>
              <p className="text-xs text-slate-400 font-medium">
                {activeSession?.title} ({activeSession?.targetMinutes} minutes focused)
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">How did your session go?</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'completed', label: 'Completed' },
                    { key: 'partially_completed', label: 'Partially' },
                    { key: 'not_completed', label: 'Incomplete' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setCompletionOutcome(item.key)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                        completionOutcome === item.key
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">What did you accomplish?</label>
                <textarea
                  rows="3"
                  value={accomplishmentNotes}
                  onChange={(e) => setAccomplishmentNotes(e.target.value)}
                  placeholder="e.g. Completed Chapter 4 exercises and reviewed Dijkstra algorithm..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Linked Task Action */}
              {activeSession?.taskId && (
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-bold truncate max-w-[200px]">
                    Task: {activeSession?.title}
                  </span>
                  <button
                    onClick={handleMarkTaskComplete}
                    className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl transition"
                  >
                    Mark Task Complete
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSaveCompletedSession}
                  loading={isSavingSession}
                  disabled={sessionSavedSuccess}
                  variant="primary"
                  className="w-full py-3 font-bold"
                >
                  {sessionSavedSuccess ? '✓ Saved to Database' : 'Save Session'}
                </Button>
                <Button onClick={handleCloseCompletionModal} variant="secondary" className="py-3 font-bold">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-sm w-full p-6 rounded-3xl border border-slate-800 shadow-2xl text-center space-y-4">
            <h4 className="text-lg font-black text-white">End this session?</h4>
            <p className="text-xs text-slate-400">Your current focus time will be ended and recorded as cancelled.</p>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => setShowCancelModal(false)} variant="secondary" className="w-full py-2.5 font-bold">
                Continue Session
              </Button>
              <Button onClick={handleConfirmCancelSession} className="w-full py-2.5 font-bold bg-rose-600 hover:bg-rose-500 text-white">
                End Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
