import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { StreakTracker } from '../components/dashboard/StreakTracker';
import { ProgressChart } from '../components/dashboard/ProgressChart';
import { TaskCard } from '../components/tasks/TaskCard';
import { ExamCard } from '../components/exams/ExamCard';
import { Loader } from '../components/common/Loader';
import { taskService } from '../services/taskService';
import { goalService } from '../services/goalService';
import { DashboardGoalsWidget } from '../components/goals/DashboardGoalsWidget';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, Plus, ArrowRight, Zap, Target, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';


export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, weeklyRes, tasksRes, goalsRes] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getWeeklyActivity(),
        taskService.getTasks({ limit: 4 }),
        goalService.getGoals(),
      ]);
      setStats(statsRes.data);
      setWeeklyActivity(weeklyRes.data);
      setRecentTasks(tasksRes.data);
      setGoals(goalsRes.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    loadData();
  }, []);

  const handleTaskStatusChange = async (taskId, status) => {
    try {
      await taskService.updateTaskStatus(taskId, status);
      loadData();
    } catch (err) {
      console.error('Failed status update', err);
    }
  };

  if (loading || !stats) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Dynamic Hero Welcome Card */}
      <div className="relative overflow-hidden glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/20 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 shadow-xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-indigo-400" />
              <span>Study Dashboard</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{user?.name || 'Student'}</span> 👋
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Track your learning goals, view upcoming exams, and stay on top of your study routines with real-time insights.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/tasks"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all duration-200 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add New Task
              </Link>
              <Link
                to="/pomodoro"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold text-xs transition-all duration-200 active:scale-95"
              >
                <Target className="w-4 h-4 text-purple-400" />
                Start Focus Session
              </Link>
              <Link
                to="/ai-assistant"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600/50 hover:to-pink-600/50 border border-purple-500/30 text-purple-200 font-bold text-xs transition-all duration-200 active:scale-95 shadow-md"
              >
                <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
                🤖 Ask StudyPulse AI
              </Link>
              <Link
                to="/ai-planner"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all duration-200 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-white animate-spin" />
                🤖 AI Study Planner
              </Link>

            </div>
          </div>

          <StreakTracker streak={stats.currentStreak} />
        </div>
      </div>

      {/* 🤖 AI Study Planner Banner Card */}
      <div className="glass-card p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-slate-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI Feature</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            🤖 AI Study Planner
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            Your exams and deadlines are approaching. Let StudyPulse generate an optimized study plan for you.
          </p>
        </div>
        <Link
          to="/ai-planner"
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 flex-shrink-0"
        >
          <span>Create My Study Plan</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metric Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card-hover p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4 group">
          <div className="w-13 h-13 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-300 shadow-glow">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Total Tasks</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">{stats.totalTasks}</div>
          </div>
        </div>

        <div className="glass-card-hover p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4 group">
          <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-300 shadow-glow-emerald">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Completed</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">{stats.completedTasks}</div>
          </div>
        </div>

        <div className="glass-card-hover p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4 group">
          <div className="w-13 h-13 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-300 shadow-glow-amber">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Pending</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">{stats.pendingTasks}</div>
          </div>
        </div>

        <div className="glass-card-hover p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4 group">
          <div className="w-13 h-13 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-300 shadow-glow-rose">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Overdue</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">{stats.overdueTasks}</div>
          </div>
        </div>
      </div>

      {/* Active Goals Widget */}
      <DashboardGoalsWidget goals={goals} />

      {/* Analytics Progress Charts */}
      <ProgressChart
        tasksBySubject={stats.tasksBySubject}
        completionRate={stats.completionRate}
        weeklyActivity={weeklyActivity}
      />


      {/* Recent Tasks & Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks Container */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-800/50 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-5 rounded-full bg-indigo-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  Recent Tasks
                </h3>
              </div>
              <Link to="/tasks" className="text-xs text-indigo-500 font-bold hover:text-indigo-400 flex items-center gap-1 group">
                View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {recentTasks.length === 0 ? (
              <div className="text-center py-10">
                <ListTodo className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-50" />
                <p className="text-xs text-slate-500 font-medium">No tasks found. Create your first task to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onStatusChange={handleTaskStatusChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Exams Container */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-800/50 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-5 rounded-full bg-purple-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  Upcoming Exams
                </h3>
              </div>
              <Link to="/exams" className="text-xs text-indigo-500 font-bold hover:text-indigo-400 flex items-center gap-1 group">
                Manage Exams <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {stats.upcomingExams.length === 0 ? (
              <div className="text-center py-10">
                <Clock className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-50" />
                <p className="text-xs text-slate-500 font-medium">No upcoming exams scheduled!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {stats.upcomingExams.map((exam) => (
                  <ExamCard key={exam._id} exam={exam} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

