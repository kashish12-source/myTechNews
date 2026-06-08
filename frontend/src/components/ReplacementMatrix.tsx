import { useState, useMemo } from 'react';
import { ShieldCheck, Search, Code, CheckCircle, Zap, Workflow, Paintbrush, FileText, LayoutGrid, ChevronDown, ChevronUp } from 'lucide-react';

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
  { id: 'content', label: 'Tech Writers', icon: FileText }
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
    workflow: 'Paste slow queries, database engine specs (Postgres/MySQL/Oracle), and execution plans. The AI rewrites queries, proposes indices, and generates migrations.',
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

interface ReplacementMatrixProps {
  searchQuery?: string;
}

export default function ReplacementMatrix({ searchQuery: propSearchQuery }: ReplacementMatrixProps = {}) {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const searchQuery = propSearchQuery !== undefined ? propSearchQuery : localSearchQuery;
  const setSearchQuery = propSearchQuery !== undefined ? () => {} : setLocalSearchQuery;
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

  const getRoleLabelColor = (_role: string) => {
    return 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
  };

  const getEaseBadgeClass = (_ease: string) => {
    return 'text-slate-600 dark:text-slate-400 bg-transparent border border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      
      {/* Title Panel */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          AI Replacement Matrix
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1.5">
          Compare workflow automation mappings across various engineering and technical roles.
        </p>
      </div>

      {/* Toolbar - Search & Filter */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex gap-4 items-center flex-wrap shadow-sm">
        {propSearchQuery === undefined && (
          <>
            <div className="relative w-full sm:w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Search matrix..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:border-[#1a73e8] rounded-lg pl-9 pr-4 py-1.5 text-xs outline-none transition-all placeholder:text-slate-550"
              />
            </div>

            <div className="hidden sm:block w-px h-6 bg-[var(--border-color)]"></div>
          </>
        )}

        {/* Roles Selection Bar */}
        <div className="flex gap-2 items-center flex-wrap">
          {roles.map(r => {
            const RoleIcon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer select-none ${
                  isSelected 
                    ? 'bg-[#1a73e8] border-[#1a73e8] text-white shadow-sm' 
                    : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:bg-[var(--border-hover)] text-[var(--text-secondary)]'
                }`}
              >
                <RoleIcon size={13} />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasks List - Formatted exactly like coding news grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-16 text-center text-[var(--text-secondary)] shadow-sm">
            <p className="text-sm">No automation mappings match your criteria.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isExpanded = activeTaskInfo === task.id;
            const badgeClass = getRoleLabelColor(task.role);
            const easeClass = getEaseBadgeClass(task.setupEase);

            return (
              <div 
                key={task.id} 
                className="google-news-card"
              >
                <div>
                  {/* Top Bar Badges */}
                  <div className="flex justify-between items-center mb-3">
                    <span className={`px-2.5 py-0.5 rounded border text-[9px] font-bold tracking-wide ${badgeClass}`}>
                      {roles.find(r => r.id === task.role)?.label.split(' ')[0] || task.role}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide ${easeClass}`}>
                      Complexity: {task.setupEase}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm md:text-base font-bold text-[var(--text-primary)] hover:text-[#1a73e8] dark:hover:text-[#8ab4f8] transition-colors leading-snug line-clamp-2 mb-2">
                    {task.taskName}
                  </h3>

                  {/* Primary Tool */}
                  <p className="text-xs text-[var(--text-primary)] font-semibold mb-2 flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                    <span>{task.replacementTool}</span>
                  </p>

                  {/* Summary / Workflow Brief */}
                  <p className={`text-[var(--text-secondary)] text-xs leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                    {task.workflow}
                  </p>
                </div>

                {/* Footer Section */}
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-[var(--border-color)] text-[10px]">
                  <button 
                    onClick={() => setActiveTaskInfo(isExpanded ? null : task.id)}
                    className="font-bold text-[#1a73e8] dark:text-[#8ab4f8] hover:underline flex items-center gap-0.5 cursor-pointer select-none bg-transparent border-none p-0"
                  >
                    <span>{isExpanded ? 'Collapse Details' : 'Read prompt'}</span>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full flex items-center gap-0.5 select-none">
                      <Zap size={9} />
                      <span>{task.productivityGain}</span>
                    </span>
                  </div>
                </div>

                {/* Expanded Details containing code prompt */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-[var(--border-color)]/60 animate-fade-in flex flex-col gap-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest select-none">
                      Target Prompt Template:
                    </span>
                    <pre className="bg-[var(--bg-code)] border border-[var(--border-color)] p-3 rounded-lg text-[10px] text-[#00acc1] dark:text-[#78d9ec] overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed select-all">
                      {task.samplePrompt}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* Benchmark Summary Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2 select-none">
          <ShieldCheck size={18} className="text-red-500" />
          <span>LLM Coding Benchmark Summary</span>
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs text-[var(--text-secondary)] text-left">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Capability</th>
                <th className="py-3 px-4 text-red-500">Claude 3.5 Sonnet</th>
                <th className="py-3 px-4 text-cyan-500">Gemini 2.5 Flash</th>
                <th className="py-3 px-4 text-emerald-500">Antigravity (Agentic)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              <tr>
                <td className="py-3 px-4 font-bold text-[var(--text-primary)]">Multi-file Coding</td>
                <td className="py-3 px-4">Substantial</td>
                <td className="py-3 px-4">Medium</td>
                <td className="py-3 px-4 font-semibold text-emerald-500">Complete</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-[var(--text-primary)]">Context Size</td>
                <td className="py-3 px-4">200k tokens</td>
                <td className="py-3 px-4">5,000k (5M) tokens</td>
                <td className="py-3 px-4">Workspace Indexing</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-[var(--text-primary)]">Execution Shell</td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4 font-semibold text-emerald-500">Yes (Sandbox)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
