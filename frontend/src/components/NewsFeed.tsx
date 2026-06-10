import { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, AlertCircle, Clock, Bookmark } from 'lucide-react';
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
  setActiveTab?: (tab: 'feed' | 'matrix' | 'search') => void;
  userEmail?: string | null;
  onLogout?: () => void;
  theme?: 'dark' | 'light';
  setTheme?: (theme: 'dark' | 'light') => void;
  refreshTrigger?: number;
}

export default function NewsFeed({ 
  authToken, 
  onAuthError, 
  selectedCategory,
  searchQuery,
  userEmail,
  refreshTrigger
}: NewsFeedProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  // Bookmarking states
  const [watchLaterIds, setWatchLaterIds] = useState<string[]>([]);
  const [readLaterIds, setReadLaterIds] = useState<string[]>([]);

  const loadSavedArticles = async () => {
    const emailKey = userEmail || 'guest';
    
    // Load local storage fallback immediately for offline/guest mode
    const wl = localStorage.getItem(`watch_later_${emailKey}`);
    const rl = localStorage.getItem(`read_later_${emailKey}`);
    if (wl) setWatchLaterIds(JSON.parse(wl));
    if (rl) setReadLaterIds(JSON.parse(rl));

    if (!authToken || !userEmail) return;
    try {
      const response = await fetch(getApiUrl('/api/saved'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setWatchLaterIds(data.watch_later || []);
        setReadLaterIds(data.read_later || []);
        localStorage.setItem(`watch_later_${emailKey}`, JSON.stringify(data.watch_later || []));
        localStorage.setItem(`read_later_${emailKey}`, JSON.stringify(data.read_later || []));
        return;
      }
    } catch (err) {
      console.warn('Backend server offline, loading bookmarks from local storage', err);
    }
  };

  const toggleSaved = async (articleId: string, listType: 'watch_later' | 'read_later') => {
    const emailKey = userEmail || 'guest';
    
    // Dynamic optimistic local updates
    let updatedIds: string[] = [];
    if (listType === 'watch_later') {
      updatedIds = watchLaterIds.includes(articleId)
        ? watchLaterIds.filter(id => id !== articleId)
        : [...watchLaterIds, articleId];
      setWatchLaterIds(updatedIds);
      localStorage.setItem(`watch_later_${emailKey}`, JSON.stringify(updatedIds));
    } else {
      updatedIds = readLaterIds.includes(articleId)
        ? readLaterIds.filter(id => id !== articleId)
        : [...readLaterIds, articleId];
      setReadLaterIds(updatedIds);
      localStorage.setItem(`read_later_${emailKey}`, JSON.stringify(updatedIds));
    }

    if (!authToken || !userEmail) return;

    try {
      const response = await fetch(getApiUrl('/api/saved/toggle'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ article_id: articleId, list_type: listType })
      });
      if (response.ok) {
        const data = await response.json();
        setWatchLaterIds(data.watch_later || []);
        setReadLaterIds(data.read_later || []);
        localStorage.setItem(`watch_later_${emailKey}`, JSON.stringify(data.watch_later || []));
        localStorage.setItem(`read_later_${emailKey}`, JSON.stringify(data.read_later || []));
      }
    } catch (err) {
      console.warn('Failed to sync bookmark toggle with server, saved locally', err);
    }
  };

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

      if (response.ok) {
        const data = await response.json();
        const liveArticles = data.articles || [];

        // If API returned OK but 0 articles on a hosted deployment, use bundled fallback
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (liveArticles.length === 0 && !isLocalhost && fallbackData.articles?.length > 0) {
          setArticles(fallbackData.articles);
        } else {
          setArticles(liveArticles);
        }
        setUpdating(!!data.isSystemUpdating);
        return;
      }

      // If auth fails on a hosted deployment (no local backend), fall back to cache
      if (response.status === 401 || response.status === 403) {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocalhost) {
          onAuthError();
          return;
        }
        // On Vercel/hosted: fall through to fallback data
      }

      throw new Error('Failed to connect to local aggregator server.');
    } catch (err) {
      console.warn('Backend server not running. Falling back to static pre-seeded daily archive.', err);
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
    loadSavedArticles();
  }, [authToken, userEmail]);

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

  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchNews(true);
    }
  }, [refreshTrigger]);

  const filteredArticles = articles.filter(article => {
    let matchesCategory = false;
    if (selectedCategory === 'watch-later') {
      matchesCategory = watchLaterIds.includes(article.id);
    } else if (selectedCategory === 'read-later') {
      matchesCategory = readLaterIds.includes(article.id);
    } else {
      matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    }
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadgeTheme = (_cat: string) => {
    return 'text-[var(--text-secondary)] border-[var(--border-color)] bg-[var(--bg-secondary)]';
  };



  const calculateReadingTime = (text: string) => {
    const chars = text.length || 0;
    return Math.max(1, Math.ceil(chars / 180));
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs font-semibold">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="w-full max-w-none flex flex-col gap-8">

          {loading ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-20 text-center flex flex-col items-center justify-center shadow-sm">
              <RefreshCw size={36} className="animate-spin text-brand-primary mb-4" />
              <p className="text-sm font-semibold text-[var(--text-secondary)]">Retrieving updates...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-20 text-center text-slate-400 shadow-sm">
              <AlertCircle size={40} className="mx-auto mb-4 text-slate-500" />
              <p className="font-semibold text-lg text-[var(--text-primary)]">
                {selectedCategory === 'watch-later' 
                  ? 'No watch later articles saved' 
                  : selectedCategory === 'read-later' 
                    ? 'No read later articles saved' 
                    : 'No articles found'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {selectedCategory === 'watch-later'
                  ? 'Click the Clock icon on any news card to add it to this list.'
                  : selectedCategory === 'read-later'
                    ? 'Click the Bookmark icon on any news card to add it to this list.'
                    : 'Try matching other keywords or select another category.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Grid of news items taking complete space */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {filteredArticles.map((article, idx) => {
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
                        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[var(--border-color)]/60">
                          <div className="flex items-center gap-2">
                            <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase select-none ${
                              article.source.toLowerCase().includes('hacker') ? 'bg-orange-500' :
                              article.source.toLowerCase().includes('lobster') ? 'bg-rose-500' :
                              article.source.toLowerCase().includes('crunch') ? 'bg-emerald-500' :
                              article.source.toLowerCase().includes('wired') ? 'bg-cyan-600' : 'bg-brand-primary'
                            }`}>
                              {article.source.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-[10px] text-[var(--text-primary)] leading-none">{article.source}</span>
                              <span className="text-[8.5px] text-[var(--text-muted)] mt-0.5">{formatDate(article.date).split(',')[0]}</span>
                            </div>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold tracking-wide ${badgeClass}`}>
                            {article.category.replace('-', ' ')}
                          </span>
                        </div>

                        {/* Title */}
                        <a href={article.url} target="_blank" rel="noreferrer">
                          <h3 className="text-base font-serif font-bold text-[var(--text-primary)] hover:text-brand-primary transition-colors leading-snug line-clamp-2 mb-2.5">
                            {article.title}
                          </h3>
                        </a>

                        {/* Summary Block */}
                        <p className={`text-[var(--text-secondary)] text-xs leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {article.summary}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center mt-5 pt-3 border-t border-[var(--border-color)] text-[10px]">
                        <button 
                          onClick={() => setExpandedArticle(isExpanded ? null : article.id)}
                          className="font-bold text-brand-primary hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-none p-0"
                        >
                          <span>{isExpanded ? 'Collapse' : 'Read summary'}</span>
                        </button>

                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                          <button
                            onClick={() => toggleSaved(article.id, 'watch_later')}
                            className={`p-1 border rounded hover:bg-[var(--border-hover)] cursor-pointer transition-all ${
                              watchLaterIds.includes(article.id)
                                ? 'bg-amber-500/10 border-amber-500/25 text-amber-500 hover:bg-amber-500/20'
                                : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                            title={watchLaterIds.includes(article.id) ? "Remove from Watch Later" : "Watch Later"}
                          >
                            <Clock size={10} className={watchLaterIds.includes(article.id) ? "fill-amber-500/25" : ""} />
                          </button>

                          <button
                            onClick={() => toggleSaved(article.id, 'read_later')}
                            className={`p-1 border rounded hover:bg-[var(--border-hover)] cursor-pointer transition-all ${
                              readLaterIds.includes(article.id)
                                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500 hover:bg-emerald-500/20'
                                : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                            title={readLaterIds.includes(article.id) ? "Remove from Read Later" : "Read Later"}
                          >
                            <Bookmark size={10} className={readLaterIds.includes(article.id) ? "fill-emerald-500/25" : ""} />
                          </button>

                          <span className="text-[var(--text-muted)] opacity-50">•</span>

                          <span className="flex items-center gap-0.5"><Clock size={10} /> {readingTime} min</span>
                          
                          <span className="text-[var(--text-muted)] opacity-50">•</span>
                          
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
