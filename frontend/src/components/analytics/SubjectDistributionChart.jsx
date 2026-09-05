import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen } from 'lucide-react';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const SubjectDistributionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 text-center py-12">
        <BookOpen className="w-10 h-10 mx-auto text-slate-400 opacity-50 mb-2" />
        <p className="text-xs text-slate-500 font-medium">No subject study time recorded yet.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs font-bold space-y-1">
          <p className="text-indigo-400 font-extrabold">{item.subject}</p>
          <p>{item.minutes} Study Minutes ({item.percentage}%)</p>
          <p className="text-slate-400">{item.taskCount} Total Tasks</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              Subject Study Distribution
            </h3>
            <p className="text-[11px] text-slate-500">Study time percentage split by subject</p>
          </div>
        </div>
      </div>

      <div className="h-56 sm:h-60 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="minutes"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend list */}
      <div className="space-y-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 max-h-36 overflow-y-auto">
        {data.map((s, idx) => (
          <div key={s.subject} className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                {s.subject}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{s.minutes}m</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-[10px] text-indigo-500">
                {s.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
