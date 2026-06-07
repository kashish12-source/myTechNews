import { useState, useEffect } from 'react';
import { Newspaper, Layers, TableProperties, Terminal, ExternalLink } from 'lucide-react';
import NewsFeed from './components/NewsFeed';
import LlmComponents from './components/LlmComponents';
import ReplacementMatrix from './components/ReplacementMatrix';

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'llm' | 'matrix'>('feed');
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  // Check backend server status on load
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
    // Re-check status every 10 seconds
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-grid">
      {/* Premium Sidebar Navigation */}
      <aside className="glass" style={{ 
        padding: '2rem 1.5rem', 
        borderRight: '1px solid var(--border-color)', 
        borderLeft: 'none', 
        borderTop: 'none', 
        borderBottom: 'none', 
        borderRadius: '0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div>
          {/* Logo / Header */}
          <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            <div className="font-tech glow-text" style={{ 
              fontSize: '1.6rem', 
              fontWeight: 900, 
              background: 'linear-gradient(to right, #00f2fe, #ff007f)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              letterSpacing: '2px',
              textShadow: '0 0 10px rgba(0, 242, 254, 0.3)'
            }}>
              MY TECH NEWS
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '0.25rem' }}>
              Intelligence Console
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              className="btn"
              onClick={() => setActiveTab('feed')}
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                padding: '0.85rem 1.25rem',
                background: activeTab === 'feed' ? 'linear-gradient(135deg, rgba(0,242,254,0.1), rgba(112,0,255,0.05))' : 'transparent',
                border: '1px solid',
                borderColor: activeTab === 'feed' ? 'rgba(0, 242, 254, 0.4)' : 'transparent',
                color: activeTab === 'feed' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                boxShadow: activeTab === 'feed' ? 'var(--glow-cyan)' : 'none'
              }}
            >
              <Newspaper size={18} />
              <span>Daily Tech Feed</span>
            </button>

            <button 
              className="btn"
              onClick={() => setActiveTab('llm')}
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                padding: '0.85rem 1.25rem',
                background: activeTab === 'llm' ? 'linear-gradient(135deg, rgba(255,0,127,0.1), rgba(112,0,255,0.05))' : 'transparent',
                border: '1px solid',
                borderColor: activeTab === 'llm' ? 'rgba(255, 0, 127, 0.4)' : 'transparent',
                color: activeTab === 'llm' ? 'var(--accent-magenta)' : 'var(--text-secondary)',
                boxShadow: activeTab === 'llm' ? 'var(--glow-magenta)' : 'none'
              }}
            >
              <Layers size={18} />
              <span>LLM Architecture</span>
            </button>

            <button 
              className="btn"
              onClick={() => setActiveTab('matrix')}
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                padding: '0.85rem 1.25rem',
                background: activeTab === 'matrix' ? 'linear-gradient(135deg, rgba(112,0,255,0.15), rgba(0,242,254,0.05))' : 'transparent',
                border: '1px solid',
                borderColor: activeTab === 'matrix' ? 'rgba(112, 0, 255, 0.4)' : 'transparent',
                color: activeTab === 'matrix' ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === 'matrix' ? 'var(--glow-purple)' : 'none'
              }}
            >
              <TableProperties size={18} />
              <span>AI Replacement Matrix</span>
            </button>
          </nav>
        </div>

        {/* Info & Server Status Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Quick Source Launchers */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
              Direct Platforms
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
              <a href="https://news.ycombinator.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Hacker News <ExternalLink size={10} />
              </a>
              <a href="https://lobste.rs/" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Lobsters <ExternalLink size={10} />
              </a>
              <a href="https://www.paulgraham.com/articles.html" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Paul Graham <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Connection Monitor */}
          <div className="glass" style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Terminal size={12} /> Live Engine:
              </span>
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem', 
                color: serverOnline ? 'var(--accent-green)' : 'var(--accent-magenta)',
                fontWeight: 600
              }}>
                <span style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  background: serverOnline ? 'var(--accent-green)' : 'var(--accent-magenta)',
                  boxShadow: serverOnline ? '0 0 8px var(--accent-green)' : '0 0 8px var(--accent-magenta)'
                }}></span>
                {serverOnline === null ? 'Checking...' : serverOnline ? 'ONLINE' : 'STATIC'}
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)', lineHeight: '1.3' }}>
              {serverOnline ? 'Connected to local news pipeline.' : 'Server not running. Run: cd server && npm start'}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="container" style={{ overflowY: 'auto', height: '100vh' }}>
        {activeTab === 'feed' && <NewsFeed />}
        {activeTab === 'llm' && <LlmComponents />}
        {activeTab === 'matrix' && <ReplacementMatrix />}
      </main>
    </div>
  );
}
