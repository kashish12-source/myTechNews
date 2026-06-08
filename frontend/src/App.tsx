import { useState, useEffect } from 'react';
import { Layers, TableProperties, Sun, Moon, LogOut, Radio, CloudSun, User } from 'lucide-react';
import NewsFeed from './components/NewsFeed';
import LlmComponents from './components/LlmComponents';
import ReplacementMatrix from './components/ReplacementMatrix';
import Login from './components/Login';
import { getApiUrl } from './utils/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'llm' | 'matrix'>('feed');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
        const res = await fetch(getApiUrl('/api/news'), { headers });
        setServerOnline(res.status === 200 || res.status === 401 || res.status === 403);
      } catch {
        setServerOnline(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // Get current date string for editorial header
  const getFormattedDate = () => {
    return new Date().toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <header className="bg-slate-900 border-b border-slate-800 py-3 px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="bg-red-600 text-white px-3 py-1 font-extrabold tracking-wider rounded text-sm font-serif">
              ABP TECH
            </span>
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase hidden sm:inline">
              TechNews Intelligence Portal
            </span>
          </div>
          
          <button 
            className="p-2 border border-slate-700 hover:border-slate-500 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>
        <main className="flex-1 flex justify-center items-center py-10 px-4">
          <Login onLoginSuccess={handleLoginSuccess} />
        </main>
      </div>
    );
  }

  // Helper to change feed category
  const navigateToCategory = (catId: string) => {
    setActiveTab('feed');
    setSelectedCategory(catId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-red-600 selection:text-white transition-colors duration-150">
      
      {/* Top Editorial Banner Bar (TOI / ABP Style) */}
      <header className="bg-slate-900 border-b border-slate-800 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center text-xs border-b border-slate-800/50">
          <div className="flex items-center gap-4">
            <span className="font-medium">{getFormattedDate()}</span>
            <span className="hidden md:inline text-slate-600">|</span>
            <div className="hidden md:flex items-center gap-1.5 text-slate-400">
              <CloudSun size={13} className="text-yellow-500" />
              <span>Tech Hub • 24°C • Live Feed</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Server Connection status */}
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${serverOnline ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'}`}></span>
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                {serverOnline ? 'FastAPI Connected' : 'SQLite Fallback Cache'}
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-2 text-slate-400">
              <User size={12} />
              <span className="max-w-[120px] truncate">{userEmail}</span>
            </div>
          </div>
        </div>

        {/* Brand Banner Block */}
        <div className="max-w-7xl mx-auto px-4 py-7 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3">
              <div className="bg-slate-950 border border-red-550/40 text-red-500 px-3.5 py-1 text-xl font-serif font-black tracking-widest rounded-lg shadow-md shadow-red-500/5 select-none hover:border-red-500/80 transition-colors">
                ABP
              </div>
              <span className="text-xl font-serif font-extrabold tracking-tight text-white">
                TechDesk <span className="text-red-500 font-mono text-xs font-normal">v2.0</span>
              </span>
            </div>
            <p className="text-slate-500 text-[10px] mt-1.5 tracking-wider uppercase font-mono">
              Heuristic Scraped, Meme-Filtered Technical intelligence
            </p>
          </div>
          
          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              className="p-2 border border-slate-850 hover:border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-all bg-slate-950"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? "Toggle Light Mode" : "Toggle Dark Mode"}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 border border-red-950/40 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer"
            >
              <LogOut size={13} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Live Breaking News Ticker Section */}
        <div className="bg-slate-950/80 text-slate-300 font-semibold text-sm py-2 px-4 shadow-inner flex overflow-hidden border-y border-slate-900/60 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 shrink-0 bg-red-500/10 border border-red-500/20 text-red-500 px-2.5 py-0.5 rounded mr-4 select-none animate-pulse">
            <Radio size={12} />
            <span className="font-mono font-bold tracking-wider uppercase text-[9px]">Breaking News</span>
          </div>
          <div className="relative w-full flex items-center">
            {/* @ts-ignore */}
            <marquee className="w-full text-xs font-medium tracking-wide text-slate-400" scrollamount="4">
              [CRITICAL UPDATE] Gemini 2.5 Flash updates heuristic classifiers across all active endpoints ••• [HARDWARE & GPUS] NVIDIA Blackwell architecture enters mass shipment cycle ••• [POLICY BRIEF] NITI Aayog drafts strategic national Artificial Intelligence roadmap ••• [ML RESEARCH] OpenReview neural network architectures accept new submissions for 2026.
            {/* @ts-ignore */}
            </marquee>
          </div>
        </div>
      </header>

      {/* Main Newspaper-style Sticky Navigation Bar */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-850/60 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            <button 
              onClick={() => navigateToCategory('all')}
              className={`px-4 py-3 text-xs font-mono font-semibold tracking-wide transition-all border-b-2 ${activeTab === 'feed' && selectedCategory === 'all' ? 'text-red-500 border-red-500' : 'text-slate-450 hover:text-slate-200 border-transparent hover:border-slate-800'}`}
            >
              all.updates
            </button>
            <button 
              onClick={() => navigateToCategory('ai-models')}
              className={`px-4 py-3 text-xs font-mono font-semibold tracking-wide transition-all border-b-2 ${activeTab === 'feed' && selectedCategory === 'ai-models' ? 'text-red-500 border-red-500' : 'text-slate-450 hover:text-slate-200 border-transparent hover:border-slate-800'}`}
            >
              ai.models
            </button>
            <button 
              onClick={() => navigateToCategory('big-tech')}
              className={`px-4 py-3 text-xs font-mono font-semibold tracking-wide transition-all border-b-2 ${activeTab === 'feed' && selectedCategory === 'big-tech' ? 'text-red-500 border-red-500' : 'text-slate-450 hover:text-slate-200 border-transparent hover:border-slate-800'}`}
            >
              big.tech
            </button>
            <button 
              onClick={() => navigateToCategory('dev-tools')}
              className={`px-4 py-3 text-xs font-mono font-semibold tracking-wide transition-all border-b-2 ${activeTab === 'feed' && selectedCategory === 'dev-tools' ? 'text-red-500 border-red-500' : 'text-slate-450 hover:text-slate-200 border-transparent hover:border-slate-800'}`}
            >
              dev.tools
            </button>
            <button 
              onClick={() => navigateToCategory('mlops-devops')}
              className={`px-4 py-3 text-xs font-mono font-semibold tracking-wide transition-all border-b-2 ${activeTab === 'feed' && selectedCategory === 'mlops-devops' ? 'text-red-500 border-red-500' : 'text-slate-450 hover:text-slate-200 border-transparent hover:border-slate-800'}`}
            >
              mlops.devops
            </button>
            <button 
              onClick={() => navigateToCategory('hardware-gpus')}
              className={`px-4 py-3 text-xs font-mono font-semibold tracking-wide transition-all border-b-2 ${activeTab === 'feed' && selectedCategory === 'hardware-gpus' ? 'text-red-500 border-red-500' : 'text-slate-450 hover:text-slate-200 border-transparent hover:border-slate-800'}`}
            >
              hardware.gpus
            </button>
            <div className="w-px h-6 bg-slate-850 mx-2 self-center"></div>
            <button 
              onClick={() => { setActiveTab('matrix'); }}
              className={`px-4 py-3 text-xs font-mono font-semibold tracking-wide flex items-center gap-1.5 transition-all border-b-2 ${activeTab === 'matrix' ? 'text-red-500 border-red-500' : 'text-slate-450 hover:text-slate-200 border-transparent hover:border-slate-800'}`}
            >
              <TableProperties size={13} />
              <span>ai.matrix</span>
            </button>
            <button 
              onClick={() => { setActiveTab('llm'); }}
              className={`px-4 py-3 text-xs font-mono font-semibold tracking-wide flex items-center gap-1.5 transition-all border-b-2 ${activeTab === 'llm' ? 'text-red-500 border-red-500' : 'text-slate-450 hover:text-slate-200 border-transparent hover:border-slate-800'}`}
            >
              <Layers size={13} />
              <span>architecture</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main App Workspace Frame */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
        {activeTab === 'feed' && (
          <NewsFeed 
            authToken={token} 
            onAuthError={handleLogout} 
            selectedCategory={selectedCategory} 
          />
        )}
        {activeTab === 'llm' && <LlmComponents />}
        {activeTab === 'matrix' && <ReplacementMatrix />}
      </main>

      {/* Editorial Footer Section */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} ABP TechNews Intelligence Portal. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="https://news.ycombinator.com/" target="_blank" rel="noreferrer" className="hover:text-slate-400 transition-colors">Hacker News</a>
            <a href="https://lobste.rs/" target="_blank" rel="noreferrer" className="hover:text-slate-400 transition-colors">Lobsters</a>
            <a href="https://niti.gov.in" target="_blank" rel="noreferrer" className="hover:text-slate-400 transition-colors">NITI Aayog</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
