import { useMemo } from 'react';
import { ArrowRight, BrainCircuit, Code, Clock, Sparkles, Newspaper, ExternalLink, ChevronDown, Lock } from 'lucide-react';
import BrandLogo from './BrandLogo';
import fallbackData from '../data/news-cache.json';
import collaborativeWorkspaceImg from '../assets/collaborative_workspace.png';
import hackerNewsMockupImg from '../assets/hacker_news_mockup.png';
import nitiAayogMockupImg from '../assets/niti_aayog_mockup.png';
import infrastructureMockupImg from '../assets/infrastructure_mockup.png';

export default function LandingPage({ onAccess }: LandingPageProps) {
  // Safe import / mock fallback for the top 3 live articles preview
  const previewArticles = useMemo(() => {
    const rawList = fallbackData?.articles || [];
    if (rawList.length > 0) {
      return rawList.slice(0, 3);
    }
    // High-quality mock articles in case server cache is empty
    return [
      {
        id: 'mock1',
        title: 'NVIDIA Blackwell B200 GPUs Set New Hardware Performance Records',
        source: 'Hacker News',
        category: 'hardware-gpus',
        date: new Date().toISOString(),
        summary: 'NVIDIA\'s new Blackwell silicon architecture demonstrates up to 30x faster LLM inference speeds compared to the Hopper H100, marking a major milestone in physical AI compute scaling.'
      },
      {
        id: 'mock2',
        title: 'Gemini 2.5 Flash Releases with Buttery-Smooth Sub-100ms Latency',
        source: 'TechCrunch AI',
        category: 'ai-models',
        date: new Date().toISOString(),
        summary: 'Google\'s newest generative model introduces ultra-fast JSON structured output and 2M token context windows, drastically reducing agent loop latency for complex web aggregators.'
      },
      {
        id: 'mock3',
        title: 'Vite 6.0 Officially Released with Rolldown-Backed Hot Module Reloading',
        source: 'Lobsters',
        category: 'dev-tools',
        date: new Date().toISOString(),
        summary: 'The Vite core team announces the stable release of Vite 6.0, integrating Rolldown for near-instant build compilations, reducing javascript bundle sizes by up to 75% for modern web apps.'
      }
    ];
  }, []);

  const stats = [
    { value: '28+', label: 'Sources' },
    { value: '30', label: 'Articles / cycle' },
    { value: '<5s', label: 'Pipeline speed' },
    { value: '24/7', label: 'Cron uptime' }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-black text-white font-sans selection:bg-emerald-500/30 relative overflow-x-hidden">

      {/* ── Top Dark Glassmorphic Navigation Header (Sleek Developer Aesthetic) ── */}
      <header className="w-full bg-black/90 text-white border-b border-white/5 py-4.5 px-6 sm:px-12 flex items-center justify-between select-none z-50 sticky top-0 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2.5">
            <BrandLogo size={28} className="rounded-lg" />
            <span className="text-xl font-extrabold tracking-tight text-white">
              myTechNews
            </span>
          </div>
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#builders" className="hover:text-white transition-colors">For Builders</a>
            <a href="#analysts" className="hover:text-white transition-colors">For Analysts</a>
            <a href="#preview" className="hover:text-white transition-colors">Live Newsroom</a>
            <a href="#stats" className="hover:text-white transition-colors">Platform Stats</a>
          </nav>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={onAccess}
            className="px-6 py-2.5 bg-[#10b981] hover:bg-[#0d9668] text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
          >
            Access Portal
          </button>
        </div>
      </header>

      {/* ── First Fold: Immersive Dark Hero Banner (Grammarly Dual-Column) ── */}
      <section className="relative w-full bg-black lg:h-[calc(100vh-74px)] lg:min-h-[720px] py-16 lg:py-0 px-8 sm:px-16 lg:px-24 flex-none flex flex-col items-center justify-center border-b border-white/5 shrink-0 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Real-time Indicator Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 select-none">
              <Sparkles size={11} />
              <span>Real-time Technical Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.15] tracking-tight text-white select-none">
              AI Your Technical Feed
              <br />
              Can Run With
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-slate-400 mt-8 max-w-xl leading-relaxed font-normal">
              myTechNews combines AI-enriched summarization with multi-source technical aggregation to keep your engineering and business teams aligned. Experience real-time technical intelligence without the noise, memes, or distractions.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-5 w-full">
              <button
                onClick={onAccess}
                className="px-10 py-4 bg-white hover:bg-slate-100 text-[#0b0f19] text-sm font-extrabold rounded-xl shadow-xl shadow-white/5 transition-all hover:scale-[1.02] active:scale-[0.98] duration-200 cursor-pointer flex items-center justify-center gap-2.5 mx-auto lg:mx-0"
              >
                Access Portal
                <ArrowRight size={18} />
              </button>
              
              <button
                onClick={() => {
                  const el = document.getElementById('builders');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-3.5 bg-transparent hover:bg-white/5 text-white text-sm font-bold rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer text-center mx-auto lg:mx-0"
              >
                Explore Features
              </button>
            </div>
          </div>

          {/* Right Column: Premium Product Mockup (Grammarly style overlays with Custom Photo) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative mt-10 lg:mt-0">
            
            {/* Soft decorative card glow */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-emerald-500/5 to-blue-500/5 blur-2xl opacity-70 pointer-events-none" />
            
            {/* Browser Mockup Window */}
            <div className="w-full max-w-[440px] bg-[#111827] border border-slate-855 rounded-2xl shadow-2xl relative z-10 select-none overflow-hidden hover:border-emerald-500/30 transition-all duration-300">
              
              {/* Browser Header Bar */}
              <div className="w-full bg-[#1f2937] px-4 py-3 border-b border-slate-855 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-550"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-550"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-550"></div>
                <div className="flex-1 bg-[#111827] rounded-md h-5 text-[9px] text-slate-500 flex items-center px-3 font-mono truncate ml-2">
                  mytechnews.app/feed
                </div>
              </div>
              
              {/* Product Photo Background */}
              <div className="relative w-full h-[200px] overflow-hidden">
                <img 
                  src={collaborativeWorkspaceImg} 
                  alt="Engineers collaborating on tech news feed" 
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/20 to-transparent" />
              </div>

              {/* Mock Interface Content */}
              <div className="p-6 pt-3">
                {/* Title */}
                <h3 className="text-sm font-bold text-white leading-snug mb-2">
                  maestro: Lightweight, Linux-compatible kernel, written in Rust
                </h3>

                {/* Summary */}
                <p className="text-[11px] text-slate-450 leading-relaxed mb-4">
                  Latest technical updates and discussions from Hacker News covering "maestro". Tap the link to view the full details and community commentary.
                </p>
                
                {/* Mock Interface Tags */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 rounded-md text-[8.5px] font-bold text-emerald-400">✦ Gemini Summarized</span>
                  <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/25 rounded-md text-[8.5px] font-bold text-blue-400">✓ Noise Filtered</span>
                </div>
              </div>

              {/* Floating Grammarly-style Interactive Bubbles */}
              {/* Bubble 1 */}
              <div className="absolute top-[140px] -right-3 bg-white border border-slate-200 text-slate-900 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold z-20 hover:scale-105 transition-transform">
                <div className="w-5 h-5 rounded-full bg-[#10b981] text-white flex items-center justify-center text-[10px]">✦</div>
                <span>Sound technical</span>
              </div>

              {/* Bubble 2 */}
              <div className="absolute top-[250px] -left-5 bg-slate-900 border border-slate-850 text-white px-3.5 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-[10px] font-semibold z-20 hover:scale-105 transition-transform">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Filtered 15+ memes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bouncing Scroll Cue Indicator */}
        <div className="absolute bottom-6 hidden lg:flex flex-col items-center gap-1.5 text-slate-500 animate-bounce select-none z-10">
          <span className="text-[10px] font-bold uppercase tracking-widest">Scroll to explore</span>
          <ChevronDown size={16} className="text-slate-400" />
        </div>
      </section>

      {/* ── Second Fold: Partner Logo Banner (Monochrome / Sober) ── */}
      <section className="w-full bg-black py-16 px-6 border-b border-white/5 select-none shrink-0">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold mb-8">Trusted by technical minds at</p>
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8 opacity-40 hover:opacity-70 transition-opacity duration-300">
            <span className="text-xs font-black tracking-[0.25em] text-white">HACKER NEWS</span>
            <span className="text-xs font-black tracking-[0.25em] text-white">ARXIV PREPRINTS</span>
            <span className="text-xs font-black tracking-[0.25em] text-white">TECHCRUNCH</span>
            <span className="text-xs font-black tracking-[0.25em] text-white">OPENREVIEW</span>
            <span className="text-xs font-black tracking-[0.25em] text-white">NITI AAYOG</span>
            <span className="text-xs font-black tracking-[0.25em] text-white">MCKINSEY DIGITAL</span>
          </div>
        </div>
      </section>

      {/* ── Third Fold: Alternating Feature Fold 1 (For Builders) ── */}
      <section id="builders" className="w-full bg-black lg:h-[calc(100vh-74px)] lg:min-h-[720px] py-24 lg:py-0 px-8 sm:px-16 lg:px-24 border-b border-white/5 scroll-mt-20 shrink-0 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* Left Column: Text Content */}
          <div className="lg:col-span-6 flex flex-col items-start text-left lg:pl-16">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 mb-6">
              <Code size={22} />
            </div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">For Builders & Engineers</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3 mb-6">
              Hacker News & Lobsters. Consolidated.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-8">
              Aggregates real-time technical launches, discussion threads, and developer comments from Hacker News and Lobsters into a single high-fidelity console. Keep your finger on the pulse of active technology releases and community discourse.
            </p>
            
            <ul className="space-y-5">
              <li className="flex items-start gap-3.5 text-sm sm:text-base text-slate-300">
                <span className="text-emerald-400 mt-1 font-bold">✓</span>
                <span><strong>Consolidated Developer Streams:</strong> No need to check multiple tabs. Hacker News and Lobsters are indexed and deduplicated in one clean interface.</span>
              </li>
              <li className="flex items-start gap-3.5 text-sm sm:text-base text-slate-300">
                <span className="text-emerald-400 mt-1 font-bold">✓</span>
                <span><strong>Active Community Commentary:</strong> View community discussions, developer reviews, and codebase feedback directly inside the news cards.</span>
              </li>
              <li className="flex items-start gap-3.5 text-sm sm:text-base text-slate-300">
                <span className="text-emerald-400 mt-1 font-bold">✓</span>
                <span><strong>Automated Tooling Releases:</strong> Track core framework upgrades, GitHub commits, and package releases instantly.</span>
              </li>
            </ul>
          </div>

          {/* Right Column: Image Illustration inside Mockup */}
          <div className="lg:col-span-6 flex justify-center relative">
            <div className="absolute -inset-4 rounded-3xl bg-emerald-500/5 blur-2xl opacity-60 pointer-events-none" />
            <div className="w-full max-w-[520px] bg-[#0c101b] border border-slate-850 rounded-2xl shadow-2xl overflow-hidden hover:border-emerald-500/20 transition-all duration-300">
              <div className="w-full bg-[#141b2d] px-4 py-3 border-b border-slate-850 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <span className="text-[10px] text-slate-500 font-mono ml-2">hackernews-feed.png</span>
              </div>
              <img 
                src={hackerNewsMockupImg} 
                alt="Hacker News feed dashboard mockup" 
                className="w-full h-auto object-cover opacity-95 hover:opacity-100 transition-opacity duration-350"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Fourth Fold: Alternating Feature Fold 2 (For Analysts) ── */}
      <section id="analysts" className="w-full bg-black lg:h-[calc(100vh-74px)] lg:min-h-[720px] py-24 lg:py-0 px-8 sm:px-16 lg:px-24 border-b border-white/5 scroll-mt-20 shrink-0 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* Left Column: Image Illustration inside Mockup (Desktop first) */}
          <div className="lg:col-span-6 order-last lg:order-first flex justify-center relative mt-10 lg:mt-0">
            <div className="absolute -inset-4 rounded-3xl bg-blue-500/5 blur-2xl opacity-60 pointer-events-none" />
            <div className="w-full max-w-[520px] bg-[#0c101b] border border-slate-855 rounded-2xl shadow-2xl overflow-hidden hover:border-blue-500/20 transition-all duration-300">
              <div className="w-full bg-[#141b2d] px-4 py-3 border-b border-slate-850 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <span className="text-[10px] text-slate-500 font-mono ml-2">arxiv-nitiaayog-reports.png</span>
              </div>
              <img 
                src={nitiAayogMockupImg} 
                alt="arXiv and NITI Aayog research dashboard mockup" 
                className="w-full h-auto object-cover opacity-95 hover:opacity-100 transition-opacity duration-350"
              />
            </div>
          </div>

          {/* Right Column: Text Content */}
          <div className="lg:col-span-6 flex flex-col items-start text-left lg:pr-16">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 mb-6">
              <BrainCircuit size={22} />
            </div>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">For Builders & AI Engineers</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3 mb-6">
              arXiv & NITI Aayog Reports. Synthesized.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-8">
              Stay at the absolute forefront of machine learning and research policy. Consolidates arXiv AI preprints, OpenReview submissions, and official reports from NITI Aayog, translating complex literature into actionable insights.
            </p>
            
            <ul className="space-y-5">
              <li className="flex items-start gap-3.5 text-sm sm:text-base text-slate-300">
                <span className="text-blue-400 mt-1 font-bold">✓</span>
                <span><strong>Gemini AI Technical Summaries:</strong> Translates heavy scientific papers and lengthy policy publications into 3-sentence technical takeaways.</span>
              </li>
              <li className="flex items-start gap-3.5 text-sm sm:text-base text-slate-300">
                <span className="text-blue-400 mt-1 font-bold">✓</span>
                <span><strong>Research Preprint Tracking:</strong> Instant indexing of computer science and ML preprints before peer review.</span>
              </li>
              <li className="flex items-start gap-3.5 text-sm sm:text-base text-slate-300">
                <span className="text-blue-400 mt-1 font-bold">✓</span>
                <span><strong>Strategic Policy Intelligence:</strong> Real-time insights from official data guidelines, regulations, and macro frameworks.</span>
              </li>
              <li className="flex items-start gap-3.5 text-sm sm:text-base text-slate-300">
                <span className="text-blue-400 mt-1 font-bold">✓</span>
                <span><strong>Intelligent Noise Filters:</strong> Custom AI-heuristic blocklists wipe out memes, low-value comments, and repetitive articles.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Fifth Fold: Live Newsroom Preview Section ── */}
      <section id="preview" className="relative w-full bg-black lg:h-[calc(100vh-74px)] lg:min-h-[720px] py-20 lg:py-0 px-8 sm:px-16 lg:px-24 flex-none flex flex-col items-center justify-center border-b border-white/5 scroll-mt-20 shrink-0 overflow-hidden">
        <div className="max-w-6xl mx-auto w-full relative z-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-bold mb-3">
              <Newspaper size={12} />
              <span>Live Newsroom Preview</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Today's Featured Updates
            </h2>
            <p className="text-sm text-slate-400 mt-3 max-w-md mx-auto">A glimpse inside the active technical feed right now</p>
          </div>

          {/* Category Filter Pills (Sober, static preview) */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-10 opacity-80 select-none">
            {['All Updates', 'ML Models & AI', 'Big Tech', 'Dev Tools & Coding', 'MLOps & DevOps', 'Hardware & GPUs'].map((cat, i) => (
              <span 
                key={i} 
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${i === 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-white/5 bg-white/[0.02] text-slate-450 hover:text-white hover:bg-white/[0.05]'}`}
              >
                {cat}
              </span>
            ))}
          </div>

          {/* 3-Column Newspaper Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full relative">
            {previewArticles.map((art: any, idx: number) => (
              <div 
                key={art.id || idx}
                className="bg-[#080d1a]/50 border border-white/5 rounded-3xl p-8 pb-10 flex flex-col justify-between shadow-2xl relative overflow-hidden h-[360px]"
              >
                <div>
                  {/* Header badges */}
                  <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/5 text-[10px]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">
                        {art.source.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-300">{art.source}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full border border-white/5 bg-white/[0.02] text-slate-400 font-medium tracking-wide">
                      {art.category.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Metadata line: upvotes, comments, author */}
                  <div className="flex items-center gap-4 text-[9px] text-slate-500 mb-4 font-mono">
                    <span className="text-emerald-400 font-semibold">▲ {120 + idx * 45} points</span>
                    <span>💬 {18 + idx * 7} comments</span>
                    <span>by {['alex_dev', 'tech_guru', 'code_ninja'][idx]}</span>
                  </div>

                  {/* Headline Title */}
                  <h3 className="text-base font-bold text-white leading-snug hover:text-emerald-400 transition-colors mb-4 line-clamp-2">
                    {art.title}
                  </h3>

                  {/* Summary Snippet */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
                    {art.summary}
                  </p>
                </div>

                {/* Footer details */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5 text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1"><Clock size={11} /> {idx + 2} min read</span>
                  <span className="flex items-center gap-0.5 hover:text-emerald-400 transition-colors cursor-pointer">Original source <ExternalLink size={9} /></span>
                </div>
              </div>
            ))}

            {/* Premium Glassmorphic Paywall Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0f19]/40 to-[#0b0f19] rounded-b-3xl flex flex-col items-center justify-end pb-4 pt-24 z-30">
              <div className="backdrop-blur-xl bg-[#080d1a]/95 border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl text-center max-w-xl mx-4 mb-2 hover:border-emerald-500/20 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Lock size={16} />
                </div>
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.25em] block mb-3">Locked Feature</span>
                <h4 className="text-xl font-bold text-white mb-3">Want the full picture?</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Log in to access 100+ daily articles, customized filters, watch later bookmark lists, and the generative AI Replacement Matrix.
                </p>
                <button
                  onClick={onAccess}
                  className="px-8 py-3.5 bg-[#10b981] hover:bg-[#0d9668] text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mx-auto"
                >
                  Access Full Portal
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Live Aggregator Status Ticker at bottom of section */}
          <div className="mt-12 flex justify-center items-center gap-8 text-[10px] text-slate-500 font-mono border-t border-white/5 pt-6 w-full select-none">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Pipeline Status: <strong className="text-emerald-400">Active</strong>
            </span>
            <span>•</span>
            <span>Last Sync: <strong>2 mins ago</strong></span>
            <span>•</span>
            <span>Sources Online: <strong className="text-slate-300">28+</strong></span>
            <span>•</span>
            <span>Processed Today: <strong className="text-slate-300">124 articles</strong></span>
          </div>

        </div>
      </section>

      {/* ── Sixth Fold: Decoupled Stats Row ── */}
      <section id="stats" className="relative w-full bg-black lg:h-[calc(100vh-74px)] lg:min-h-[720px] py-20 lg:py-0 px-8 sm:px-16 lg:px-24 flex-none flex flex-col items-center justify-center border-b border-white/5 shrink-0 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          
          {/* Left Column: Text and Stats Cards */}
          <div className="lg:col-span-6 flex flex-col items-start text-left lg:pl-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.25em] mb-6 select-none">
              <span>Enterprise-Grade Metrics</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-6">
              High-performance systems driving the pipeline.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-8">
              The myTechNews data pipeline is engineered for continuous scaling, real-time scraping, and instant AI summarization with 100% cron uptime.
            </p>

            {/* 4 Stats Cards Grid */}
            <div className="grid grid-cols-2 gap-6 w-full">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center text-center p-8 py-10 bg-[#080d1a]/60 border border-white/5 rounded-2xl hover:border-white/10 hover:bg-[#080d1a]/80 transition-all duration-300 shadow-lg">
                  <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent font-mono tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold mt-3">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Infrastructure Mockup */}
          <div className="lg:col-span-6 flex justify-center relative">
            <div className="absolute -inset-4 rounded-3xl bg-emerald-500/5 blur-2xl opacity-60 pointer-events-none" />
            <div className="w-full max-w-[520px] bg-[#0c101b] border border-slate-850 rounded-2xl shadow-2xl overflow-hidden hover:border-emerald-500/20 transition-all duration-300">
              <div className="w-full bg-[#141b2d] px-4 py-3 border-b border-slate-850 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <span className="text-[10px] text-slate-500 font-mono ml-2">system-pipeline.png</span>
              </div>
              <img 
                src={infrastructureMockupImg} 
                alt="myTechNews infrastructure dashboard mockup" 
                className="w-full h-auto object-cover opacity-95 hover:opacity-100 transition-opacity duration-350"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="w-full border-t border-white/5 py-16 text-center text-xs text-slate-500 select-none bg-black shrink-0">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p>© {new Date().getFullYear()} myTechNews. Powered by Google AI Guidelines.</p>
          <div className="flex gap-6">
            <a href="https://news.ycombinator.com/" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors duration-200">Hacker News</a>
            <a href="https://lobste.rs/" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors duration-200">Lobsters</a>
            <a href="https://niti.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors duration-200">NITI Aayog</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface LandingPageProps {
  onAccess: () => void;
}
