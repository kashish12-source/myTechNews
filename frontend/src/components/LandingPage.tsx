import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Globe, Zap, Sun, Moon, ArrowRight, Database, Filter, BrainCircuit, Bell } from 'lucide-react';
import BrandLogo from './BrandLogo';

// ─── 3D Scene Components ─────────────────────────────────────────────

function FloatingOrb({ position, color, speed, distort }: { position: [number, number, number]; color: string; speed: number; distort: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.4;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.8}
          distort={distort}
          speed={2}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 600;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#22c55e" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function GlowingRing({ radius, color, rotationSpeed }: { radius: number; color: string; rotationSpeed: number }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = state.clock.elapsedTime * rotationSpeed;
      ringRef.current.rotation.y = state.clock.elapsedTime * rotationSpeed * 0.7;
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.5} />
    </mesh>
  );
}

function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#10b981" />
      <pointLight position={[-5, -3, 3]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[0, 3, -5]} intensity={0.4} color="#22c55e" />

      <Stars radius={80} depth={60} count={1500} factor={3} saturation={0} fade speed={0.5} />
      <ParticleField />

      <FloatingOrb position={[-2.5, 0.5, 0]} color="#10b981" speed={0.8} distort={0.4} />
      <FloatingOrb position={[2.8, -0.3, -1]} color="#3b82f6" speed={0.6} distort={0.3} />
      <FloatingOrb position={[0.5, 1.8, -2]} color="#06b6d4" speed={1.0} distort={0.5} />

      <GlowingRing radius={3} color="#10b981" rotationSpeed={0.15} />
      <GlowingRing radius={4} color="#3b82f6" rotationSpeed={-0.1} />
      <GlowingRing radius={2} color="#22c55e" rotationSpeed={0.2} />
    </>
  );
}

// ─── Main Landing Page ───────────────────────────────────────────────

interface LandingPageProps {
  onAccess: () => void;
  theme?: 'dark' | 'light';
  setTheme?: (theme: 'dark' | 'light') => void;
}

export default function LandingPage({ onAccess, theme, setTheme }: LandingPageProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActiveStep(s => (s + 1) % 6), 3000);
    return () => clearInterval(id);
  }, []);

  const pipeline = [
    {
      step: '01',
      icon: Globe,
      title: 'Multi-Source Scraping',
      tag: 'Concurrent · asyncio',
      color: 'emerald',
      gradient: 'from-emerald-500 to-green-500',
      glow: 'shadow-emerald-500/30',
      border: 'border-emerald-500/40',
      description: 'All 28+ sources fire simultaneously using Python asyncio.gather() — no waiting for slow feeds to unblock fast ones.',
      bullets: [
        '🗞️  Hacker News & Lobsters RSS — raw engineer discourse',
        '📄  arXiv cs.LG / cs.AI / cs.CL — latest ML research preprints',
        '📰  TechCrunch AI & Enterprise — industry news',
        '🏛️  NITI Aayog — Indian policy & AI strategy reports',
        '🔬  OpenReview (ICLR, NeurIPS) — peer-reviewed papers via JSON API',
        '🏢  Amazon Science, Netflix Tech, Stripe Eng blogs',
        '🔗  GitHub Atom feeds: context7, Dokploy, Understand-Anything',
        '✍️  Paul Graham essays — HTML-scraped via regex',
      ],
      meta: ['28+ sources', 'Parallel HTTP via httpx', '<5 s total'],
    },
    {
      step: '02',
      icon: Filter,
      title: 'Filter & Deduplicate',
      tag: 'Regex · Heuristics',
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-500',
      glow: 'shadow-cyan-500/30',
      border: 'border-cyan-500/40',
      description: 'Raw articles pass through two guard layers before AI processing — keeping only original, serious technical content.',
      bullets: [
        '🚫  Fluff blacklist — 15+ regex patterns block memes, jokes, satire',
        '🔁  URL deduplication — exact URL match in seen_urls set',
        '🔤  Title deduplication — normalised alphanum title in seen_titles set',
        '📋  Show HN filter — drops casual posts lacking open-source/model keywords',
        '📅  Date sort — articles ranked newest-first before the cap',
        '✂️  Hard cap at 30 articles — only the freshest batch proceeds',
      ],
      meta: ['Regex blacklist', 'O(n) dedup', 'Top 30 selected'],
    },
    {
      step: '03',
      icon: BrainCircuit,
      title: 'Gemini AI Enrichment',
      tag: 'gemini-2.5-flash · JSON mode',
      color: 'blue',
      gradient: 'from-blue-500 to-violet-500',
      glow: 'shadow-blue-500/30',
      border: 'border-blue-500/40',
      description: 'Each article is sent to Gemini 2.5 Flash with a structured prompt. The model returns a strict JSON object — no hallucinated free-text.',
      bullets: [
        '🤖  Prompt asks: isSeriousTechNews, category, summary, importance, sentiment',
        '📦  response_mime_type = "application/json" — guarantees parseable output',
        '🗂️  5 categories: ai-models · big-tech · dev-tools · mlops-devops · hardware-gpus',
        '⭐  Importance: high / medium / low  |  Sentiment: positive / neutral / negative',
        '🛡️  Fallback: if Gemini unavailable, keyword heuristic classifier runs instead',
        '✏️  3-sentence technical summary written per article — no fluff',
      ],
      meta: ['Gemini 2.5 Flash', 'JSON structured output', 'Auto-fallback'],
    },
    {
      step: '04',
      icon: Database,
      title: 'Persist to Database',
      tag: 'SQLAlchemy · SQLite / PostgreSQL',
      color: 'violet',
      gradient: 'from-violet-500 to-purple-500',
      glow: 'shadow-violet-500/30',
      border: 'border-violet-500/40',
      description: 'Enriched articles are bulk-written to the database after clearing the old set. A SystemStatus row tracks pipeline state in real time.',
      bullets: [
        '🗄️  SQLAlchemy ORM — models.Article, models.SystemStatus',
        '🔄  Full replace strategy: DELETE all → INSERT enriched batch atomically',
        '⏱️  last_updated timestamp written after commit — drives UI refresh logic',
        '🔒  is_updating flag prevents duplicate concurrent scrape triggers',
        '☁️  Vercel: SQLite redirected to /tmp/ (ephemeral); Production uses PostgreSQL',
        '📁  scrape_cli.py also exports news-cache.json for the static fallback bundle',
      ],
      meta: ['SQLAlchemy ORM', 'Atomic commit', 'Dual-DB support'],
    },
    {
      step: '05',
      icon: Zap,
      title: 'Serve & Auto-Refresh',
      tag: 'FastAPI · BackgroundTasks · GitHub Actions',
      color: 'green',
      gradient: 'from-green-400 to-emerald-500',
      glow: 'shadow-green-500/30',
      border: 'border-green-500/40',
      description: 'The FastAPI layer serves articles to the React frontend with JWT auth. Staleness is detected on every GET and triggers a silent background refresh.',
      bullets: [
        '🔐  GET /api/news — JWT-protected, returns articles + isSystemUpdating flag',
        '⏰  15-minute staleness check on every request — auto-triggers background scrape',
        '🔁  POST /api/refresh — manual force-refresh from the UI refresh button',
        '🌐  React frontend falls back to bundled news-cache.json on empty response',
        '📆  GitHub Actions cron: daily 5:50 AM IST — scrapes, exports JSON, git-pushes',
        '📲  PWA manifest + service worker — installable on Android, iOS, and desktop',
      ],
      meta: ['FastAPI BackgroundTasks', 'Cron 00:20 UTC', 'PWA ready'],
    },
    {
      step: '06',
      icon: Bell,
      title: 'Email & OTP Auth',
      tag: 'bcrypt · JWT · SMTP',
      color: 'orange',
      gradient: 'from-orange-400 to-amber-500',
      glow: 'shadow-orange-500/30',
      border: 'border-orange-500/40',
      description: 'Every login triggers a 6-digit OTP dispatched via SMTP. Only after OTP verification is a 24-hour JWT issued — protecting all news API endpoints.',
      bullets: [
        '🔑  bcrypt (12 rounds) hashes all passwords — brute-force resistant',
        '📧  Login → 6-digit OTP generated with Python secrets (CSPRNG)',
        '⏳  OTP stored in verification_codes table, expires in 5 minutes',
        '✅  POST /api/auth/verify-code → OTP validated → JWT(HS256, 24 h) issued',
        '🛡️  All /api/news, /api/refresh, /api/saved routes require Bearer token',
        '💌  SMTP fallback: if no credentials, OTP printed to server console for dev',
      ],
      meta: ['bcrypt 12 rounds', 'CSPRNG OTP', 'JWT 24 h'],
    },
  ];

  const stats = [
    { value: '28+', label: 'Sources' },
    { value: '30', label: 'Articles / cycle' },
    { value: '<5s', label: 'Pipeline speed' },
    { value: '24/7', label: 'Cron uptime' }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-black text-white font-sans selection:bg-emerald-500/30 relative overflow-hidden">

      {/* ── 3D Background Canvas ── */}
      <div className="fixed inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 55 }}
          style={{ background: 'transparent' }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 1.5]}
        >
          <HeroScene />
        </Canvas>
      </div>

      {/* ── Gradient Overlays ── */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
          style={{
            background: 'radial-gradient(circle, #10b981, transparent)',
            left: `calc(40% + ${mousePos.x * 30}px)`,
            top: `calc(30% + ${mousePos.y * 30}px)`,
            transition: 'left 0.8s ease-out, top 0.8s ease-out'
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-15"
          style={{
            background: 'radial-gradient(circle, #3b82f6, transparent)',
            right: `calc(20% + ${mousePos.x * -20}px)`,
            bottom: `calc(20% + ${mousePos.y * -20}px)`,
            transition: 'right 0.8s ease-out, bottom 0.8s ease-out'
          }}
        />
      </div>

      {/* ── Sticky Header ── */}
      <header className="w-full fixed top-0 z-50 px-5 sm:px-8 py-4 flex items-center justify-between select-none backdrop-blur-md bg-black/30 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <BrandLogo size={30} className="rounded-lg" />
          <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            myTechNews
          </span>
        </div>

        <div className="flex items-center gap-3">
          {setTheme && theme && (
            <button
              className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer border border-white/10"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? "Light Mode" : "Dark Mode"}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}
          <button
            onClick={onAccess}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-full shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            Access Portal
          </button>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-5 sm:px-8 pt-28 pb-16 min-h-screen">

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight max-w-4xl">
          <span className="text-white">The Hub for</span>
          <br />
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Technical Intelligence
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-white/50 mt-6 max-w-xl leading-relaxed font-medium">
          Aggregated feeds from Hacker News, arXiv, TechCrunch & 25+ sources.
          Enriched by Gemini AI. Zero memes. Zero noise.
        </p>

        {/* CTA Button */}
        <div className="mt-12">
          <button
            onClick={onAccess}
            className="group px-12 py-4.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:from-emerald-400 hover:via-cyan-400 hover:to-blue-400 text-black text-base font-extrabold rounded-2xl shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-400/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 animate-[glow_3s_ease-in-out_infinite_alternate]"
          >
            Get Started
            <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-16 w-full">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                {stat.value}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Animated Pipeline Section ── */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pb-24">
        <div className="text-center mb-14">
          <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-bold mb-3">End-to-End Pipeline</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How every article reaches you
          </h2>
          <p className="text-xs text-white/30 mt-2">Each stage runs automatically — click any step to explore</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left: Step List */}
          <div className="flex flex-row overflow-x-auto gap-2 lg:flex-col lg:w-72 shrink-0 pb-3 lg:pb-0 scrollbar-none snap-x snap-mandatory">
            {pipeline.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`group shrink-0 snap-start w-[220px] lg:w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? `bg-white/[0.06] ${step.border} shadow-lg ${step.glow}`
                      : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]'
                  }`}
                >
                  {/* Step number indicator */}
                  <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-br ${step.gradient} text-black shadow-md`
                      : 'bg-white/[0.05] text-white/30'
                  }`}>
                    {step.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-bold truncate transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/40'}`}>
                      {step.title}
                    </div>
                    <div className={`text-[10px] truncate transition-colors duration-300 ${isActive ? 'text-white/40' : 'text-white/20'}`}>
                      {step.tag}
                    </div>
                  </div>
                  {/* Active progress bar */}
                  {isActive && (
                    <div className="shrink-0 w-1 h-8 rounded-full overflow-hidden bg-white/10">
                      <div
                        className={`w-full bg-gradient-to-b ${step.gradient} rounded-full`}
                        style={{ height: '100%', animation: 'fillY 3s linear forwards' }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: Detail Panel */}
          {(() => {
            const step = pipeline[activeStep];
            const Icon = step.icon;
            return (
              <div
                key={activeStep}
                className={`w-full max-w-full flex-1 relative bg-white/[0.03] border ${step.border} rounded-2xl p-5 sm:p-8 backdrop-blur-sm overflow-hidden`}
                style={{ animation: 'fadeSlideIn 0.4s ease-out' }}
              >
                {/* Background glow */}
                <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br ${step.gradient} opacity-10 blur-3xl pointer-events-none`} />

                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-black shadow-xl`}>
                    <Icon size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black text-white/30 tracking-widest">STEP {step.step}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border ${step.border} text-white/50 font-mono`}>{step.tag}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1 truncate">{step.title}</h3>
                    <p className="text-xs text-white/40 mt-1 leading-relaxed max-w-xl">{step.description}</p>
                  </div>
                </div>

                {/* Bullet list */}
                <ul className="space-y-2.5 mb-6">
                  {step.bullets.map((b, bi) => (
                    <li key={bi} className="flex items-start gap-2 text-xs text-white/60 leading-relaxed min-w-0">
                      <span className="shrink-0 mt-0.5">{b.slice(0, 2)}</span>
                      <span className="break-words min-w-0 flex-1">{b.slice(2)}</span>
                    </li>
                  ))}
                </ul>

                {/* Meta badges */}
                <div className="flex flex-wrap gap-2">
                  {step.meta.map((m, mi) => (
                    <span key={mi} className={`text-[10px] px-3 py-1 rounded-full bg-gradient-to-r ${step.gradient} text-black font-bold shadow-sm`}>{m}</span>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── Source Ticker ── */}
      <section className="relative z-10 w-full border-t border-white/5 py-10 overflow-hidden">
        <div className="flex items-center justify-center flex-wrap gap-x-8 gap-y-3 px-6 text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold select-none">
          {['Hacker News', 'Lobsters', 'arXiv', 'TechCrunch', 'OpenReview', 'NITI Aayog', 'Amazon Science', 'Netflix Tech', 'Stripe Eng', 'Paul Graham', 'context7', 'Dokploy'].map((s, i) => (
            <span key={i} className="hover:text-emerald-400 transition-colors cursor-default">{s}</span>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-white/25 select-none backdrop-blur-sm bg-black/50">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} myTechNews. Powered by Google AI Guidelines.</p>
          <div className="flex gap-4">
            <a href="https://news.ycombinator.com/" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">Hacker News</a>
            <a href="https://lobste.rs/" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">Lobsters</a>
            <a href="https://niti.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">NITI Aayog</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
