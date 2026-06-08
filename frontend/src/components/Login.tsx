import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
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

      if (!isLoginView) {
        // If registered successfully, show message and auto toggle to login view after 1.5s
        setSuccessMsg('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          setIsLoginView(true);
          setSuccessMsg(null);
          setPassword('');
        }, 1500);
      } else {
        onLoginSuccess(data.token, data.email);
      }
    } catch (err: any) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="google-login-container min-h-[calc(100vh-120px)] flex flex-col justify-between items-center w-full animate-fade-in font-sans">
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="google-card">
          {/* Logo */}
          <div className="text-center mb-6 flex flex-col items-center">
            <h1 className="text-2xl font-semibold tracking-tight mb-2 select-none">
              <span className="text-[#4285F4]">m</span>
              <span className="text-[#EA4335]">y</span>
              <span className="text-[#FBBC05]">T</span>
              <span className="text-[#34A853]">e</span>
              <span className="text-[#4285F4]">c</span>
              <span className="text-[#EA4335]">h</span>
              <span className="text-[#34A853]">N</span>
              <span className="text-[#FBBC05]">e</span>
              <span className="text-[#4285F4]">w</span>
              <span className="text-[#EA4335]">s</span>
            </h1>
            <h2 className="text-2xl font-normal text-[var(--text-primary)] mt-1.5">
              {isLoginView ? 'Sign in' : 'Create account'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              to continue to myTechNews
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 justify-between mt-4">
            <div className="flex flex-col gap-1">
              
              {/* Errors & Success Messages */}
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-xs mb-4 animate-fade-in">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 text-xs mb-4 animate-fade-in">
                  <CheckCircle size={15} className="shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="google-input-group">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="google-input"
                  placeholder=" "
                  required
                  disabled={loading}
                  autoComplete="email"
                />
                <label htmlFor="email" className="google-label">
                  Email address
                </label>
              </div>

              {/* Password Input */}
              <div className="google-input-group">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="google-input"
                  placeholder=" "
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <label htmlFor="password" className="google-label">
                  Password
                </label>
              </div>
              
              {isLoginView && (
                <div className="text-xs text-[#1a73e8] hover:underline cursor-pointer font-medium mb-4 select-none self-start">
                  Forgot email?
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between mt-6 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsLoginView(!isLoginView);
                  setError(null);
                  setSuccessMsg(null);
                }}
                disabled={loading}
                className="text-sm font-medium text-[#1a73e8] hover:text-[#1557b0] dark:text-[#8ab4f8] dark:hover:text-[#aecbfa] cursor-pointer disabled:opacity-50 select-none bg-transparent border-none p-0"
              >
                {isLoginView ? 'Create account' : 'Sign in instead'}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] dark:bg-[#8ab4f8] dark:hover:bg-[#aecbfa] dark:text-[#202124] text-white font-medium rounded-md text-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center select-none shadow-sm"
              >
                {loading ? 'Processing...' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-[450px] flex justify-between text-xs text-slate-500 py-6 select-none mt-4">
        <div>
          <span className="hover:underline cursor-pointer">English (United States)</span>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Help</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
        </div>
      </footer>
    </div>
  );
}
