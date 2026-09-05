import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { User, Sun, Moon, Lock, Bell, Globe } from 'lucide-react';

export const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [reminderDaysBefore, setReminderDaysBefore] = useState(user?.reminderDaysBefore || 2);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateProfile({
      name,
      email,
      avatar,
      timezone,
      reminderDaysBefore: Number(reminderDaysBefore),
      theme,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined,
    });
    setLoading(false);

    if (res.success) {
      addToast('Settings updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } else {
      addToast(res.message || 'Failed to update settings', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">User Settings</h2>
        <p className="text-xs text-slate-500">Manage your profile, theme, and study reminder preferences.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" /> Personal Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Input label="Avatar Image URL" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
        </div>

        {/* Preferences Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-500" /> System Preferences
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Theme Mode
              </label>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-sm text-slate-900 dark:text-slate-100"
              >
                <span>Current: {theme.toUpperCase()}</span>
                {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-indigo-600" />}
              </button>
            </div>

            <Input
              label="Reminder Threshold (Days Before Exam)"
              type="number"
              value={reminderDaysBefore}
              onChange={(e) => setReminderDaysBefore(e.target.value)}
            />
          </div>
        </div>

        {/* Password Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-500" /> Change Password
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={loading} size="lg">
            Save All Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
