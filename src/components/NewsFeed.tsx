import { useState, useEffect } from 'react';
import { Search, RefreshCw, ExternalLink, Calendar, AlertCircle, Sparkles, Globe, Cpu, Building2, Code, Workflow, Server } from 'lucide-react';
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
}

export default function NewsFeed({ authToken, onAuthError }: NewsFeedProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

  // Robust Date Parsers to prevent mobile Safari/Chrome RangeErrors
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
    // Show spinner if we have no articles yet, or if it is a manual force refresh
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

  // Poll for updates if the backend is actively aggregating
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

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'ai-models': return Cpu;
      case 'big-tech': return Building2;
      case 'dev-tools': return Code;
      case 'mlops-devops': return Workflow;
      case 'hardware-gpus': return Server;
      default: return Globe;
    }
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch(cat) {
      case 'ai-models': return 'badge-cyan';
      case 'big-tech': return 'badge-blue';
      case 'dev-tools': return 'badge-purple';
      case 'mlops-devops': return 'badge-emerald';
      case 'hardware-gpus': return 'badge-amber';
      default: return 'badge-cyan';
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Editorial Header Panel */}
      <div className="glass" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="title-header">
              Daily Feed
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              Serious, meme-filtered technical intelligence 
              {lastUpdated && <span style={{ color: 'var(--text-muted)' }}> • Aggregated: {lastUpdated}</span>}
            </p>
          </div>
          
          <button 
            className="btn btn-secondary" 
            onClick={handleRefresh} 
            disabled={loading}
            style={{ padding: '0.45rem 1rem', fontSize: '0.75rem', borderRadius: '4px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Aggregating...' : 'Refresh Sources'}
          </button>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: '6px', color: 'var(--accent-rose)', fontSize: '0.8rem' }}>
            <AlertCircle size={14} />
            <span>{error} running on local backup database cache.</span>
          </div>
        )}

        {updating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: '6px', color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>
            <RefreshCw size={14} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
            <span>Aggregator is fetching latest news updates in background...</span>
          </div>
        )}

        {/* Search & Tooltip Icon Categories */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
          
          {/* Minimal Search Input */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={14} />
            <input 
              type="text" 
              placeholder="Search feed..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.2rem', paddingRight: '0.75rem', paddingBlock: '0.45rem', fontSize: '0.8rem', borderRadius: '4px' }}
            />
          </div>

          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>

          {/* Iconised Category Selection bar */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <div key={cat.id} className="tooltip">
                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    className="btn"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '4px',
                      padding: 0,
                      background: isSelected ? 'var(--accent-blue)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      border: isSelected ? 'none' : '1px solid var(--border-color)',
                      boxShadow: 'none'
                    }}
                  >
                    <IconComp size={16} />
                  </button>
                  <span className="tooltip-text">{cat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Clean, high-readability Feed list */}
      {filteredArticles.length === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', borderRadius: '8px' }}>
          <AlertCircle size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--text-muted)' }} />
          <p style={{ fontSize: '0.85rem' }}>No technical updates match your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredArticles.map((article, idx) => {
            const CatIcon = getCategoryIcon(article.category);
            const badgeClass = getCategoryBadgeClass(article.category);
            
            return (
              <div 
                key={article.id} 
                className="glass animate-fade-in" 
                style={{ 
                  padding: '1.25rem 1.5rem', 
                  borderRadius: '8px',
                  animationDelay: `${idx * 0.04}s`,
                  position: 'relative'
                }}
              >
                {/* Meta details header line */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Category Icon with Tooltip */}
                    <div className="tooltip">
                      <span className={`badge ${badgeClass}`} style={{ width: '24px', height: '24px', borderRadius: '4px', padding: 0, justifyContent: 'center' }}>
                        <CatIcon size={12} />
                      </span>
                      <span className="tooltip-text">
                        {categories.find(c => c.id === article.category)?.label || article.category}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {article.source}
                    </span>

                    {article.importance === 'high' && (
                      <span className="badge badge-rose" style={{ border: 'none', background: 'rgba(244,63,94,0.06)', padding: '0.1rem 0.35rem', fontSize: '0.65rem' }}>
                        <Sparkles size={8} /> CRITICAL
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                    <Calendar size={10} />
                    {formatDate(article.date)}
                  </div>
                </div>

                {/* Compact Article Title */}
                <h2 
                  style={{ 
                    fontSize: '1.05rem', 
                    fontWeight: 600, 
                    margin: '0.35rem 0 0.5rem', 
                    color: 'var(--text-primary)', 
                    cursor: 'pointer',
                    lineHeight: '1.4'
                  }} 
                  onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                >
                  {article.title}
                </h2>

                {/* Readability content block */}
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.85rem', 
                  lineHeight: '1.55', 
                  display: expandedArticle === article.id ? 'block' : '-webkit-box',
                  WebkitLineClamp: expandedArticle === article.id ? 'unset' : 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  marginTop: '0.25rem'
                }}>
                  {article.summary}
                </p>

                {/* Subtle Actions bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.02)', paddingTop: '0.75rem' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem', borderRadius: '4px' }}
                  >
                    {expandedArticle === article.id ? 'Collapse Summary' : 'Read Summary'}
                  </button>

                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn btn-outline-neon"
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.7rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}
                  >
                    Source <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
