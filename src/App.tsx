import { useState, useEffect } from 'react';
import { Newspaper, Layers, TableProperties, Sun, Moon } from 'lucide-react';
import NewsFeed from './components/NewsFeed';
import LlmComponents from './components/LlmComponents';
import ReplacementMatrix from './components/ReplacementMatrix';

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'llm' | 'matrix'>('feed');
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  
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
        const res = await fetch('http://localhost:3001/api/news');
        if (res.ok) {
          setServerOnline(true);
        } else {
          setServerOnline(false);
        }
      } catch (e) {
        setServerOnline(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);

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
              <Newspaper size={14} style={{ marginRight: '4px' }} />
              <span>Feed</span>
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
              <Layers size={14} style={{ marginRight: '4px' }} />
              <span>Architecture</span>
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
              <TableProperties size={14} style={{ marginRight: '4px' }} />
              <span>Matrix</span>
            </button>
            <span className="tooltip-text">AI Replacement Matrix</span>
          </div>
        </nav>

        {/* Right Section: Toggle Theme & Quick Platform Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Quick Platform Bookmarks */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }}>
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

        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="container">
        {activeTab === 'feed' && <NewsFeed />}
        {activeTab === 'llm' && <LlmComponents />}
        {activeTab === 'matrix' && <ReplacementMatrix />}
      </main>
    </div>
  );
}
