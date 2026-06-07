import { useState, useMemo } from 'react';
import { ShieldCheck, Info, Search, Code, CheckCircle, Zap, ArrowRight, Workflow, Paintbrush, FileText, LayoutGrid } from 'lucide-react';

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

const roles = [
    { id: 'all', label: 'All Roles', icon: LayoutGrid },
    { id: 'dev', label: 'Software Engineers', icon: Code },
    { id: 'devops', label: 'DevOps & MLOps', icon: Workflow },
    { id: 'design', label: 'UX/UI Designers', icon: Paintbrush },
    { id: 'content', label: 'Tech Writers & Marketing', icon: FileText }
  ];

  const tasks: ReplacementTask[] = [
    {
      id: 'task-1',
      role: 'dev',
      taskName: 'Writing CRUD REST APIs & Boilerplate Code',
      replacementTool: 'Claude 3.5 Sonnet / Antigravity IDE',
      alternativeTools: ['GitHub Copilot', 'Cursor'],
      replacementLevel: 'Substantial',
      productivityGain: '8x speedup',
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
      productivityGain: '15x iteration rate',
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
      productivityGain: '5x speedup',
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
      productivityGain: '4x speedup',
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
      productivityGain: '70% reduction in MTTR',
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
      productivityGain: '10x speedup',
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
      productivityGain: '6x speedup',
      setupEase: 'Easy',
      workflow: 'Reference relevant files inside the workspace. Request the agent to refactor state hooks, add Redux/Zustand templates, or write complete UI handlers.',
      samplePrompt: 'Add a search filter and dynamic category routing logic to this React dashboard component. Hook up the local JSON import to serve as fallback data when fetching fails.'
    }
  ];

export default function ReplacementMatrix() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [activeTaskInfo, setActiveTaskInfo] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return tasks.filter(task => {
      const matchesRole = selectedRole === 'all' || task.role === selectedRole;
      if (!query) return matchesRole;
      return matchesRole && (
        task.taskName.toLowerCase().includes(query) ||
        task.replacementTool.toLowerCase().includes(query) ||
        task.workflow.toLowerCase().includes(query)
      );
    });
  }, [selectedRole, searchQuery]);

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'Complete': return 'badge-emerald';
      case 'Substantial': return 'badge-cyan';
      default: return 'badge-blue';
    }
  };

  const getEaseBadgeClass = (ease: string) => {
    switch (ease) {
      case 'Easy': return 'badge-emerald';
      case 'Medium': return 'badge-cyan';
      default: return 'badge-rose';
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Title Panel */}
      <div className="glass" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
        <h1 className="title-header">
          AI Replacement Matrix
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
          Compare workflow automation mappings across various engineering and technical roles.
        </p>
      </div>

      {/* Toolbar - Search & Filter */}
      <div className="glass" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '220px' }}>
          <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={14} />
          <input 
            type="text" 
            placeholder="Search matrix..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.2rem', paddingRight: '0.75rem', paddingBlock: '0.45rem', fontSize: '0.8rem', borderRadius: '4px' }}
          />
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>

        {/* Iconised filter tabs with Tooltips */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {roles.map(r => {
            const RoleIcon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <div key={r.id} className="tooltip">
                <button
                  onClick={() => setSelectedRole(r.id)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '4px',
                    padding: 0,
                    background: isSelected ? 'var(--accent-blue)' : 'transparent',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    border: isSelected ? 'none' : '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <RoleIcon size={16} />
                </button>
                <span className="tooltip-text">{r.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simple List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredTasks.map((task) => (
          <div key={task.id} className="glass" style={{ padding: '1.25rem 1.5rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span className="badge badge-blue" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                  {roles.find(r => r.id === task.role)?.label || task.role}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.4rem' }}>
                  {task.taskName}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span className={`badge ${getLevelBadgeClass(task.replacementLevel)}`} style={{ fontSize: '0.65rem' }}>
                  Auto: {task.replacementLevel}
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                  <Zap size={10} /> {task.productivityGain}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  Primary Tool Replacement
                </div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle size={14} style={{ color: 'var(--accent-emerald)', minWidth: '14px' }} />
                  {task.replacementTool}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  Setup Complexity
                </div>
                <span className={`badge ${getEaseBadgeClass(task.setupEase)}`} style={{ fontSize: '0.65rem' }}>
                  {task.setupEase}
                </span>
              </div>
            </div>

            {/* Expandable Workflow Section */}
            <div style={{ marginTop: '1rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setActiveTaskInfo(activeTaskInfo === task.id ? null : task.id)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px' }}
              >
                <span>Integration Workflow & Prompts</span>
                <ArrowRight size={12} style={{ transform: activeTaskInfo === task.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {activeTaskInfo === task.id && (
                <div className="animate-fade-in" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.2rem' }}>
                      <Info size={12} />
                      Automation Workflow
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {task.workflow}
                    </p>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.2rem' }}>
                      <Code size={12} />
                      Target Prompt Example
                    </div>
                    <pre style={{ background: 'var(--bg-code)', color: 'var(--accent-cyan)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.75rem', overflowX: 'auto', border: '1px solid var(--border-color)', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                      {task.samplePrompt}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Comparison table */}
      <div className="glass" style={{ padding: '1.5rem 2rem', marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <ShieldCheck size={16} style={{ color: 'var(--accent-cyan)' }} />
          LLM Coding Benchmark Summary
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.5rem 0.75rem' }}>Capability</th>
                <th style={{ padding: '0.5rem 0.75rem', color: 'var(--accent-rose)' }}>Claude 3.5 Sonnet</th>
                <th style={{ padding: '0.5rem 0.75rem', color: 'var(--accent-cyan)' }}>Gemini 2.5 Flash</th>
                <th style={{ padding: '0.5rem 0.75rem', color: 'var(--accent-blue)' }}>Antigravity (Agentic)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Multi-file Coding</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>Substantial</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>Medium</td>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>Complete</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Context Size</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>200k tokens</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>5,000k (5M) tokens</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>Workspace Indexing</td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Execution Shell</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>No</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>No</td>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>Yes (Sandbox)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
