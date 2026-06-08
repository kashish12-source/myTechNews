import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, LogOut, Radio, User, Search, Globe, Cpu, Building2, Code, Workflow, Server, TableProperties, Layers } from 'lucide-react';
import NewsFeed from './components/NewsFeed';
import LlmComponents from './components/LlmComponents';
import ReplacementMatrix from './components/ReplacementMatrix';
import Login from './components/Login';

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'llm' | 'matrix'>('feed');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  // Theme state: light by default, persists in local storage
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  // Apply theme class to document body
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

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
      <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg-primary)] transition-colors duration-150">
        {/* Top Header Toggle to allow changing theme on login */}
        <div className="absolute top-4 right-4 z-50">
          <button 
            className="p-2.5 border border-[var(--border-color)] hover:border-[var(--border-hover)] rounded-full text-[var(--text-secondary)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer shadow-sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? "Toggle Light Mode" : "Toggle Dark Mode"}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Define persistent sidebar navigation
  const sidebarItems = [
    { id: 'all', label: 'All Updates', icon: Globe, tab: 'feed' as const },
    { id: 'ai-models', label: 'ML Models & AI', icon: Cpu, tab: 'feed' as const },
    { id: 'big-tech', label: 'Big Tech', icon: Building2, tab: 'feed' as const },
    { id: 'dev-tools', label: 'Dev Tools & Coding', icon: Code, tab: 'feed' as const },
    { id: 'mlops-devops', label: 'MLOps & DevOps', icon: Workflow, tab: 'feed' as const },
    { id: 'hardware-gpus', label: 'Hardware & GPUs', icon: Server, tab: 'feed' as const },
    { divider: true },
    { id: 'matrix', label: 'AI Replacement Matrix', icon: TableProperties, tab: 'matrix' as const },
    { id: 'llm', label: 'LLM Architecture', icon: Layers, tab: 'llm' as const }
  ];

  const handleNavClick = (item: typeof sidebarItems[0]) => {
    if ('divider' in item) return;
    if (item.tab === 'feed') {
      setActiveTab('feed');
      setSelectedCategory(item.id);
    } else {
      setActiveTab(item.tab as 'matrix' | 'llm');
    }
    setIsMobileDrawerOpen(false);
  };

  const isItemActive = (item: typeof sidebarItems[0]) => {
    if ('divider' in item) return false;
    if (item.tab === 'feed') {
      return activeTab === 'feed' && selectedCategory === item.id;
    }
    return activeTab === item.tab;
  };

  const getHeadingText = () => {
    if (activeTab === 'matrix') return 'AI Replacement Matrix';
    if (activeTab === 'llm') return 'LLM Architecture Inspector';
    const activeItem = sidebarItems.find(item => !('divider' in item) && item.tab === 'feed' && item.id === selectedCategory);
    return activeItem && 'label' in activeItem ? activeItem.label : 'Technology News';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-150 font-sans selection:bg-[#1a73e8] selection:text-white">
      
      {/* 1. Google News Top Bar Header */}
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] sticky top-0 z-50 px-4 py-2 flex items-center justify-between shadow-sm select-none">
        
        {/* Left Section: Menu button and Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileDrawerOpen(true)}
            className="md:hidden p-2 hover:bg-[var(--border-hover)] rounded-full text-[var(--text-secondary)] cursor-pointer"
            title="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <Radio size={20} className="text-[#1a73e8] animate-pulse" />
            <span className="text-xl font-bold tracking-tight">
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
            </span>
          </div>
        </div>

        {/* Center Section: Search Bar (Desktop) */}
        <div className="google-search-bar flex-1 mx-6 max-w-[620px] hidden md:flex items-center">
          <Search size={16} className="text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search for articles, topics, or matrix entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm border-none outline-none text-[var(--text-primary)] placeholder-slate-400"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 cursor-pointer"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right Section: System info, Theme, Alerts, Profile */}
        <div className="flex items-center gap-2">
          
          {/* Theme Switcher */}
          <button 
            className="p-2 hover:bg-[var(--border-hover)] rounded-full text-[var(--text-secondary)] cursor-pointer transition-all"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? "Toggle Light Mode" : "Toggle Dark Mode"}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Profile Menu Dropdown */}
          <div className="relative ml-1">
            <button 
              onClick={() => {
                setShowUserMenu(!showUserMenu);
              }}
              className="w-8 h-8 rounded-full border border-[var(--border-color)] hover:border-[#1a73e8] cursor-pointer flex items-center justify-center bg-slate-200 dark:bg-slate-800 transition-all shadow-inner relative"
              title="User Account"
            >
              <User size={16} className="text-[var(--text-secondary)]" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2.5 w-64 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-5 z-50 flex flex-col items-center text-xs animate-fade-in">
                {/* Circular Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1a73e8] to-cyan-500 text-white flex items-center justify-center text-lg font-bold shadow-md select-none mb-3">
                  {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                </div>
                
                {/* User Info */}
                <div className="text-center w-full mb-4">
                  <span className="text-sm font-semibold text-[var(--text-primary)] block truncate max-w-full px-2" title={userEmail || ''}>
                    {userEmail}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 block select-none">
                    Tech News Partner
                  </span>
                </div>

                <div className="w-full border-t border-[var(--border-color)] pt-3">
                  <button
                    onClick={handleLogout}
                    className="w-full py-2 bg-transparent hover:bg-rose-500/10 border border-[var(--border-color)] hover:border-rose-500/25 text-rose-500 font-semibold rounded-full text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <LogOut size={12} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 2. Top Ticker marquee (Breaking News / Feed updates) */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] py-1.5 px-4 flex items-center overflow-hidden z-40 select-none">
        <div className="flex items-center gap-1.5 shrink-0 bg-red-500/10 border border-red-500/20 text-red-500 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase mr-4 select-none">
          <Radio size={11} className="animate-pulse" />
          <span>Breaking</span>
        </div>
        <div className="w-full flex items-center">
          {/* @ts-ignore */}
          <marquee className="w-full text-xs font-medium tracking-wide text-slate-400" scrollamount="4">
            [AI AGENTS] Antigravity model executes multi-file front-end refactoring with zero lint issues ••• [HARDWARE] NVIDIA Blackwell HGX server systems enter global data center distribution ••• [RESEARCH] DPO and RLHF pipelines adapt to larger 2M token context lengths ••• [MLOPS] Local SQLite caches act as robust database backups for scraped feeds.
          {/* @ts-ignore */}
          </marquee>
        </div>
      </div>

      {/* 3. Main Dashboard Frame (Sidebar + Content Panel) */}
      <div className="flex-1 flex w-full relative">
        
        {/* Left Sidebar Navigation (Desktop) */}
        <aside className="w-[280px] shrink-0 border-r border-[var(--border-color)] py-6 pr-4 hidden md:flex flex-col gap-1.5 bg-[var(--bg-primary)]">
          {sidebarItems.map((item, index) => {
            if ('divider' in item) {
              return <div key={`divider-${index}`} className="my-2.5 border-t border-[var(--border-color)] mx-6"></div>;
            }
            
            const Icon = item.icon;
            const active = isItemActive(item);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`sidebar-nav-item ${active ? 'active' : ''}`}
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Mobile Slide-over Drawer Backdrop */}
        {isMobileDrawerOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 md:hidden animate-fade-in"
            onClick={() => setIsMobileDrawerOpen(false)}
          >
            {/* Mobile Drawer */}
            <div 
              className="w-[280px] h-full bg-[var(--bg-card)] border-r border-[var(--border-color)] py-6 flex flex-col gap-1.5 animate-slide-in relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center px-6 mb-4">
                <span className="font-bold text-lg text-[var(--text-primary)]">Categories</span>
                <button 
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 hover:bg-[var(--border-hover)] rounded-full text-[var(--text-secondary)]"
                >
                  <X size={18} />
                </button>
              </div>

              {sidebarItems.map((item, index) => {
                if ('divider' in item) {
                  return <div key={`mobile-divider-${index}`} className="my-2 border-t border-[var(--border-color)] mx-6"></div>;
                }
                
                const Icon = item.icon;
                const active = isItemActive(item);
                
                return (
                  <button
                    key={`mobile-${item.id}`}
                    onClick={() => handleNavClick(item)}
                    className={`sidebar-nav-item ${active ? 'active' : ''}`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Main Content Pane */}
        <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto max-w-full">
          {/* Header context indicator */}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <p className="text-[11px] font-mono tracking-widest text-[#1a73e8] uppercase font-bold">
                {activeTab === 'feed' ? 'EDITORIAL NEWS DESK' : 'ADVANCED ANALYTICS'}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                {getHeadingText()}
              </h1>
            </div>
            <div className="text-xs text-slate-500 font-mono self-end shrink-0 hidden sm:block">
              {getFormattedDate()}
            </div>
          </div>

          {/* Search bar inside feed on mobile/tablet */}
          <div className="google-search-bar w-full mb-6 flex md:hidden items-center">
            <Search size={16} className="text-slate-400 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Search feed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm border-none outline-none text-[var(--text-primary)] placeholder-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Router Views */}
          <div className="w-full">
            {activeTab === 'feed' && (
              <NewsFeed 
                authToken={token} 
                onAuthError={handleLogout} 
                selectedCategory={selectedCategory} 
                setSelectedCategory={setSelectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                setActiveTab={setActiveTab}
                userEmail={userEmail}
                onLogout={handleLogout}
                theme={theme}
                setTheme={setTheme}
              />
            )}
            
            {activeTab === 'matrix' && (
              <ReplacementMatrix 
                searchQuery={searchQuery}
              />
            )}
            
            {activeTab === 'llm' && (
              <LlmComponents />
            )}
          </div>
        </main>
        
      </div>

      {/* 4. Elegant Footer */}
      <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] py-6 text-center text-xs text-slate-500 select-none">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} myTechNews. Powered by Google AI Guidelines.</p>
          <div className="flex gap-4">
            <a href="https://news.ycombinator.com/" target="_blank" rel="noreferrer" className="hover:underline hover:text-slate-400 transition-colors">Hacker News</a>
            <a href="https://lobste.rs/" target="_blank" rel="noreferrer" className="hover:underline hover:text-slate-400 transition-colors">Lobsters</a>
            <a href="https://niti.gov.in" target="_blank" rel="noreferrer" className="hover:underline hover:text-slate-400 transition-colors">NITI Aayog</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
