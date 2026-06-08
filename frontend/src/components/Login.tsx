import { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { getApiUrl } from '../utils/api';

interface LoginProps {
  onLoginSuccess: (token: string, email: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Authentication request failed.');
      }

      onLoginSuccess(data.token, data.email);
    } catch (err: any) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-600/10 to-transparent pointer-events-none"></div>

        {/* Logo / Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-600 text-white mb-3 shadow-md shadow-red-600/20 select-none">
            <LogIn size={22} />
          </div>
          <h2 className="text-xl font-serif font-extrabold text-white">
            {isLoginView ? 'Access Portal' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {isLoginView ? 'Log in to access serious tech news intelligence' : 'Register to join the tech feed community'}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="bg-slate-950/60 border border-slate-850 p-1 rounded-lg flex gap-1 mb-6">
          <button
            onClick={() => { setIsLoginView(true); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
              isLoginView 
                ? 'bg-red-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200 bg-transparent'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setIsLoginView(false); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
              !isLoginView 
                ? 'bg-red-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200 bg-transparent'
            }`}
          >
            Register
          </button>
        </div>

        {/* Errors & Success Messages */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 text-xs mb-5 animate-fade-in">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2.5 p-3.5 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-emerald-400 text-xs mb-5 animate-fade-in">
            <CheckCircle size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-red-600 rounded-lg pl-9 pr-4 py-2 text-xs outline-none transition-all placeholder:text-slate-650"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-red-600 rounded-lg pl-9 pr-4 py-2 text-xs outline-none transition-all placeholder:text-slate-650"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-80 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors shadow-md shadow-red-600/10 cursor-pointer disabled:cursor-not-allowed select-none"
          >
            {loading ? (
              <span>Connecting...</span>
            ) : isLoginView ? (
              <>
                <span>Enter Portal</span>
                <LogIn size={13} />
              </>
            ) : (
              <>
                <span>Register User</span>
                <UserPlus size={13} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
