import { useState } from 'react';
import { Code, Cpu, ShieldAlert, ChevronRight } from 'lucide-react';

interface LlmComponent {
  id: string;
  name: string;
  role: string;
  description: string;
  math?: string;
  importance: string;
  codeSnippet: string;
}

export default function LlmComponents() {
  const [activeTab, setActiveTab] = useState<string>('tokenization');

  const componentsList: LlmComponent[] = [
    {
      id: 'tokenization',
      name: 'Tokenization & Vocab',
      role: 'Text Preprocessing & Mapping',
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
      role: 'Safety, Instruction-Following & Persona Tuning',
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

  const activeComponent = componentsList.find(c => c.id === activeTab) || componentsList[0];

  return (
    <div className="animate-fade-in">
      <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h1 className="font-tech glow-text" style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(to right, #ff007f, #7000ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
          LLM ARCHITECTURE & LAYERS
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          An interactive engineering deep-dive into the mechanical components that power modern Autoregressive Large Language Models.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
        {/* Navigation Sidebar */}
        <div className="glass" style={{ padding: '1rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '0.75rem', marginBottom: '1rem', letterSpacing: '1px' }}>
            Forward Pass Pipeline
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {componentsList.map((comp, index) => (
              <button
                key={comp.id}
                onClick={() => setActiveTab(comp.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '1rem 0.75rem',
                  borderRadius: '8px',
                  background: activeTab === comp.id ? 'rgba(255, 0, 127, 0.1)' : 'transparent',
                  border: '1px solid',
                  borderColor: activeTab === comp.id ? 'var(--accent-magenta)' : 'transparent',
                  color: activeTab === comp.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    background: activeTab === comp.id ? 'var(--accent-magenta)' : 'var(--border-color)',
                    color: '#060913',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    {index + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{comp.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{comp.role}</div>
                  </div>
                </div>
                <ChevronRight size={16} style={{ opacity: activeTab === comp.id ? 1 : 0.3 }} />
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Inspector Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card Meta */}
          <div className="glass" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="badge badge-magenta">Layer Component</span>
              <span className="badge badge-purple">{activeComponent.role}</span>
            </div>

            <h2 className="glow-text font-tech" style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              {activeComponent.name}
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              {activeComponent.description}
            </p>

            {/* Formula Block */}
            {activeComponent.math && (
              <div style={{ 
                background: 'rgba(0,0,0,0.25)', 
                border: '1px solid var(--border-color)', 
                padding: '1.25rem', 
                borderRadius: '8px', 
                marginBottom: '1.5rem',
                fontFamily: 'monospace',
                fontSize: '1rem',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                overflowX: 'auto'
              }}>
                <Cpu size={20} style={{ minWidth: '20px' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Core Formula / Concept</div>
                  <code>{activeComponent.math}</code>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 600, color: 'var(--text-primary)' }}>
                <ShieldAlert size={16} style={{ color: 'var(--accent-magenta)' }} />
                Architectural Importance
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', paddingLeft: '1.5rem' }}>
                {activeComponent.importance}
              </p>
            </div>
          </div>

          {/* Implementation Code */}
          <div className="glass" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
              <Code size={18} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>PyTorch / Python Implementation Reference</span>
            </div>
            
            <pre style={{ 
              background: '#040810', 
              color: '#a5b4fc', 
              padding: '1.25rem', 
              borderRadius: '8px', 
              fontSize: '0.85rem', 
              lineHeight: '1.6', 
              overflowX: 'auto',
              border: '1px solid var(--border-color)',
              fontFamily: 'Courier New, Courier, monospace'
            }}>
              <code>{activeComponent.codeSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
