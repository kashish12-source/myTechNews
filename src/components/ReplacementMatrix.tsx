import { useState } from 'react';
import { ShieldCheck, Info, Search, Code, CheckCircle, Zap, User, ArrowRight } from 'lucide-react';

interface ReplacementTask {
  id: string;
  role: string;
  taskName: string;
  replacementTool: string;
  alternativeTools: string[];
  replacementLevel: 'Complete' | 'Substantial' | 'Partial';
  productivityGain: string;
  setupEase: 'Easy' | 'Medium' | 'Complex';
  workflow: string;
  samplePrompt: string;
}

export default function ReplacementMatrix() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [activeTaskInfo, setActiveTaskInfo] = useState<string | null>(null);

  const roles = [
    { id: 'all', label: 'All Roles' },
    { id: 'dev', label: 'Software Engineers' },
    { id: 'devops', label: 'DevOps / MLOps' },
    { id: 'design', label: 'Designers & Frontend' },
    { id: 'content', label: 'Tech Writers & Marketing' }
  ];

  const tasks: ReplacementTask[] = [
    {
      id: 'task-1',
      role: 'dev',
      taskName: 'Writing CRUD REST APIs & Boilerplate Code',
      replacementTool: 'Claude 3.5 Sonnet / Antigravity IDE',
      alternativeTools: ['GitHub Copilot', 'Cursor'],
      replacementLevel: 'Substantial',
      productivityGain: '8x faster generation',
      setupEase: 'Easy',
      workflow: 'Provide database schemas and framework constraints. The agent writes complete code blocks, updates packages, and runs linting checks autonomously.',
      samplePrompt: 'Create a fully structured Node/Express API for user authentications with JWT, including validation middlewares, and write unit tests using Jest. Output only complete production-ready files.'
    },
    {
      id: 'task-2',
      role: 'design',
      taskName: 'Generating CSS Styling & UI Mockups',
      replacementTool: 'v0.dev / Claude (Artifacts)',
      alternativeTools: ['Gemini 2.5 Flash', 'Figma AI'],
      replacementLevel: 'Complete',
      productivityGain: '15x faster iteration',
      setupEase: 'Easy',
      workflow: 'Input screenshot designs or list specifications. v0/Claude builds complete React + CSS files. Review visuals and adjust through natural language chat.',
      samplePrompt: 'Generate a dark-themed dashboard page using React and custom glassmorphism styling. Make it look premium with cyber-punk neon accents, sidebars, search elements, and smooth animated cards.'
    },
    {
      id: 'task-3',
      role: 'devops',
      taskName: 'Configuring Dockerfiles, K8s manifests & CI/CD Pipelines',
      replacementTool: 'Gemini 2.5 Flash / Claude 3.5 Sonnet',
      alternativeTools: ['Cursor', 'GPT-4o'],
      replacementLevel: 'Substantial',
      productivityGain: '5x speedup in configuration',
      setupEase: 'Medium',
      workflow: 'Feed local repo tree or project details to the LLM. Ask it to output yaml configs, Dockerfiles, and GitHub Actions scripts tailored to the runtime specs.',
      samplePrompt: 'Inspect this Python web application directory. Write a multi-stage Dockerfile that builds with a minimal Alpine footprint, and a GitHub Actions workflow that builds, tests, and deploys it on merge.'
    },
    {
      id: 'task-4',
      role: 'dev',
      taskName: 'Database SQL Query Optimizations & Schema Migrations',
      replacementTool: 'Cursor / Claude',
      alternativeTools: ['GPT-4o', 'DBeaver AI'],
      replacementLevel: 'Substantial',
      productivityGain: '4x faster query refinement',
      setupEase: 'Easy',
      workflow: 'Paste slow queries, database engine specs (Postgres/MySQL/Oracle), and execution plans. The AI rewrites queries, proposes indexes, and generates migrations.',
      samplePrompt: 'Optimize this slow SQL query that joins users, orders, and products. The query takes 800ms. Analyze the structure and suggest indices or subqueries: [PASTE_QUERY]'
    },
    {
      id: 'task-5',
      role: 'devops',
      taskName: 'DevOps Log Analysis & Incident Response Troubleshooting',
      replacementTool: 'Claude 3.5 Sonnet / Antigravity Agent Swarms',
      alternativeTools: ['Gemini 2.5 Flash', 'Datadog AI Co-pilot'],
      replacementLevel: 'Substantial',
      productivityGain: '70% reduction in MTTR (Mean Time to Resolution)',
      setupEase: 'Complex',
      workflow: 'Pipe terminal outputs, stack traces, and cloud provider log events into the context. The agent traces configurations, finds core exceptions, and writes fix scripts.',
      samplePrompt: 'A Kubernetes container is crashlooping with Exit Code 137. Inspect these logs and state the cause of memory termination and steps to patch the helm chart memory limit.'
    },
    {
      id: 'task-6',
      role: 'content',
      taskName: 'Translating Technical Docs & Drafting SEO Articles',
      replacementTool: 'Gemini 2.5 Flash',
      alternativeTools: ['ChatGPT Plus', 'DeepL Write'],
      replacementLevel: 'Complete',
      productivityGain: '10x faster localization',
      setupEase: 'Easy',
      workflow: 'Feed long-form Markdown documentation, specify tone configurations, keywords, and target SEO headers. The model translates or summarizes text while preserving code blocks.',
      samplePrompt: 'Rewrite this complex technical article about RL MLOps for a software engineer audience. Incorporate SEO keywords: Ray cluster, MLflow tracking, and Docker virtualization. Keep all code blocks intact.'
    },
    {
      id: 'task-7',
      role: 'dev',
      taskName: 'Writing Frontend Logic & Client-side State Machines',
      replacementTool: 'Antigravity IDE / Cursor',
      alternativeTools: ['Claude 3.5 Sonnet', 'v0.dev'],
      replacementLevel: 'Substantial',
      productivityGain: '6x faster feature shipping',
      setupEase: 'Easy',
      workflow: 'Reference relevant files inside the workspace. Request the agent to refactor state hooks, add Redux/Zustand templates, or write complete UI handlers.',
      samplePrompt: 'Add a search filter and dynamic category routing logic to this React dashboard component. Hook up the local JSON import to serve as fallback data when fetching fails.'
    }
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesRole = selectedRole === 'all' || task.role === selectedRole;
    const matchesSearch = task.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.replacementTool.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.workflow.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'Complete': return 'badge-green';
      case 'Substantial': return 'badge-cyan';
      default: return 'badge-purple';
    }
  };

  const getEaseBadge = (ease: string) => {
    switch (ease) {
      case 'Easy': return 'badge-green';
      case 'Medium': return 'badge-cyan';
      default: return 'badge-magenta';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h1 className="font-tech glow-text" style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(to right, #00f2fe, #7000ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
          AI TOOL REPLACEMENT MATRIX
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Assess what tech and coding jobs can be automated, augmented, or replaced using state-of-the-art AI engines, including Claude, Gemini, and Antigravity.
        </p>
      </div>

      {/* Toolbar & Filters */}
      <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input 
              type="text" 
              placeholder="Search tasks or tools..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.75rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {roles.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`btn ${selectedRole === r.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem',
                  boxShadow: selectedRole === r.id ? 'var(--glow-cyan)' : 'none',
                  background: selectedRole === r.id ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))' : 'rgba(255,255,255,0.03)'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
        {filteredTasks.map((task) => (
          <div key={task.id} className="glass" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge badge-purple" style={{ marginRight: '0.5rem' }}>
                  <User size={10} style={{ marginRight: '3px' }} />
                  {roles.find(r => r.id === task.role)?.label.slice(0, -1) || task.role}
                </span>
                <h3 className="glow-text font-tech" style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                  {task.taskName}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className={`badge ${getLevelBadge(task.replacementLevel)}`}>
                  Automation: {task.replacementLevel}
                </span>
                <span className="badge badge-purple" style={{ background: 'rgba(0, 242, 254, 0.05)', color: 'var(--accent-cyan)' }}>
                  <Zap size={10} /> {task.productivityGain}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Primary Tool Replacement
                </h4>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} style={{ color: 'var(--accent-green)' }} />
                  {task.replacementTool}
                </div>
                {task.alternativeTools.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Alternatives: {task.alternativeTools.join(', ')}
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Setup Complexity
                </h4>
                <span className={`badge ${getEaseBadge(task.setupEase)}`}>
                  {task.setupEase}
                </span>
              </div>
            </div>

            {/* Expandable Workflow Section */}
            <div style={{ marginTop: '1.25rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setActiveTaskInfo(activeTaskInfo === task.id ? null : task.id)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                <span>Workflow & Prompts</span>
                <ArrowRight size={14} style={{ transform: activeTaskInfo === task.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {activeTaskInfo === task.id && (
                <div className="animate-fade-in" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', marginTop: '0.75rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.35rem' }}>
                      <Info size={12} />
                      Automation Workflow
                    </h5>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {task.workflow}
                    </p>
                  </div>

                  <div>
                    <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.35rem' }}>
                      <Code size={12} />
                      Target Prompt Example
                    </h5>
                    <pre style={{ background: '#040810', color: 'var(--accent-cyan)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.8rem', overflowX: 'auto', border: '1px solid var(--border-color)', whiteSpace: 'pre-wrap' }}>
                      {task.samplePrompt}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Side-by-side comparison summary */}
      <div className="glass" style={{ padding: '2rem', marginTop: '2rem' }}>
        <h3 className="font-tech glow-text" style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} style={{ color: 'var(--accent-cyan)' }} />
          LLM Coding Benchmark Summary
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem' }}>Capability</th>
                <th style={{ padding: '0.75rem', color: 'var(--accent-magenta)' }}>Claude 3.5 Sonnet</th>
                <th style={{ padding: '0.75rem', color: 'var(--accent-cyan)' }}>Gemini 2.5 Flash</th>
                <th style={{ padding: '0.75rem', color: 'var(--accent-purple)' }}>Antigravity (Agentic)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Multi-file Coding</td>
                <td style={{ padding: '0.75rem' }}>Substantial (Excellent logic)</td>
                <td style={{ padding: '0.75rem' }}>Medium (Needs prompt splits)</td>
                <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--accent-green)' }}>Complete (Automatic sync)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Context Size</td>
                <td style={{ padding: '0.75rem' }}>200k tokens</td>
                <td style={{ padding: '0.75rem' }}>5,000k (5M) tokens</td>
                <td style={{ padding: '0.75rem' }}>Variable (Project indexing)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Terminal Execution</td>
                <td style={{ padding: '0.75rem' }}>API only</td>
                <td style={{ padding: '0.75rem' }}>Tool calls only</td>
                <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--accent-green)' }}>Native Sandbox Shell</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Primary Use Case</td>
                <td style={{ padding: '0.75rem' }}>Logical code generation</td>
                <td style={{ padding: '0.75rem' }}>Large codebase digests / Audio</td>
                <td style={{ padding: '0.75rem' }}>End-to-end task solving</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
