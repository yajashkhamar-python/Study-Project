import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import { Loader } from '../components/common/Loader';
import { AnalyticsHeader } from '../components/analytics/AnalyticsHeader';
import { OverviewCards } from '../components/analytics/OverviewCards';
import { ProductivityScoreCard } from '../components/analytics/ProductivityScoreCard';
import { StudyTrendChart } from '../components/analytics/StudyTrendChart';
import { SubjectDistributionChart } from '../components/analytics/SubjectDistributionChart';
import { TaskAnalyticsSection } from '../components/analytics/TaskAnalyticsSection';
import { FocusAnalyticsSection } from '../components/analytics/FocusAnalyticsSection';
import { WeeklyComparisonCard } from '../components/analytics/WeeklyComparisonCard';
import { ActivityHeatmap } from '../components/analytics/ActivityHeatmap';
import { Timer, CheckSquare, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AnalyticsPage = () => {
  const [range, setRange] = useState('7days');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async (selectedRange = range) => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsService.getAnalytics(selectedRange);
      if (res.success && res.data) {
        setAnalyticsData(res.data);
      } else {
        setError('Failed to load analytics data.');
      }
    } catch (err) {
      console.error('Analytics load error:', err);
      setError(err.response?.data?.message || 'Unable to load analytics right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const handleRangeChange = (newRange) => {
    setRange(newRange);
  };

  if (loading && !analyticsData) {
    return <Loader fullScreen />;
  }

  if (error && !analyticsData) {
    return (
      <div className="glass-card p-8 rounded-3xl border border-rose-500/30 text-center max-w-md mx-auto my-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{error}</h3>
        <button
          onClick={() => fetchAnalytics()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  const {
    overview,
    productivityScore,
    studyTrend,
    taskTrend,
    subjectDistribution,
    focusAnalytics,
    weeklyComparison,
    heatmap,
  } = analyticsData;

  const hasZeroData = overview.totalTasks === 0 && overview.pomodoroSessions === 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Analytics Header & Time Filter */}
      <AnalyticsHeader activeRange={range} onRangeChange={handleRangeChange} />

      {/* Overview Stat Cards */}
      <OverviewCards overview={overview} />

      {/* Zero Data Motivating Empty State Banner */}
      {hasZeroData && (
        <div className="glass-card p-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 text-center space-y-4 my-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Timer className="w-6 h-6 animate-bounce" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Start Logging Your Focus & Study Sessions!
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Complete tasks and run Pomodoro focus sessions to automatically populate real-time study analytics.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/pomodoro"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/30"
            >
              <Timer className="w-4 h-4" /> Start Focus Session
            </Link>
            <Link
              to="/tasks"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
            >
              <CheckSquare className="w-4 h-4 text-emerald-400" /> View Tasks
            </Link>
          </div>
        </div>
      )}

      {/* Main Grid Section 1: Productivity Score & Study Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ProductivityScoreCard scoreData={productivityScore} />
        </div>
        <div className="lg:col-span-2">
          <StudyTrendChart data={studyTrend} />
        </div>
      </div>

      {/* Main Grid Section 2: Task Performance & Subject Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskAnalyticsSection overview={overview} taskTrend={taskTrend} />
        </div>
        <div className="lg:col-span-1">
          <SubjectDistributionChart data={subjectDistribution} />
        </div>
      </div>

      {/* Main Grid Section 3: Focus Analytics & Productive Day Analysis */}
      <FocusAnalyticsSection focusAnalytics={focusAnalytics} />

      {/* Main Grid Section 4: Weekly Comparison */}
      <WeeklyComparisonCard comparison={weeklyComparison} />

      {/* 12-Week Activity Heatmap Grid */}
      <ActivityHeatmap heatmapData={heatmap} />
    </div>
  );
};

export default AnalyticsPage;
