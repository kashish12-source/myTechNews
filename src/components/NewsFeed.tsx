import { useState, useEffect } from 'react';
import { Search, RefreshCw, ExternalLink, Calendar, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import fallbackData from '../data/news-cache.json';

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

export default function NewsFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Updates' },
    { id: 'ai-models', label: 'ML Models & AI' },
    { id: 'big-tech', label: 'Big Tech' },
    { id: 'dev-tools', label: 'Dev Tools & Coding' },
    { id: 'mlops-devops', label: 'MLOps & DevOps' },
    { id: 'hardware-gpus', label: 'Hardware & GPUs' }
  ];

  const fetchNews = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = forceRefresh ? 'http://localhost:3001/api/refresh' : 'http://localhost:3001/api/news';
      const response = await fetch(endpoint, {
        method: forceRefresh ? 'POST' : 'GET',
      });
      if (!response.ok) {
        throw new Error('Failed to connect to local aggregator server.');
      }
      const data = await response.json();
      setArticles(data.articles || []);
      setLastUpdated(new Date(data.lastUpdated).toLocaleString());
    } catch (err) {
      console.warn('Backend server not running. Falling back to static pre-seeded news database.', err);
      // Fallback to static JSON
      setArticles(fallbackData.articles || []);
      setLastUpdated(new Date(fallbackData.lastUpdated).toLocaleString());
      if (forceRefresh) {
        setError('Aggregator server offline. Showing pre-seeded daily archive.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

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

  const getCategoryBadgeColor = (cat: string) => {
    switch(cat) {
      case 'ai-models': return 'badge-cyan';
      case 'big-tech': return 'badge-magenta';
      case 'dev-tools': return 'badge-purple';
      case 'mlops-devops': return 'badge-green';
      case 'hardware-gpus': return 'badge-cyan';
      default: return 'badge-cyan';
    }
  };

  const getImportanceBadge = (importance?: string) => {
    if (importance === 'high') {
      return (
        <span className="badge badge-magenta" style={{ border: '1px solid rgba(255, 0, 127, 0.4)', background: 'rgba(255, 0, 127, 0.15)' }}>
          <Sparkles size={10} /> Critical
        </span>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in">
      {/* Header Panel */}
      <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 className="font-tech glow-text" style={{ fontSize: '2.2rem', fontWeight: 800, background: 'linear-gradient(to right, #00f2fe, #7000ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
              DAILY TECH INTELLIGENCE
            </h1>
            <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} /> Serious, filtered technical updates. Meme-free zone. 
              {lastUpdated && <span style={{ color: 'var(--text-muted)' }}>• Updated: {lastUpdated}</span>}
            </p>
          </div>
          
          <button 
            className="btn btn-primary" 
            onClick={handleRefresh} 
            disabled={loading}
            style={{ minWidth: '150px' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Refreshing...' : 'Scrape Updates'}
          </button>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '8px', color: '#fda4af', fontSize: '0.9rem' }}>
            <AlertCircle size={18} />
            <div>
              <strong>Note:</strong> {error} Running on local static database file. Start the node server in `server/` to parse live feeds.
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
              <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input 
                type="text" 
                placeholder="Search articles, topics, or sources..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem',
                  boxShadow: selectedCategory === cat.id ? 'var(--glow-cyan)' : 'none',
                  background: selectedCategory === cat.id ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))' : 'rgba(255,255,255,0.03)'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="glass" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem', color: 'var(--accent-magenta)' }} />
          <h3>No serious updates found</h3>
          <p style={{ marginTop: '0.5rem' }}>Try refining your search query or trigger a news refresh.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredArticles.map((article, idx) => (
            <div 
              key={article.id} 
              className="glass animate-fade-in" 
              style={{ 
                padding: '1.75rem', 
                borderLeft: article.importance === 'high' ? '4px solid var(--accent-magenta)' : '1px solid var(--border-color)',
                animationDelay: `${idx * 0.05}s`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-purple">{article.source}</span>
                  <span className={`badge ${getCategoryBadgeColor(article.category)}`}>
                    {categories.find(c => c.id === article.category)?.label || article.category}
                  </span>
                  {getImportanceBadge(article.importance)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <Calendar size={12} />
                  {new Date(article.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                </div>
              </div>

              <h2 className="glow-text" style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}>
                {article.title}
              </h2>

              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.95rem', 
                lineHeight: '1.6', 
                marginTop: '0.75rem',
                display: expandedArticle === article.id ? 'block' : '-webkit-box',
                WebkitLineClamp: expandedArticle === article.id ? 'unset' : 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {article.summary}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '1rem' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  {expandedArticle === article.id ? 'Read Less' : 'Full Summary'}
                </button>

                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-outline-neon"
                  style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.375rem', textDecoration: 'none' }}
                >
                  Read Source <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* CSS Spin Keyframes inside React */}
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
