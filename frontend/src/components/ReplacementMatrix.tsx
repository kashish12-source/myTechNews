import { useState, useMemo } from 'react';
import { ShieldCheck, Info, Search, Code, CheckCircle, Zap, Workflow, Paintbrush, FileText, LayoutGrid, ChevronDown } from 'lucide-react';

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
      case 'Complete': return 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30';
      case 'Substantial': return 'text-cyan-400 bg-cyan-950/40 border-cyan-900/30';
      default: return 'text-blue-400 bg-blue-950/40 border-blue-900/30';
    }
  };

  const getEaseBadgeClass = (ease: string) => {
    switch (ease) {
      case 'Easy': return 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30';
      case 'Medium': return 'text-cyan-400 bg-cyan-950/40 border-cyan-900/30';
      default: return 'text-red-400 bg-red-950/40 border-red-900/30';
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      
      {/* Title Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
          AI Replacement Matrix
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Compare workflow automation mappings across various engineering and technical roles.
        </p>
      </div>

      {/* Toolbar - Search & Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-4 items-center flex-wrap">
        <div className="relative w-full sm:w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input 
            type="text" 
            placeholder="Search matrix..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-red-600 rounded-lg pl-9 pr-4 py-1.5 text-xs outline-none transition-all placeholder:text-slate-500"
          />
        </div>

        <div className="hidden sm:block w-px h-6 bg-slate-800"></div>

        {/* Roles Selection Bar */}
        <div className="flex gap-2 items-center flex-wrap">
          {roles.map(r => {
            const RoleIcon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                  isSelected 
                    ? 'bg-red-600 border-red-700 text-white shadow-md' 
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <RoleIcon size={13} />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex flex-col gap-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-400">
            <p className="text-sm">No automation mappings match your criteria.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-red-900/30 text-red-400 bg-red-950/20">
                    {roles.find(r => r.id === task.role)?.label || task.role}
                  </span>
                  <h3 className="text-base font-serif font-bold text-white mt-2">
                    {task.taskName}
                  </h3>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getLevelBadgeClass(task.replacementLevel)}`}>
                    Auto: {task.replacementLevel}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border text-cyan-400 bg-cyan-950/20 border-cyan-900/30 flex items-center gap-1">
                    <Zap size={10} /> {task.productivityGain}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/50 pt-4 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mb-1">
                    Primary Tool Replacement
                  </div>
                  <div className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    {task.replacementTool}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mb-1">
                    Setup Complexity
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getEaseBadgeClass(task.setupEase)}`}>
                    {task.setupEase}
                  </span>
                </div>
              </div>

              {/* Expandable Prompt & Workflow */}
              <div className="mt-1">
                <button 
                  className="w-full flex justify-between items-center px-4 py-2 border border-slate-800 bg-slate-950 hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg text-xs font-semibold tracking-wide transition-all"
                  onClick={() => setActiveTaskInfo(activeTaskInfo === task.id ? null : task.id)}
                >
                  <span>Integration Workflow & Prompts</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${activeTaskInfo === task.id ? 'rotate-180' : ''}`} />
                </button>

                {activeTaskInfo === task.id && (
                  <div className="mt-3 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col gap-4 animate-fade-in">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1 mb-1">
                        <Info size={11} className="text-red-500" />
                        <span>Automation Workflow</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {task.workflow}
                      </p>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1 mb-1.5">
                        <Code size={11} className="text-cyan-500" />
                        <span>Target Prompt Example</span>
                      </div>
                      <pre className="bg-slate-900 border border-slate-850 p-3 rounded-lg text-[11px] text-cyan-400 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                        {task.samplePrompt}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>
      
      {/* Benchmark Summary Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-base font-serif font-bold text-white mb-4 flex items-center gap-2 select-none">
          <ShieldCheck size={18} className="text-red-500" />
          <span>LLM Coding Benchmark Summary</span>
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs text-slate-300 text-left">
            <thead>
              <tr className="border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Capability</th>
                <th className="py-3 px-4 text-red-500">Claude 3.5 Sonnet</th>
                <th className="py-3 px-4 text-cyan-400">Gemini 2.5 Flash</th>
                <th className="py-3 px-4 text-emerald-400">Antigravity (Agentic)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-200">Multi-file Coding</td>
                <td className="py-3 px-4">Substantial</td>
                <td className="py-3 px-4">Medium</td>
                <td className="py-3 px-4 font-semibold text-emerald-400">Complete</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-200">Context Size</td>
                <td className="py-3 px-4">200k tokens</td>
                <td className="py-3 px-4">5,000k (5M) tokens</td>
                <td className="py-3 px-4">Workspace Indexing</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-200">Execution Shell</td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4 font-semibold text-emerald-400">Yes (Sandbox)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
