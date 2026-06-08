import { useState, useEffect } from 'react';
import { Search, RefreshCw, ExternalLink, AlertCircle, Sparkles, Globe, Cpu, Building2, Code, Workflow, Server, TrendingUp, ChevronDown, ChevronUp, Database, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';
import fallbackData from '../data/news-cache.json';
import { getApiUrl } from '../utils/api';

export interface Article {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string;
  date: string;
  sentiment?: string;
  importance?: string;
}

interface NewsFeedProps {
  authToken: string | null;
  onAuthError: () => void;
  selectedCategory: string;
}

export default function NewsFeed({ authToken, onAuthError, selectedCategory }: NewsFeedProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Updates', icon: Globe },
    { id: 'ai-models', label: 'ML Models & AI', icon: Cpu },
    { id: 'big-tech', label: 'Big Tech', icon: Building2 },
    { id: 'dev-tools', label: 'Dev Tools & Coding', icon: Code },
    { id: 'mlops-devops', label: 'MLOps & DevOps', icon: Workflow },
    { id: 'hardware-gpus', label: 'Hardware & GPUs', icon: Server }
  ];

  // Date parsers
  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return 'Recent';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recent';
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  const formatLastUpdated = (dateStr: string) => {
    try {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleString();
    } catch {
      return '';
    }
  };

  const fetchNews = async (forceRefresh = false) => {
    const showSpinner = forceRefresh || articles.length === 0;
    if (showSpinner) {
      setLoading(true);
    }
    setError(null);
    try {
      const endpoint = forceRefresh ? '/api/refresh' : '/api/news';
      const headers: HeadersInit = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(getApiUrl(endpoint), {
        method: forceRefresh ? 'POST' : 'GET',
        headers
      });

      if (response.status === 401 || response.status === 403) {
        onAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to connect to local aggregator server.');
      }
      const data = await response.json();
      setArticles(data.articles || []);
      setLastUpdated(formatLastUpdated(data.lastUpdated));
      setUpdating(!!data.isSystemUpdating);
    } catch (err) {
      console.warn('Backend server not running. Falling back to static pre-seeded news database.', err);
      setArticles(fallbackData.articles || []);
      setLastUpdated(formatLastUpdated(fallbackData.lastUpdated));
      setUpdating(false);
      if (forceRefresh) {
        setError('Aggregator server offline. Showing pre-seeded daily archive.');
      }
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    let timeoutId: number;
    if (updating) {
      timeoutId = window.setTimeout(() => {
        fetchNews(false);
      }, 4000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [updating]);

  const handleRefresh = () => {
    fetchNews(true);
  };

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Category visual mapping with leading dots
  const getCategoryBadgeTheme = (cat: string) => {
    switch(cat) {
      case 'ai-models': 
        return { icon: Cpu, colorClass: 'text-cyan-400 bg-cyan-950/20 border-cyan-800/40', dotClass: 'bg-cyan-400 shadow-md shadow-cyan-400/50' };
      case 'big-tech': 
        return { icon: Building2, colorClass: 'text-blue-400 bg-blue-950/20 border-blue-800/40', dotClass: 'bg-blue-500 shadow-md shadow-blue-500/50' };
      case 'dev-tools': 
        return { icon: Code, colorClass: 'text-purple-400 bg-purple-950/20 border-purple-800/40', dotClass: 'bg-purple-400 shadow-md shadow-purple-400/50' };
      case 'mlops-devops': 
        return { icon: Workflow, colorClass: 'text-emerald-400 bg-emerald-950/20 border-emerald-800/40', dotClass: 'bg-emerald-400 shadow-md shadow-emerald-400/50' };
      case 'hardware-gpus': 
        return { icon: Server, colorClass: 'text-amber-400 bg-amber-950/20 border-amber-800/40', dotClass: 'bg-amber-400 shadow-md shadow-amber-400/50' };
      default: 
        return { icon: Globe, colorClass: 'text-cyan-400 bg-cyan-950/20 border-cyan-800/40', dotClass: 'bg-cyan-400 shadow-md shadow-cyan-400/50' };
    }
  };

  const getSentimentStyle = (sentiment?: string) => {
    if (!sentiment) return 'text-slate-400 bg-slate-800/40 border-slate-700/50';
    switch (sentiment) {
      case 'positive': return 'text-emerald-400 bg-emerald-950/30 border-emerald-900/30';
      case 'negative': return 'text-red-400 bg-red-950/30 border-red-900/30';
      default: return 'text-slate-400 bg-slate-800/40 border-slate-700/50';
    }
  };

  const calculateReadingTime = (text: string) => {
    const chars = text.length || 0;
    return Math.max(1, Math.ceil(chars / 150));
  };

  // Grouping for Bento Grid
  const heroArticle = filteredArticles.find(a => a.importance === 'high') || filteredArticles[0];
  const trendingArticles = filteredArticles.filter(a => a.id !== heroArticle?.id).slice(0, 5);
  const gridArticles = filteredArticles.filter(a => a.id !== heroArticle?.id && !trendingArticles.some(t => t.id === a.id));

  return (
    <div className="flex flex-col gap-8">
      
      {/* Editorial Search & Status Header */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-850 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-black/25">
        <div>
          <h2 className="text-lg font-serif font-bold text-white tracking-wide flex items-center gap-2 select-none">
            <span className="text-slate-400 font-mono text-xs uppercase tracking-wider">Current Desk:</span>
            <span className="text-red-500 font-extrabold capitalize">
              {categories.find(c => c.id === selectedCategory)?.label || selectedCategory}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Displaying {filteredArticles.length} filtered updates 
            {lastUpdated && <span className="text-slate-500 font-mono"> (Scraped: {lastUpdated})</span>}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Minimal Search Bar */}
          <div className="relative w-full sm:w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Search feed..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-red-500/50 rounded-lg pl-9 pr-4 py-1.5 text-xs outline-none transition-all placeholder:text-slate-500 font-medium"
            />
          </div>

          {/* Trigger Scraping */}
          <button 
            className="flex items-center gap-2 px-4 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white rounded-lg text-xs font-semibold tracking-wider uppercase transition-all select-none cursor-pointer"
            onClick={handleRefresh} 
            disabled={loading}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Aggregating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-950/20 border border-red-900/40 rounded-xl text-red-400 text-xs">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {updating && (
        <div className="flex items-center gap-3 p-4 bg-cyan-950/20 border border-cyan-900/40 rounded-xl text-cyan-400 text-xs animate-pulse">
          <RefreshCw size={16} className="animate-spin shrink-0" />
          <span>News aggregator pipeline is executing in the background...</span>
        </div>
      )}

      {filteredArticles.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-20 text-center text-slate-400 shadow-md">
          <AlertCircle size={40} className="mx-auto mb-4 text-slate-550" />
          <p className="font-serif text-xl text-slate-300 font-bold">Desk Empty</p>
          <p className="text-xs text-slate-500 mt-1">No technology updates match the current search filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* Bento Grid layout container (Variable cols & row spans) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[250px]">
            
            {/* 1. Hero Cover Card (2x2 Grid Space) */}
            {selectedCategory === 'all' && !searchQuery && heroArticle && (
              <div className="col-span-1 md:col-span-2 row-span-2 bg-slate-900/40 border border-slate-850 hover:border-red-500/35 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group relative shadow-2xl hover:shadow-[0_20px_50px_rgba(239,68,68,0.06)] hover:scale-[1.002]">
                
                {/* Visual Graphic Banner */}
                <div className="h-44 w-full bg-[#05070a] relative flex items-center justify-center border-b border-slate-850/60 overflow-hidden select-none">
                  {/* SVG background grid and fluid shape */}
                  <div className="absolute inset-0 opacity-25">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="hero-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#hero-grid)" />
                      
                      {/* Abstract technical glowing lines */}
                      <path d="M -10 100 Q 100 40 200 120 T 400 80 T 600 130" fill="none" stroke="rgba(239,68,68,0.12)" strokeWidth="2" />
                      <path d="M -10 110 Q 90 60 210 110 T 390 90 T 610 110" fill="none" stroke="rgba(34,211,238,0.08)" strokeWidth="1" />
                      
                      {/* Circular technical radar rings */}
                      <circle cx="85%" cy="30%" r="50" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                      <circle cx="85%" cy="30%" r="30" fill="none" stroke="rgba(239,68,68,0.02)" strokeWidth="1" />
                    </svg>
                  </div>
                  
                  {/* High-end gradient light leak */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(239,68,68,0.12),transparent_50%),radial-gradient(circle_at_20%_-20%,rgba(6,182,212,0.08),transparent_40%)]"></div>
                  
                  <div className="z-10 text-center flex flex-col items-center px-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase bg-red-500/10 border border-red-500/20 text-red-400 mb-2 select-none">
                      <Sparkles size={10} className="text-red-500 animate-pulse" />
                      <span>EDITORIAL SPOTLIGHT</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase select-none">
                      DESK FEED // UPDATED LIVE
                    </p>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between bg-slate-900/30">
                  <div>
                    <div className="flex items-center gap-3 text-xs mb-3 flex-wrap">
                      <span className="text-red-500 font-serif font-black uppercase text-xs tracking-wider">
                        {heroArticle.source}
                      </span>
                      <span className="text-slate-800">•</span>
                      <span className="text-slate-400 font-mono flex items-center gap-1 text-[11px]">
                        <Clock size={11} className="text-slate-500" />
                        <span>{formatDate(heroArticle.date)}</span>
                      </span>
                      <span className="text-slate-800">•</span>
                      <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                        <Clock size={11} className="text-slate-500" />
                        <span>{calculateReadingTime(heroArticle.summary)} min read</span>
                      </span>
                      {heroArticle.sentiment && (
                        <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getSentimentStyle(heroArticle.sentiment)}`}>
                          {heroArticle.sentiment}
                        </span>
                      )}
                    </div>
                    
                    <h1 
                      className="text-lg md:text-xl font-serif font-bold text-white hover:text-red-500 cursor-pointer leading-snug mb-3 transition-colors"
                      onClick={() => setExpandedArticle(expandedArticle === heroArticle.id ? null : heroArticle.id)}
                    >
                      {heroArticle.title}
                    </h1>
                    
                    <p className={`text-slate-400 text-xs leading-relaxed ${expandedArticle === heroArticle.id ? '' : 'line-clamp-3'}`}>
                      {heroArticle.summary}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-850/60">
                    <button 
                      onClick={() => setExpandedArticle(expandedArticle === heroArticle.id ? null : heroArticle.id)}
                      className="text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-0.5 select-none transition-colors cursor-pointer"
                    >
                      <span>{expandedArticle === heroArticle.id ? 'Collapse Summary' : 'Read Summary'}</span>
                      {expandedArticle === heroArticle.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    <a 
                      href={heroArticle.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-1.5 text-xs text-slate-455 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-950/80 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <span>Source</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Trending Sidebar Card (1x2 Grid Space) */}
            {selectedCategory === 'all' && !searchQuery && (
              <div className="col-span-1 row-span-2 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
                <h3 className="text-xs font-serif font-extrabold text-white tracking-wider uppercase border-b border-slate-850/65 pb-3 flex items-center gap-2 select-none">
                  <TrendingUp size={14} className="text-red-500" />
                  <span>Trending Now</span>
                </h3>
                
                <div className="flex flex-col divide-y divide-slate-850/50 overflow-y-auto flex-grow pr-1 scrollbar-none gap-1">
                  {trendingArticles.map((art, idx) => (
                    <div key={art.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3.5 group">
                      <span className="text-lg font-mono font-bold text-slate-700/60 group-hover:text-red-500 transition-colors select-none pt-0.5">
                        0{idx + 1}
                      </span>
                      
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mb-1 select-none font-mono uppercase">
                          <span className="font-extrabold text-slate-400 tracking-wider truncate max-w-[95px]">{art.source}</span>
                          <span>•</span>
                          <span>{formatDate(art.date).split(',')[0]}</span>
                        </div>
                        
                        <h4 
                          className="text-xs font-serif font-bold text-slate-200 hover:text-red-500 cursor-pointer leading-snug line-clamp-2 transition-colors"
                          onClick={() => setExpandedArticle(expandedArticle === art.id ? null : art.id)}
                        >
                          {art.title}
                        </h4>
                        
                        {expandedArticle === art.id && (
                          <div className="mt-2 text-[10px] text-slate-400 leading-relaxed bg-slate-950 p-2.5 border border-slate-850 rounded-lg animate-fade-in relative z-10">
                            <p>{art.summary}</p>
                            <a 
                              href={art.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-400"
                            >
                              <span>Read Source</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Telemetry/Stats Card (1x1 Grid Space) */}
            {selectedCategory === 'all' && !searchQuery && (
              <div className="col-span-1 row-span-1 bg-slate-900/40 border border-slate-855 hover:border-cyan-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative group transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/5 via-transparent to-transparent pointer-events-none"></div>
                <div>
                  <div className="flex justify-between items-center text-slate-500 mb-1 select-none">
                    <span className="text-[9px] uppercase font-bold tracking-wider font-mono">system.status</span>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <Database size={13} className="text-slate-605 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white font-mono mt-0.5 flex items-baseline gap-1">
                    {articles.length}
                    <span className="text-[10px] font-semibold text-slate-500 font-sans">articles</span>
                  </div>
                  
                  {/* Visual Scraping Logs/Bars Grid */}
                  <div className="flex gap-0.5 mt-2 h-3.5 items-end">
                    {[80, 100, 90, 70, 85, 100, 95, 60, 90, 100, 85, 95, 100].map((h, i) => (
                      <span 
                        key={i} 
                        style={{ height: `${h}%` }}
                        className={`flex-1 rounded-sm transition-all duration-300 ${
                          i === 12 && loading ? 'bg-cyan-500 animate-pulse' : 'bg-slate-800/80 group-hover:bg-slate-700'
                        }`}
                      ></span>
                    ))}
                  </div>
                  <p className="text-[8px] text-slate-500 mt-2 font-mono flex justify-between select-none">
                    <span>Uptime: 99.98%</span>
                    <span>Latency: 124ms</span>
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-slate-850/50 pt-2.5 mt-2">
                  <span className="text-[9px] font-mono text-slate-500 truncate max-w-[140px]">
                    Updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}
                  </span>
                  <button 
                    onClick={handleRefresh}
                    className="p-1 hover:bg-slate-950 hover:text-cyan-400 text-slate-450 border border-slate-850 hover:border-slate-800 rounded transition-all select-none cursor-pointer"
                    title="Refresh Scraper Feed"
                  >
                    <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>
            )}

            {/* 4. AI Replacement Matrix Promo Card (1x1 Grid Space) */}
            {selectedCategory === 'all' && !searchQuery && (
              <div className="col-span-1 row-span-1 bg-slate-900/40 border border-slate-855 hover:border-red-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative group transition-all duration-300 select-none cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-bl from-red-600/5 via-transparent to-transparent pointer-events-none"></div>
                <div>
                  <div className="flex justify-between items-center text-slate-500 mb-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider font-mono">ai.matrix</span>
                    <ShieldCheck size={14} className="text-slate-605 group-hover:text-red-500 transition-colors" />
                  </div>
                  <h4 className="text-xs font-serif font-extrabold text-white leading-snug">
                    Automation Benchmarks
                  </h4>
                  
                  {/* Dynamic Mini Chart */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    <div className="flex items-center justify-between text-[8px] text-slate-550 font-mono">
                      <span>UX Design iteration</span>
                      <span className="text-red-400 font-bold">15x</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-red-600 to-red-500 h-full rounded-full transition-all duration-500 w-[95%] group-hover:from-red-500 group-hover:to-red-400"></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-[8px] text-slate-555 font-mono">
                      <span>Boilerplate APIs</span>
                      <span className="text-red-400 font-bold">8x</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-red-650 to-red-500 h-full rounded-full transition-all duration-500 w-[75%] group-hover:from-red-500 group-hover:to-red-400"></div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-850/50 pt-2.5 flex items-center justify-between text-[11px] text-red-500 font-bold group-hover:text-red-450 transition-colors mt-2">
                  <span>Explore Metrics</span>
                  <ArrowUpRight size={13} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                </div>
              </div>
            )}

            {/* 5. Standard News Cards (1x1 and 2x1 Grid Spaces) */}
            {(selectedCategory === 'all' && !searchQuery ? gridArticles : filteredArticles).map((article, idx) => {
              const { colorClass, dotClass } = getCategoryBadgeTheme(article.category);
              
              // Dynamically set spans based on indexing to create an organic Dribbble layout
              const isWide = (idx % 3 === 0);
              const gridSpan = isWide ? 'col-span-1 md:col-span-2 row-span-1' : 'col-span-1 row-span-1';
              const readingTime = calculateReadingTime(article.summary);

              return (
                <div 
                  key={article.id} 
                  className={`bg-slate-900/50 backdrop-blur-md border border-slate-850 hover:border-red-500/35 rounded-2xl p-5 flex flex-col justify-between relative group hover:shadow-2xl hover:shadow-red-500/5 transition-all duration-300 hover:scale-[1.005] ${gridSpan}`}
                  style={{ animationDelay: `${idx * 0.04}s` }}
                >
                  {/* Subtle Gradient Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-red-650/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  <div>
                    {/* Header line */}
                    <div className="flex justify-between items-center mb-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${colorClass}`}>
                        <span className={`w-1 h-1 rounded-full ${dotClass}`}></span>
                        <span>{categories.find(c => c.id === article.category)?.label.split(' ')[0] || article.category}</span>
                      </span>

                      <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono">
                        <span>{formatDate(article.date)}</span>
                      </div>
                    </div>

                    {/* Critical flag */}
                    {article.importance === 'high' && (
                      <div className="mb-2 inline-flex items-center gap-1 text-[8px] bg-red-955/20 text-red-450 border border-red-900/20 px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase">
                        <Sparkles size={8} className="text-red-500" />
                        <span>CRITICAL</span>
                      </div>
                    )}

                    {/* Title */}
                    <h2 
                      className="text-sm md:text-base font-serif font-bold text-white hover:text-red-500 cursor-pointer leading-snug mb-2 line-clamp-2 transition-colors"
                      onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                    >
                      {article.title}
                    </h2>

                    {/* Summary */}
                    <p className={`text-slate-400 text-xs leading-relaxed ${expandedArticle === article.id ? '' : 'line-clamp-2'}`}>
                      {article.summary}
                    </p>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-850/60 relative z-10">
                    <button 
                      onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                      className="text-[11px] font-bold text-red-500 hover:text-red-400 flex items-center gap-0.5 select-none transition-colors cursor-pointer"
                    >
                      <span>{expandedArticle === article.id ? 'Collapse' : 'Read Brief'}</span>
                      {expandedArticle === article.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-mono text-slate-550 flex items-center gap-1">
                        <Clock size={9} />
                        <span>{readingTime} min</span>
                      </span>
                      
                      {article.sentiment && (
                        <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${getSentimentStyle(article.sentiment)}`}>
                          {article.sentiment}
                        </span>
                      )}
                      
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-1 bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded hover:text-red-550 transition-colors"
                        title="Original Article"
                      >
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
