import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { User, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await register({ name, email, password });
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background ambient glowing orbs */}
      <div className="ambient-glow ambient-glow-indigo opacity-30" />
      <div className="ambient-glow ambient-glow-purple opacity-30" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6 relative z-10 animate-scaleUp">
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/40 animate-pulse-slow">
              S
            </div>
            <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white">Create Account</h2>
          <p className="text-xs text-slate-400 font-medium">Join StudyPulse and organize your studies</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Smith"
            required
          />

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@university.edu"
            required
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            required
          />

          <Button type="submit" loading={loading} className="w-full py-3 mt-2 font-bold text-sm shadow-xl" size="lg">
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="pt-2 text-center text-xs font-semibold text-slate-400 border-t border-slate-800/60">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300 hover:underline transition">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

