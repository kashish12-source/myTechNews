import { Cpu, Globe, Layers, TableProperties, ShieldAlert, Sparkles, Sun, Moon } from 'lucide-react';
import BrandLogo from './BrandLogo';


interface LandingPageProps {
  onAccess: () => void;
  theme?: 'dark' | 'light';
  setTheme?: (theme: 'dark' | 'light') => void;
}

export default function LandingPage({ onAccess, theme, setTheme }: LandingPageProps) {
  const features = [
    {
      icon: Globe,
      title: 'Aggregated Feeds',
      description: 'Crawls technical RSS feeds and updates concurrently from 28+ tech logs, hacker networks, policies, and research portals.'
    },
    {
      icon: Cpu,
      title: 'Gemini AI Enrichment',
      description: 'Automatically summarizes content, extracts core findings, determines key sentiments, and tags importance levels using Gemini.'
    },
    {
      icon: TableProperties,
      title: 'AI Replacement Matrix',
      description: 'Provides a structured dashboard analyzing role automation thresholds, setup difficulties, productivity multiples, and prompt files.'
    },
    {
      icon: Layers,
      title: 'LLM Architecture Inspector',
      description: 'Delivers detailed visual specifications and node-by-node parameters of deep learning transformer mechanics.'
    }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-brand-primary selection:text-white relative overflow-hidden">
      
      {/* 1. Header */}
      <header className="w-full bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-6 py-4 flex items-center justify-between z-50 select-none shadow-sm">
        <div className="flex items-center gap-2.5">
          <BrandLogo size={34} className="rounded-xl shadow-xs transition-all duration-300" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent font-sans">
            myTechNews
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {setTheme && theme && (
            <button 
              className="p-2 border border-[var(--border-color)] hover:border-[var(--border-hover)] rounded-full text-[var(--text-secondary)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? "Toggle Light Mode" : "Toggle Dark Mode"}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}
          
          <button
            onClick={onAccess}
            className="px-5 py-2 bg-brand-primary hover:bg-brand-accent text-white text-xs font-bold rounded-full shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all cursor-pointer"
          >
            Access Portal
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="flex-1 max-w-5xl mx-auto w-full px-6 py-16 md:py-24 flex flex-col items-center justify-center text-center relative z-25">
        
        {/* Dynamic Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-primary/10 border border-brand-primary/20 text-brand-primary mb-6 animate-pulse select-none">
          <ShieldAlert size={12} />
          <span>Real-time crawler engine active</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold font-serif leading-tight tracking-tight max-w-4xl text-[var(--text-primary)]">
          The Hub for Serious{' '}
          <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            Technical Intelligence
          </span>
        </h1>
        
        <p className="text-sm md:text-base text-[var(--text-secondary)] mt-6 max-w-2xl leading-relaxed font-medium">
          Ditch the memes and algorithmically polluted feeds. Ingest curated technical documents, policy whitepapers, arXiv research, and GitHub commits parsed autonomously by Gemini.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto">
          <button
            onClick={onAccess}
            className="px-8 py-3 bg-brand-primary hover:bg-brand-accent text-white text-sm font-bold rounded-xl shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all cursor-pointer"
          >
            Get Started
          </button>
          <a
            href="https://github.com/kashish12-source/myTechNews"
            target="_blank"
            rel="noreferrer"
            className="px-8 py-3 bg-transparent border border-[var(--border-color)] hover:border-[var(--border-hover)] text-[var(--text-primary)] text-sm font-bold rounded-xl hover:bg-[var(--bg-card-hover)] transition-all flex items-center justify-center gap-2"
          >
            View GitHub Source
          </a>
        </div>

        {/* 3. Visual Mockup Frame */}
        <div className="w-full mt-16 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden shadow-2xl relative select-none">
          <div className="h-10 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/30"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/30"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/30"></div>
          </div>
          <div className="p-8 text-left bg-gradient-to-br from-[var(--mesh-gradient-from,#000)] via-[var(--mesh-gradient-via,#050806)] to-[var(--mesh-gradient-to,#000)] flex flex-col gap-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-brand-primary/10 border border-brand-primary/25 text-brand-primary w-fit">
              <Sparkles size={11} className="animate-pulse" />
              <span>Spotlight Preview</span>
            </div>
            
            <div className="max-w-2xl">
              <h3 className="text-xl md:text-2xl font-bold font-serif text-[var(--text-primary)] leading-tight">
                How Fable 5 And Mythos 5 Change AI Security, Data Retention, And Vendor Risk
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed max-w-xl">
                Anthropic's Fable 5 is the most robust model launch of the year, providing complete static security checking and sandboxed code execution natively.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mt-24 text-left">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-brand-primary/30 p-6 rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/15 flex items-center justify-center text-brand-primary mb-4">
                  <Icon size={18} />
                </div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">{feat.title}</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>

      </section>

      {/* 5. Footer */}
      <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] py-8 text-center text-xs text-slate-500 select-none">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
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
