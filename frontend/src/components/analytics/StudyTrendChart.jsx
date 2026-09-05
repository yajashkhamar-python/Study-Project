import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Clock, TrendingUp } from 'lucide-react';

export const StudyTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 text-center py-12">
        <Clock className="w-10 h-10 mx-auto text-slate-400 opacity-50 mb-2" />
        <p className="text-xs text-slate-500 font-medium">No study trend data recorded for this time range.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const mins = payload[0].payload.minutes;
      const hrs = payload[0].payload.hours;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs font-bold space-y-1">
          <p className="text-slate-400">{label}</p>
          <p className="text-indigo-400">{mins} Mins ({hrs} Hours) Focused</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              Study & Focus Hours Trend
            </h3>
            <p className="text-[11px] text-slate-500">Daily logged focus minutes over time</p>
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="studyHoursGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit="m"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#studyHoursGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
