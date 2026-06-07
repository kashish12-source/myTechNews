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
      description: 'The core algorithm of the Transformer. Enables each token in a sequence to dynamic score and aggregate information from all other tokens. By using Query, Key, and Value vectors, the model forms context pathways dynamically.',
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
      description: 'Applied token-wise after the attention layers. Consists of linear projection layers separated by a non-linear activation function (like SwiGLU or GELU). Act as the database where the model stores facts and general representations.',
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
    <div className="animate-fade-in">
      {/* Title Header */}
      <div className="glass" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
        <h1 className="title-header">
          LLM Architecture
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
          Interactive trace of forward pass layer mechanics in modern Autoregressive transformers.
        </p>
      </div>

      {/* Horizontal Step Progression Bar (No side panel clutter) */}
      <div className="glass" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        {componentsList.map((comp, index) => {
          const StepIcon = comp.icon;
          const isSelected = activeTab === comp.id;
          return (
            <div key={comp.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div className="tooltip">
                <button
                  onClick={() => setActiveTab(comp.id)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: isSelected ? 'var(--accent-blue)' : 'transparent',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: isSelected ? 'transparent' : 'var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <StepIcon size={16} />
                </button>
                <span className="tooltip-text">
                  {index + 1}. {comp.name}
                </span>
              </div>
              {index < componentsList.length - 1 && (
                <ChevronRight size={14} style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Inspector Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="glass" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>LAYER STAGE</span>
            <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{activeComponent.role}</span>
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            {activeComponent.name}
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            {activeComponent.description}
          </p>

          {/* Core Formula Block */}
          {activeComponent.math && (
            <div className="font-mono" style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)', 
              padding: '1rem 1.25rem', 
              borderRadius: '6px', 
              marginBottom: '1.5rem',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              overflowX: 'auto'
            }}>
              <Cpu size={16} style={{ color: 'var(--accent-cyan)', minWidth: '16px' }} />
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.15rem', fontFamily: "'Space Grotesk', sans-serif" }}>
                  Core Formula
                </div>
                <code>{activeComponent.math}</code>
              </div>
            </div>
          )}

          {/* Importance details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '3px solid var(--accent-blue)', paddingLeft: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              <ShieldAlert size={14} style={{ color: 'var(--accent-blue)' }} />
              Engineering Impact
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4' }}>
              {activeComponent.importance}
            </p>
          </div>
        </div>

        {/* Python Reference Implementation */}
        <div className="glass" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
            <Code size={14} />
            <span style={{ fontWeight: 500, fontSize: '0.8rem' }}>Reference Implementation (PyTorch / Py)</span>
          </div>
          
          <pre style={{ 
            background: 'var(--bg-code)', 
            color: '#a5b4fc', 
            padding: '1rem', 
            borderRadius: '6px', 
            fontSize: '0.75rem', 
            lineHeight: '1.5', 
            overflowX: 'auto',
            border: '1px solid var(--border-color)',
            fontFamily: 'Courier New, Courier, monospace'
          }}>
            <code>{activeComponent.codeSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
