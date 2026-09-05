import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CheckSquare, ListTodo, AlertTriangle, Clock } from 'lucide-react';

export const TaskAnalyticsSection = ({ overview, taskTrend }) => {
  const statusItems = [
    { label: 'Completed', count: overview.completedTasks, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Pending', count: overview.pendingTasks, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { label: 'In Progress', count: overview.inProgressTasks || 0, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Overdue', count: overview.overdueTasks, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs font-bold space-y-1">
          <p className="text-slate-400">{label}</p>
          <p className="text-emerald-400">{payload[0].value} Tasks Completed</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              Task Completion & Status Performance
            </h3>
            <p className="text-[11px] text-slate-500">Historical task completion dates & status breakdown</p>
          </div>
        </div>
      </div>

      {/* Task Status Grid Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statusItems.map((item) => (
          <div key={item.label} className={`p-3.5 rounded-2xl border ${item.color} flex items-center justify-between`}>
            <span className="text-xs font-bold">{item.label}</span>
            <span className="text-lg font-black">{item.count}</span>
          </div>
        ))}
      </div>

      {/* Completion Trend Bar Chart */}
      <div className="space-y-2 pt-2">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Daily Task Completion Trend
        </h4>
        <div className="h-56 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completedCount" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
