import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, LogOut, User, Search, Globe, Cpu, Building2, Code, Workflow, Server, TableProperties, BookOpen, Clock, RefreshCw } from 'lucide-react';
import NewsFeed from './components/NewsFeed';
import ReplacementMatrix from './components/ReplacementMatrix';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import SearchPage from './components/SearchPage';
import BrandLogo from './components/BrandLogo';


export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'matrix' | 'search'>('feed');
  const [previousTab, setPreviousTab] = useState<'feed' | 'matrix'>('feed');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  // Dynamic time state for navigation bottom panel
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Apply theme class to document body
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);



  if (!token) {
    if (!showLogin) {
      return (
        <LandingPage 
          onAccess={() => setShowLogin(true)} 
          theme={theme}
          setTheme={setTheme}
        />
      );
    }
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
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onBack={() => setShowLogin(false)}
        />
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
    { id: 'watch-later', label: 'Watch Later', icon: Clock, tab: 'feed' as const },
    { id: 'read-later', label: 'Read Later', icon: BookOpen, tab: 'feed' as const },
    { divider: true },
    { id: 'matrix', label: 'AI Replacement Matrix', icon: TableProperties, tab: 'matrix' as const }
  ];

  const handleNavClick = (item: typeof sidebarItems[0]) => {
    if ('divider' in item) return;
    if (item.tab === 'feed') {
      setActiveTab('feed');
      setSelectedCategory(item.id);
    } else {
      setActiveTab(item.tab as 'matrix');
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

  const renderBottomPanel = () => {
    return (
      <div className="mt-auto pt-2 flex items-center justify-start select-none relative shrink-0">
        <div className="flex items-center gap-4">
          {/* Theme Switcher */}
          <button 
            className="p-2 hover:bg-[var(--border-hover)] rounded-full text-[var(--text-secondary)] cursor-pointer transition-all border border-[var(--border-color)]"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? "Toggle Light Mode" : "Toggle Dark Mode"}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Search Trigger Icon */}
          <button 
            className={`p-2 hover:bg-[var(--border-hover)] rounded-full text-[var(--text-secondary)] cursor-pointer transition-all border border-[var(--border-color)] ${activeTab === 'search' ? 'text-brand-primary bg-brand-primary/10 border-brand-primary/20' : ''}`}
            onClick={() => {
              if (activeTab !== 'search') {
                setPreviousTab(activeTab as 'feed' | 'matrix');
                setActiveTab('search');
              } else {
                setActiveTab(previousTab);
              }
            }}
            title="Open Search Hub"
          >
            <Search size={17} />
          </button>

          {/* Profile Menu Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-full border border-[var(--border-color)] hover:border-brand-primary cursor-pointer flex items-center justify-center bg-slate-200 dark:bg-slate-800 transition-all shadow-inner"
              title="User Account"
            >
              <User size={15} className="text-[var(--text-secondary)]" />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-5 z-50 flex flex-col items-center text-xs animate-fade-in">
                {/* Circular Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary text-white flex items-center justify-center text-lg font-bold shadow-md select-none mb-3">
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
      </div>
    );
  };

  const getHeaderDateTime = () => {
    const day = currentTime.toLocaleDateString(undefined, { weekday: 'short' });
    const d = currentTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const t = currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    return `${day}, ${d} • ${t}`;
  };



  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-150 font-sans selection:bg-[var(--accent-blue)] selection:text-white dark:selection:text-black">
      
      {/* 1. Thicker & Contrasting Center Logo Header */}
      <header className="bg-slate-950 dark:bg-black text-white sticky top-0 z-50 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-[var(--border-color)] select-none h-14 sm:h-16 shadow-md transition-all duration-300">
        
        {/* Left Section: Mobile Menu Button */}
        <div className="flex items-center w-1/4">
          <button 
            onClick={() => setIsMobileDrawerOpen(true)}
            className="md:hidden p-2 hover:bg-[var(--border-hover)] rounded-full text-[var(--text-secondary)] cursor-pointer"
            title="Open navigation menu"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Center Section: Logo & Brand Name Centered */}
        <div className="flex items-center justify-center gap-2.5 select-none w-2/4">
          <BrandLogo size={34} className="rounded-xl shadow-xs transition-all duration-300" />
          <span className="text-lg sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            myTechNews
          </span>
        </div>

        {/* Right Section: Refresh button + Date & Time display */}
        <div className="flex items-center justify-end gap-3.5 w-1/4">
          {/* Header Refresh Button */}
          {activeTab === 'feed' && (
            <button 
              className="p-2 hover:bg-slate-800 rounded-full text-slate-350 hover:text-white cursor-pointer transition-all"
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              title="Refresh News Feed"
            >
              <RefreshCw size={17} />
            </button>
          )}

          {/* Date & Time display in header */}
          <div className="text-xs font-mono text-slate-350 font-medium select-none whitespace-nowrap bg-slate-900 px-3.5 py-1.5 rounded-full border border-slate-800 shadow-inner hidden sm:block">
            {getHeaderDateTime()}
          </div>
        </div>
      </header>

      {/* 2. Top Ticker marquee removed */}

      {/* 3. Main Dashboard Frame (Sidebar + Content Panel) */}
      <div className="flex-1 flex w-full relative">
        
        {/* Left Sidebar Navigation (Desktop) */}
        <aside className="w-[280px] shrink-0 border-r border-[var(--border-color)] py-6 px-4 hidden md:flex flex-col gap-1 bg-[var(--bg-primary)] h-[calc(100vh-56px)] sticky top-14 sm:top-16">
          <div className="flex-grow flex flex-col gap-1 overflow-y-auto pr-1">
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
          </div>
          {renderBottomPanel()}
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
              <div className="flex justify-between items-center px-6 mb-4 shrink-0">
                <span className="font-bold text-lg text-[var(--text-primary)]">Categories</span>
                <button 
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 hover:bg-[var(--border-hover)] rounded-full text-[var(--text-secondary)]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto px-4">
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

              <div className="px-4 shrink-0">
                {renderBottomPanel()}
              </div>
            </div>
          </div>
        )}

        {/* Right Main Content Pane */}
        <main className="flex-grow p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto max-w-full">
          {/* Header context indicator */}


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
                refreshTrigger={refreshTrigger}
              />
            )}
            
            {activeTab === 'matrix' && (
              <ReplacementMatrix 
                searchQuery={searchQuery}
              />
            )}
            
            {activeTab === 'search' && (
              <SearchPage 
                authToken={token}
                userEmail={userEmail}
                onBack={() => setActiveTab(previousTab)}
              />
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
