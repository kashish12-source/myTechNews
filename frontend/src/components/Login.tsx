import { useState } from 'react';
import { AlertCircle, CheckCircle, Radio } from 'lucide-react';
import { getApiUrl } from '../utils/api';

interface LoginProps {
  onLoginSuccess: (token: string, email: string) => void;
  onBack?: () => void;
}

export default function Login({ onLoginSuccess, onBack }: LoginProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const parseErrorMessage = (data: any, defaultMsg: string): string => {
    if (!data) return defaultMsg;
    if (typeof data.detail === 'string') {
      return data.detail;
    }
    if (Array.isArray(data.detail)) {
      return data.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
    }
    return data.error || defaultMsg;
  };

  // 2FA / Code Verification State
  const [showVerificationStep, setShowVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);

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
      console.log("Login response data:", data);

      if (!response.ok) {
        throw new Error(parseErrorMessage(data, 'Authentication request failed.'));
      }

      if (!isLoginView) {
        setSuccessMsg('Account created successfully! Welcome email sent. Redirecting to login...');
        setTimeout(() => {
          setIsLoginView(true);
          setSuccessMsg(null);
          setPassword('');
        }, 1500);
      } else {
        // If login requires verification code
        if (data.status === 'verification_required') {
          setSuccessMsg(data.message || 'Verification code sent to your email.');
          setShowVerificationStep(true);
          if (data.dev_code) {
            setDevCode(data.dev_code);
          }
        } else {
          onLoginSuccess(data.token, data.email);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.trim();
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(getApiUrl('/api/auth/verify-code'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(parseErrorMessage(data, 'Verification failed.'));
      }

      onLoginSuccess(data.token, data.email);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowVerificationStep(false);
    setVerificationCode('');
    setDevCode(null);
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <div className="google-login-container min-h-[calc(100vh-140px)] flex flex-col justify-between items-center w-full animate-fade-in font-sans">
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="google-card">
          
          {/* Logo & Branding */}
          <div className="text-center mb-8 flex flex-col items-center select-none">
            <div className="flex items-center gap-2 mb-4">
              <Radio size={24} className="text-brand-primary animate-pulse" />
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                myTechNews
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-1">
              {showVerificationStep 
                ? 'Identity verification' 
                : (isLoginView ? 'Welcome back' : 'Create account')}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1.5 uppercase tracking-wider font-semibold">
              {showVerificationStep 
                ? 'Enter the code sent to your email' 
                : (isLoginView ? 'Sign in to access updates' : 'Join our serious tech feed')}
            </p>
          </div>

          {/* Form */}
          {showVerificationStep ? (
            /* Code Verification Screen */
            <form onSubmit={handleVerifyCodeSubmit} className="flex flex-col flex-1 justify-between">
              <div className="flex flex-col gap-1">
                
                {error && (
                  <div className="flex items-center gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-xs mb-4 animate-fade-in font-medium">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 text-xs mb-4 animate-fade-in font-medium">
                    <CheckCircle size={15} className="shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {devCode && (
                  <div className="flex flex-col gap-1.5 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400 text-xs mb-4 animate-fade-in font-medium">
                    <div className="font-bold flex items-center gap-1">
                      <span>🔧 Dev Mode OTP Helper</span>
                    </div>
                    <span>For quick testing, your verification code is: <strong>{devCode}</strong></span>
                  </div>
                )}

                <div className="google-input-group">
                  <input
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="google-input tracking-[8px] text-center font-mono font-bold text-lg"
                    placeholder=" "
                    required
                    disabled={loading}
                    maxLength={6}
                    autoComplete="one-time-code"
                    autoFocus
                  />
                  <label htmlFor="verificationCode" className="google-label left-0 right-0 text-center">
                    6-digit code
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-2">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  disabled={loading}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer disabled:opacity-50 select-none bg-transparent border-none p-0 hover:underline transition-all"
                >
                  Back to login
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary min-w-[90px]"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </form>
          ) : (
            /* Login / Registration Screen */
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 justify-between">
              <div className="flex flex-col gap-1">
                
                {error && (
                  <div className="flex items-center gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-xs mb-4 animate-fade-in font-medium">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 text-xs mb-4 animate-fade-in font-medium">
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
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between mt-8 pt-2">
                <div className="flex flex-col gap-1.5 items-start">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginView(!isLoginView);
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    disabled={loading}
                    className="text-xs font-semibold text-brand-primary hover:text-brand-accent cursor-pointer disabled:opacity-50 select-none bg-transparent border-none p-0 hover:underline transition-all text-left"
                  >
                    {isLoginView ? 'Create account' : 'Sign in instead'}
                  </button>
                  {onBack && (
                    <button
                      type="button"
                      onClick={onBack}
                      disabled={loading}
                      className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer disabled:opacity-50 select-none bg-transparent border-none p-0 hover:underline transition-all"
                    >
                      ← Back to Home
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary min-w-[90px]"
                >
                  {loading ? 'Wait...' : 'Next'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-[440px] flex justify-between text-[11px] text-slate-500 py-6 select-none mt-2 font-medium">
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
