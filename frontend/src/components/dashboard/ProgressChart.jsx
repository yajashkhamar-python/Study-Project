import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const ProgressChart = ({ tasksBySubject = [], completionRate = 0, weeklyActivity = [] }) => {
  const pieData = [
    { name: 'Completed', value: completionRate },
    { name: 'Remaining', value: 100 - completionRate },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
      {/* Bar Chart: Subject breakdown */}
      <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4">
          Tasks by Subject
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tasksBySubject}>
              <XAxis dataKey="subject" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} name="Total Tasks" />
              <Bar dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart: Completion Rate */}
      <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-2 w-full text-left">
          Completion Percentage
        </h4>
        <div className="h-56 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#334155" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {completionRate}%
            </span>
            <span className="text-xs text-slate-400">Done</span>
          </div>
        </div>
      </div>

      {/* Line Chart: 30-Day Activity */}
      <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4">
          30-Day Study Activity
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="completedCount"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 4 }}
                name="Tasks Completed"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
