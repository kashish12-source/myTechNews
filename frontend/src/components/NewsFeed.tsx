import { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, AlertCircle, Sparkles, Cpu, Building2, Code, Workflow, Server, ChevronDown, ChevronUp, Clock, Globe } from 'lucide-react';
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
  setSelectedCategory?: (cat: string) => void;
  searchQuery: string;
  setSearchQuery?: (q: string) => void;
  setActiveTab?: (tab: 'feed' | 'llm' | 'matrix') => void;
  userEmail?: string | null;
  onLogout?: () => void;
  theme?: 'dark' | 'light';
  setTheme?: (theme: 'dark' | 'light') => void;
}

export default function NewsFeed({ 
  authToken, 
  onAuthError, 
  selectedCategory,
  searchQuery
}: NewsFeedProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

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
      return d.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'Recent';
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
      setUpdating(!!data.isSystemUpdating);
    } catch (err) {
      console.warn('Backend server not running. Falling back to static pre-seeded news database.', err);
      setArticles(fallbackData.articles || []);
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
      }, 5000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [updating]);

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadgeTheme = (cat: string) => {
    switch(cat) {
      case 'ai-models': 
        return 'text-[#1a73e8] bg-[#e8f0fe] dark:text-[#8ab4f8] dark:bg-[#182a4d] border-blue-500/10';
      case 'big-tech': 
        return 'text-[#0f9d58] bg-[#e6f4ea] dark:text-[#81c995] dark:bg-[#133022] border-green-500/10';
      case 'dev-tools': 
        return 'text-[#ab47bc] bg-[#fae3fc] dark:text-[#d7aef2] dark:bg-[#341b42] border-purple-500/10';
      case 'mlops-devops': 
        return 'text-[#00acc1] bg-[#e2f7f9] dark:text-[#78d9ec] dark:bg-[#152e35] border-cyan-500/10';
      case 'hardware-gpus': 
        return 'text-[#e67c73] bg-[#feeeee] dark:text-[#f28b82] dark:bg-[#421b19] border-red-500/10';
      default: 
        return 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800 border-slate-500/10';
    }
  };

  const getSentimentStyle = (sentiment?: string) => {
    if (!sentiment) return 'text-slate-400 bg-slate-100 dark:bg-slate-800/50';
    switch (sentiment) {
      case 'positive': return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 border-emerald-500/10';
      case 'negative': return 'text-rose-500 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20 border-rose-500/10';
      default: return 'text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-900 border-slate-500/10';
    }
  };

  const calculateReadingTime = (text: string) => {
    const chars = text.length || 0;
    return Math.max(1, Math.ceil(chars / 180));
  };

  // Grouping structures
  const heroArticle = filteredArticles.find(a => a.importance === 'high') || filteredArticles[0];
  const secondaryArticles = filteredArticles.filter(a => a.id !== heroArticle?.id);


  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      
      {/* Dynamic aggregation/refresh feedback */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {updating && (
        <div className="flex items-center gap-3 p-3.5 bg-[#e8f0fe] dark:bg-[#182a4d] border border-blue-500/20 rounded-xl text-[#1a73e8] dark:text-[#8ab4f8] text-xs animate-pulse font-medium">
          <RefreshCw size={14} className="animate-spin shrink-0" />
          <span>News pipeline is crawling technical RSS feeds in the background...</span>
        </div>
      )}

      {/* Centered Articles Stream Container */}
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
          
          {loading ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-20 text-center flex flex-col items-center justify-center shadow-sm">
              <RefreshCw size={36} className="animate-spin text-[#1a73e8] mb-4" />
              <p className="text-sm font-semibold text-[var(--text-secondary)]">Retrieving updates...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-20 text-center text-slate-400 shadow-sm">
              <AlertCircle size={40} className="mx-auto mb-4 text-slate-500" />
              <p className="font-semibold text-lg text-[var(--text-primary)]">No articles found</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Try matching other keywords or select another category.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              
              {/* Spotlight Lead Article (Google News Spotlight styling) */}
              {heroArticle && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                  {/* Decorative glowing header graph container */}
                  <div className="h-40 w-full bg-[#03060a] relative overflow-hidden border-b border-[var(--border-color)]">
                    <div className="absolute inset-0 opacity-20">
                      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="grid-spotlight" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid-spotlight)" />
                        <path d="M -10 90 Q 150 20 300 110 T 600 70" fill="none" stroke="#1a73e8" strokeWidth="2" />
                      </svg>
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] to-transparent"></div>
                    
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase bg-[#1a73e8]/10 border border-[#1a73e8]/20 text-[#1a73e8] dark:text-[#8ab4f8]">
                      <Sparkles size={10} className="animate-pulse text-[#1a73e8] dark:text-[#8ab4f8]" />
                      <span>Spotlight Story</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs mb-3 flex-wrap text-[var(--text-secondary)]">
                      <span className="font-bold text-[#1a73e8] dark:text-[#8ab4f8] tracking-wide uppercase">{heroArticle.source}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {formatDate(heroArticle.date)}</span>
                      <span>•</span>
                      <span>{calculateReadingTime(heroArticle.summary)} min read</span>
                      {heroArticle.sentiment && (
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${getSentimentStyle(heroArticle.sentiment)}`}>
                          {heroArticle.sentiment}
                        </span>
                      )}
                    </div>

                    <a 
                      href={heroArticle.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="group"
                    >
                      <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] hover:text-[#1a73e8] dark:hover:text-[#8ab4f8] transition-colors leading-snug mb-3">
                        {heroArticle.title}
                      </h2>
                    </a>

                    <p className={`text-[var(--text-secondary)] text-sm leading-relaxed ${expandedArticle === heroArticle.id ? '' : 'line-clamp-3'}`}>
                      {heroArticle.summary}
                    </p>

                    <div className="flex justify-between items-center mt-5 pt-4 border-t border-[var(--border-color)]">
                      <button 
                        onClick={() => setExpandedArticle(expandedArticle === heroArticle.id ? null : heroArticle.id)}
                        className="text-xs font-semibold text-[#1a73e8] dark:text-[#8ab4f8] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>{expandedArticle === heroArticle.id ? 'Hide summary' : 'Show brief'}</span>
                        {expandedArticle === heroArticle.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      <a 
                        href={heroArticle.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-slate-400 dark:hover:border-slate-700 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                      >
                        <span>View Source</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid of normal news items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {secondaryArticles.map((article, idx) => {
                  const badgeClass = getCategoryBadgeTheme(article.category);
                  const readingTime = calculateReadingTime(article.summary);
                  const isExpanded = expandedArticle === article.id;

                  return (
                    <div 
                      key={article.id}
                      className="google-news-card"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div>
                        {/* Source and Category Badges */}
                        <div className="flex justify-between items-center mb-3 text-[10px] text-slate-500 font-mono">
                          <span className={`px-2 py-0.5 rounded border text-[9px] font-semibold tracking-wide ${badgeClass}`}>
                            {categories.find(c => c.id === article.category)?.label.split(' ')[0] || article.category}
                          </span>
                          <span>{formatDate(article.date).split(',')[0]}</span>
                        </div>

                        {/* Title */}
                        <a href={article.url} target="_blank" rel="noreferrer">
                          <h3 className="text-sm md:text-base font-bold text-[var(--text-primary)] hover:text-[#1a73e8] dark:hover:text-[#8ab4f8] transition-colors leading-snug line-clamp-2 mb-2">
                            {article.title}
                          </h3>
                        </a>

                        {/* Summary Block */}
                        <p className={`text-[var(--text-secondary)] text-xs leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {article.summary}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-[var(--border-color)] text-[10px]">
                        <button 
                          onClick={() => setExpandedArticle(isExpanded ? null : article.id)}
                          className="font-bold text-[#1a73e8] dark:text-[#8ab4f8] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Collapse' : 'Read summary'}</span>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>

                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="flex items-center gap-0.5"><Clock size={9} /> {readingTime} min</span>
                          <span>•</span>
                          <a 
                            href={article.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-1 border border-[var(--border-color)] rounded hover:bg-[var(--border-hover)] text-[var(--text-secondary)]"
                            title="Read original source"
                          >
                            <ExternalLink size={10} />
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

    </div>
  );
}


