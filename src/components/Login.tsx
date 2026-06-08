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
        throw new Error(data.error || 'Authentication request failed.');
      }

      onLoginSuccess(data.token, data.email);
    } catch (err: any) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: '1rem',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <div className="glass" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}>
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--accent-blue)',
            color: '#fff',
            marginBottom: '0.75rem'
          }}>
            <LogIn size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {isLoginView ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            {isLoginView ? 'Log in to access serious tech news intelligence' : 'Register to join the tech feed community'}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: '2px',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => { setIsLoginView(true); setError(null); setSuccessMsg(null); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.8rem',
              borderRadius: '4px',
              border: 'none',
              background: isLoginView ? 'var(--accent-blue)' : 'transparent',
              color: isLoginView ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: isLoginView ? 600 : 400,
              transition: 'all 0.15s ease'
            }}
          >
            Log In
          </button>
          <button
            onClick={() => { setIsLoginView(false); setError(null); setSuccessMsg(null); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.8rem',
              borderRadius: '4px',
              border: 'none',
              background: !isLoginView ? 'var(--accent-blue)' : 'transparent',
              color: !isLoginView ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: !isLoginView ? 600 : 400,
              transition: 'all 0.15s ease'
            }}
          >
            Register
          </button>
        </div>

        {/* Errors & Success Messages */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.15)',
            borderRadius: '6px',
            color: 'var(--accent-rose)',
            fontSize: '0.8rem',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={16} style={{ minWidth: '16px' }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            borderRadius: '6px',
            color: 'var(--accent-emerald)',
            fontSize: '0.8rem',
            marginBottom: '1.25rem'
          }}>
            <CheckCircle size={16} style={{ minWidth: '16px' }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '0.4rem',
              textTransform: 'uppercase'
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '2.2rem',
                  paddingRight: '0.75rem',
                  paddingBlock: '0.6rem',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '0.4rem',
              textTransform: 'uppercase'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '2.2rem',
                  paddingRight: '0.75rem',
                  paddingBlock: '0.6rem',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
                }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-outline-neon"
            disabled={loading}
            style={{
              width: '100%',
              paddingBlock: '0.7rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <span>Connecting...</span>
            ) : isLoginView ? (
              <>
                Log In <LogIn size={14} />
              </>
            ) : (
              <>
                Register <UserPlus size={14} />
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input:focus {
          border-color: var(--accent-blue) !important;
          background: rgba(255, 255, 255, 0.04) !important;
        }
      `}</style>
    </div>
  );
}
