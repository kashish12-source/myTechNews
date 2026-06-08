import { useState, useEffect } from 'react';
import { Newspaper, Layers, TableProperties, Sun, Moon, LogOut } from 'lucide-react';
import NewsFeed from './components/NewsFeed';
import LlmComponents from './components/LlmComponents';
import ReplacementMatrix from './components/ReplacementMatrix';
import Login from './components/Login';

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'llm' | 'matrix'>('feed');
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  
  // Auth state
  const [token, setToken] = useState<string | null>(() => {
    const val = localStorage.getItem('token');
    return (val === 'null' || val === 'undefined' || !val) ? null : val;
  });
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    const val = localStorage.getItem('email');
    return (val === 'null' || val === 'undefined' || !val) ? null : val;
  });

  const handleLoginSuccess = (newToken: string, newEmail: string) => {
    setToken(newToken);
    setUserEmail(newEmail);
    localStorage.setItem('token', newToken);
    localStorage.setItem('email', newEmail);
  };

  const handleLogout = () => {
    setToken(null);
    setUserEmail(null);
    localStorage.removeItem('token');
    localStorage.removeItem('email');
  };

  // Theme state: dark by default, persists in local storage
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  // Apply theme class to document body
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Check backend server status
  useEffect(() => {
    const checkServer = async () => {
      try {
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch('/api/news', { headers });
        setServerOnline(res.status === 200 || res.status === 401 || res.status === 403);
      } catch {
        setServerOnline(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, [token]);

  if (!token) {
    return (
      <div className="dashboard-grid">
        <header className="top-navbar" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '6px', 
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))', 
              color: '#ffffff',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 700, 
              fontSize: '0.95rem',
              fontFamily: "'Space Grotesk', sans-serif"
            }}>
              TN
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TechNews Gateway</span>
          </div>
          
          <button 
            className="btn btn-icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '6px'
            }}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </header>
        <main className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)' }}>
          <Login onLoginSuccess={handleLoginSuccess} />
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      {/* Premium Sticky Top Navigation Bar */}
      <header className="top-navbar">
        {/* Left Section: Logo & Connection Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="tooltip tooltip-bottom" style={{ cursor: 'default' }}>
            <span style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '6px', 
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))', 
              color: '#ffffff',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 700, 
              fontSize: '0.95rem',
              fontFamily: "'Space Grotesk', sans-serif"
            }}>
              TN
            </span>
            <span className="tooltip-text">TechNews Intelligence v1.0</span>
          </div>

          <div className="tooltip tooltip-bottom" style={{ cursor: 'default' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: serverOnline ? 'var(--accent-emerald)' : 'var(--accent-rose)',
              boxShadow: serverOnline ? '0 0 6px var(--accent-emerald)' : '0 0 6px var(--accent-rose)'
            }}></div>
            <span className="tooltip-text">
              {serverOnline ? 'Local scraper connected (ONLINE)' : 'Server offline. Using pre-seeded backup database.'}
            </span>
          </div>
        </div>

        {/* Center Section: Navigation Tab Buttons */}
        <nav style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="tooltip tooltip-bottom">
            <button 
              className="btn"
              onClick={() => setActiveTab('feed')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                background: activeTab === 'feed' ? 'var(--accent-blue)' : 'transparent',
                color: activeTab === 'feed' ? '#ffffff' : 'var(--text-secondary)',
                border: activeTab === 'feed' ? 'none' : '1px solid var(--border-color)',
                fontSize: '0.75rem'
              }}
            >
              <Newspaper size={14} className="nav-icon" />
              <span className="nav-label">Feed</span>
            </button>
            <span className="tooltip-text">Daily Updates Feed</span>
          </div>

          <div className="tooltip tooltip-bottom">
            <button 
              className="btn"
              onClick={() => setActiveTab('llm')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                background: activeTab === 'llm' ? 'var(--accent-blue)' : 'transparent',
                color: activeTab === 'llm' ? '#ffffff' : 'var(--text-secondary)',
                border: activeTab === 'llm' ? 'none' : '1px solid var(--border-color)',
                fontSize: '0.75rem'
              }}
            >
              <Layers size={14} className="nav-icon" />
              <span className="nav-label">Architecture</span>
            </button>
            <span className="tooltip-text">LLM Core Components</span>
          </div>

          <div className="tooltip tooltip-bottom">
            <button 
              className="btn"
              onClick={() => setActiveTab('matrix')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                background: activeTab === 'matrix' ? 'var(--accent-blue)' : 'transparent',
                color: activeTab === 'matrix' ? '#ffffff' : 'var(--text-secondary)',
                border: activeTab === 'matrix' ? 'none' : '1px solid var(--border-color)',
                fontSize: '0.75rem'
              }}
            >
              <TableProperties size={14} className="nav-icon" />
              <span className="nav-label">Matrix</span>
            </button>
            <span className="tooltip-text">AI Replacement Matrix</span>
          </div>
        </nav>

        {/* Right Section: Toggle Theme & Quick Platform Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Quick Platform Bookmarks */}
          <div className="bookmarks-panel" style={{ gap: '0.5rem', alignItems: 'center', borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }}>
            <div className="tooltip tooltip-bottom">
              <a 
                href="https://news.ycombinator.com/" 
                target="_blank" 
                rel="noreferrer" 
                style={{ 
                  color: 'var(--text-secondary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(255, 102, 0, 0.08)',
                  border: '1px solid rgba(255, 102, 0, 0.15)',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  textDecoration: 'none'
                }}
              >
                Y
              </a>
              <span className="tooltip-text">Open Hacker News</span>
            </div>

            <div className="tooltip tooltip-bottom">
              <a 
                href="https://lobste.rs/" 
                target="_blank" 
                rel="noreferrer" 
                style={{ 
                  color: 'var(--text-secondary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(144, 0, 0, 0.08)',
                  border: '1px solid rgba(144, 0, 0, 0.15)',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  textDecoration: 'none'
                }}
              >
                L
              </a>
              <span className="tooltip-text">Open Lobsters</span>
            </div>

            <div className="tooltip tooltip-bottom">
              <a 
                href="https://www.paulgraham.com/articles.html" 
                target="_blank" 
                rel="noreferrer" 
                style={{ 
                  color: 'var(--text-secondary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  textDecoration: 'none'
                }}
              >
                PG
              </a>
              <span className="tooltip-text">Open Paul Graham Essays</span>
            </div>
          </div>

          {/* Light/Dark Toggle Icon */}
          <div className="tooltip tooltip-bottom">
            <button 
              className="btn btn-icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                borderRadius: '6px'
              }}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <span className="tooltip-text">
              {theme === 'dark' ? 'Toggle Light Mode' : 'Toggle Dark Mode'}
            </span>
          </div>

          {/* Sign Out Button */}
          <div className="tooltip tooltip-bottom">
            <button 
              className="btn"
              onClick={handleLogout}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid rgba(244, 63, 94, 0.15)',
                background: 'rgba(244, 63, 94, 0.05)',
                color: 'var(--accent-rose)',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <LogOut size={12} />
              <span>Sign Out</span>
            </button>
            <span className="tooltip-text">Log out ({userEmail})</span>
          </div>

        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="container">
        {activeTab === 'feed' && <NewsFeed authToken={token} onAuthError={handleLogout} />}
        {activeTab === 'llm' && <LlmComponents />}
        {activeTab === 'matrix' && <ReplacementMatrix />}
      </main>
    </div>
  );
}
