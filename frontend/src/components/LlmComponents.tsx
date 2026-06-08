import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Code, Cpu, ShieldAlert, ChevronRight, Scissors, LayoutGrid, Eye, Percent, Sliders, Heart } from 'lucide-react';

interface LlmComponent {
  id: string;
  name: string;
  role: string;
  description: string;
  math?: string;
  importance: string;
  codeSnippet: string;
  icon: LucideIcon;
}

const componentsList: LlmComponent[] = [
  {
    id: 'tokenization',
    name: 'Tokenization & Vocab',
    role: 'Text Preprocessing & Mapping',
    icon: Scissors,
    description: 'Breaks down raw string text into discrete numerical units (tokens) using algorithms like Byte-Pair Encoding (BPE) or WordPiece. These indices map directly to entries in the model\'s predefined vocabulary matrix.',
    math: 'x_text \\longrightarrow [t_1, t_2, ..., t_n] \\quad where \\quad t_i \\in \\{0, 1, ..., |V|-1\\}',
    importance: 'Determines the model\'s language support, handling of code syntax, spelling awareness, and context window efficiency (compression ratio).',
    codeSnippet: `# BPE Tokenizer Example using Tiktoken / Hugging Face
import tiktoken

tokenizer = tiktoken.get_encoding("cl100k_base")
tokens = tokenizer.encode("Antigravity is coding.")
print(tokens) # [12920, 2901, 311, 46101, 13]

decoded_text = tokenizer.decode(tokens)
print(decoded_text) # "Antigravity is coding."`
  },
  {
    id: 'embeddings',
    name: 'Semantic Embeddings',
    role: 'Dimensional Vector Space Mapping',
    icon: LayoutGrid,
    description: 'Translates token integers into dense continuous vector representations. This projects words into a high-dimensional vector space (e.g., 4096 or 8192 dimensions) where geometric distance represents semantic similarity.',
    math: 'E(t_i) = W_e \\cdot e_{t_i} \\quad where \\quad W_e \\in \\mathbb{R}^{d_{model} \\times |V|}',
    importance: 'Initializes the semantic meanings and features of tokens. Positional Embeddings (e.g., RoPE) are added here to provide the order/sequence coordinates of each token.',
    codeSnippet: `import torch
import torch.nn as nn

# Vocabulary size 100,000, model dimension 4096
embedding_layer = nn.Embedding(num_embeddings=100000, embedding_dim=4096)

input_tokens = torch.tensor([[12920, 2901]])
vectors = embedding_layer(input_tokens)
print(vectors.shape) # torch.Size([1, 2, 4096])`
  },
  {
    id: 'attention',
    name: 'Multi-Head Attention',
    role: 'Contextual Routing & Relationship Mapping',
    icon: Eye,
    description: 'The core algorithm of the Transformer. Enables each token in a sequence to dynamically score and aggregate information from all other tokens. By using Query, Key, and Value vectors, the model forms context pathways dynamically.',
    math: 'Attention(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V',
    importance: 'Enables long-range dependencies, syntax resolving, co-reference mapping, and dynamic context learning across millions of tokens.',
    codeSnippet: `import torch.nn.functional as F

def self_attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    # Scaled Dot-Product
    scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(d_k)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    weights = F.softmax(scores, dim=-1)
    # Output weighted values
    return torch.matmul(weights, V), weights`
  },
  {
    id: 'mlp',
    name: 'MLP / Feed-Forward Network',
    role: 'Feature Extraction & Fact Storage',
    icon: Cpu,
    description: 'Applied token-wise after the attention layers. Consists of linear projection layers separated by a non-linear activation function (like SwiGLU or GELU). Acts as the database where the model stores facts and general representations.',
    math: 'SwiGLU(x) = (x W_1 \\otimes \\text{swish}(x W_2)) W_3',
    importance: 'Holds the vast majority of the static knowledge, rules, and facts learned by the network during pretraining.',
    codeSnippet: `class SwiGLUPackage(nn.Module):
    def __init__(self, d_model, d_ff):
        super().__init__()
        self.w1 = nn.Linear(d_model, d_ff, bias=False)
        self.w2 = nn.Linear(d_model, d_ff, bias=False)
        self.w3 = nn.Linear(d_ff, d_model, bias=False)
        
    def forward(self, x):
        # Swish(x * w2) * (x * w1) -> output linear projection
        return self.w3(F.silu(self.w2(x)) * self.w1(x))`
  },
  {
    id: 'norm',
    name: 'LayerNorm & Residuals',
    role: 'Signal Preservation & Numerical Stability',
    icon: Sliders,
    description: 'Residual (skip) connections add inputs directly to output layers, allowing raw signals to bypass attention/MLP. Normalization layers (RMSNorm) scale weights, keeping activations from exploding or vanishing.',
    math: 'RMSNorm(x) = \\frac{x}{\\sqrt{\\frac{1}{d}\\sum_{i=1}^d x_i^2 + \\epsilon}} \\odot \\gamma',
    importance: 'Without residual connections and layer normalization, deep models (e.g. 70B+ parameters) cannot train because gradients would vanish in early layers.',
    codeSnippet: `# RMSNorm Implementation
class RMSNorm(nn.Module):
    def __init__(self, dim, eps=1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))
        
    def forward(self, x):
        variance = x.pow(2).mean(-1, keepdim=True)
        return x * torch.rsqrt(variance + self.eps) * self.weight`
  },
  {
    id: 'alignment',
    name: 'Alignment (RLHF & DPO)',
    role: 'Safety & Instruction-Following',
    icon: Heart,
    description: 'Post-training methods used to align base models to follow user instructions safely. Supervised Fine-Tuning (SFT) is followed by Reinforcement Learning from Human Feedback (RLHF) or Direct Preference Optimization (DPO).',
    math: '\\mathcal{L}_{DPO}(\\pi_\\theta; \\pi_{ref}) = -\\mathbb{E}_{(x, y_w, y_l)} \\left[ \\log \\sigma \\left( \\beta \\log \\frac{\\pi_\\theta(y_w|x)}{\\pi_{ref}(y_w|x)} - \\beta \\log \\frac{\\pi_\\theta(y_l|x)}{\\pi_{ref}(y_l|x)} \\right) \\right]',
    importance: 'Transforms a raw text-continuation statistical model into a helpful assistant, setting tone, reducing toxicity, and enabling system instructions.',
    codeSnippet: `# SFT Trainer invocation using Hugging Face TRL library
from trl import SFTTrainer
from transformers import TrainingArguments

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=4096,
    args=TrainingArguments(
        output_dir="./results",
        learning_rate=2e-5,
        logging_steps=10
    )
)`
  },
  {
    id: 'quantization',
    name: 'Quantization & Optimizations',
    role: 'Hardware Scaling & VRAM Reduction',
    icon: Percent,
    description: 'Downscales precision representation of parameters from standard FP32 or BF16 to lower bitweights (FP8, FP4, INT8, INT4). Algorithms like AWQ (Activation-aware Weight Quantization) minimize perplexity degradation.',
    math: 'q = \\text{clamp}\\left( \\text{round}\\left( \\frac{w}{scale} \\right) + zero\\_point, q_{min}, q_{max} \\right)',
    importance: 'Enables deploying massive models on consumer hardware or scaling concurrent user requests. For example, running a 70B model requires ~140GB VRAM in BF16, but only ~38GB in INT4.',
    codeSnippet: `# Quantizing with AutoGPTQ (Standard 4-bit)
from auto_gptq import AutoGPTQForCausalLM, BaseQuantizeConfig

quantize_config = BaseQuantizeConfig(
    bits=4,
    group_size=128,
    desc_act=False
)
# Load reference base model and execute quantization sweep
# (Typically integrated into DevOps/MLOps pipelines before deployment)`
  }
];

export default function LlmComponents() {
  const [activeTab, setActiveTab] = useState<string>('tokenization');

  const activeComponent = componentsList.find(c => c.id === activeTab) || componentsList[0];

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      
      {/* Title Header */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          LLM Architecture
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1.5">
          Interactive trace of forward pass layer mechanics in modern Autoregressive transformers.
        </p>
      </div>

      {/* Horizontal Step Progression Bar */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex items-center justify-center flex-wrap gap-2 shadow-sm">
        {componentsList.map((comp, index) => {
          const StepIcon = comp.icon;
          const isSelected = activeTab === comp.id;
          return (
            <div key={comp.id} className="flex items-center">
              <button
                onClick={() => setActiveTab(comp.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border cursor-pointer select-none ${
                  isSelected 
                    ? 'bg-[#1a73e8] border-[#1a73e8] text-white shadow-sm' 
                    : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-[#1a73e8] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title={`${index + 1}. ${comp.name}`}
              >
                <StepIcon size={16} />
              </button>
              {index < componentsList.length - 1 && (
                <ChevronRight size={14} className="mx-2 text-slate-400" />
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Inspector Panel formatted exactly like DevTools/Coding cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Explanations (2/3 width) formatted as news card */}
        <div className="lg:col-span-2 google-news-card p-6 flex flex-col justify-between">
          <div>
            {/* Header badges */}
            <div className="flex justify-between items-center mb-3.5">
              <span className="px-2.5 py-0.5 rounded border text-[9px] font-bold tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                Layer Stage
              </span>
              <span className="px-2.5 py-0.5 rounded border text-[9px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                {activeComponent.role}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base md:text-lg font-bold text-[var(--text-primary)] hover:text-[#1a73e8] mb-3 leading-snug">
              {activeComponent.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              {activeComponent.description}
            </p>

            {/* Math Box */}
            {activeComponent.math && (
              <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-lg flex items-start gap-3 text-[#00acc1] dark:text-[#78d9ec] overflow-x-auto select-all mb-4">
                <Cpu size={16} className="text-[#00acc1] dark:text-[#78d9ec] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-1">
                    Core Formula
                  </div>
                  <code className="text-xs font-mono">{activeComponent.math}</code>
                </div>
              </div>
            )}
          </div>

          {/* Footer border with impact */}
          <div className="border-t border-[var(--border-color)] pt-4 mt-2 flex flex-col gap-2">
            <div className="flex gap-1.5 items-center font-bold text-xs text-[#1a73e8] dark:text-[#8ab4f8] uppercase tracking-wide">
              <ShieldAlert size={14} className="shrink-0" />
              <span>Engineering Impact</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {activeComponent.importance}
            </p>
          </div>
        </div>

        {/* Right Column: Code snippet (1/3 width) formatted as news card */}
        <div className="google-news-card p-5 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#00acc1] dark:text-[#78d9ec] border-b border-[var(--border-color)] pb-3 font-semibold uppercase tracking-wider select-none mb-3">
              <Code size={14} />
              <span>PyTorch Implementation</span>
            </div>
            
            <pre className="bg-[var(--bg-code)] border border-[var(--border-color)] p-4 rounded-xl text-[11px] text-indigo-600 dark:text-indigo-300 overflow-x-auto whitespace-pre font-mono leading-relaxed select-all">
              <code>{activeComponent.codeSnippet}</code>
            </pre>
          </div>
        </div>

      </div>

    </div>
  );
}
