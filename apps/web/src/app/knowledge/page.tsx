'use client';
import { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  Sliders, 
  Database, 
  FileText, 
  ArrowUpRight, 
  Copy, 
  Check,
  Zap,
  Filter
} from 'lucide-react';

interface SearchResult {
  id: string;
  filename: string;
  type: string;
  similarity: number;
  snippet: string;
  tokens: number;
}

const PRESET_QUERIES = [
  "How does Direct Preference Optimization reparameterize the reward function?",
  "KV cache memory reduction in Grouped-Query Attention (GQA)",
  "Lock-free WebSocket channel broadcasting in C++ and uWebSockets",
  "PostgreSQL pgvector HNSW indexing and cosine similarity bounds"
];

const MOCK_CORPUS: SearchResult[] = [
  {
    id: "r1",
    filename: "DPO_ALIGNMENT_GUIDE.md",
    type: "Markdown",
    similarity: 0.96,
    snippet: "Direct Preference Optimization (DPO) reparameterizes the reward function r(x, y) = β * log(π_θ(y|x) / π_ref(y|x)). This directly optimizes the language model policy using a binary cross-entropy loss over preferred vs rejected response pairs without an explicit RL reward model.",
    tokens: 42
  },
  {
    id: "r2",
    filename: "GPU_VRAM_KV_CACHE.py",
    type: "Python",
    similarity: 0.91,
    snippet: "Grouped-Query Attention (GQA) groups key-value attention heads (e.g. 32 query heads divided across 8 KV heads). This yields a 4x reduction in KV cache memory bandwidth and VRAM allocation during autoregressive decoding while preserving multi-head attention expressive capacity.",
    tokens: 38
  },
  {
    id: "r3",
    filename: "DISTRIBUTED_RAFT_CONSENSUS.md",
    type: "Markdown",
    similarity: 0.84,
    snippet: "Raft consensus achieves state machine safety through randomized election timers (150ms-300ms) and strong leader log matching. Invariants ensure that an entry committed in a given term will be present in all future leader logs.",
    tokens: 35
  },
  {
    id: "r4",
    filename: "UWS_SOCKET_ROUTING.ts",
    type: "TypeScript",
    similarity: 0.81,
    snippet: "uWebSockets.js maps socket descriptors directly into native C++ epoll/kqueue structures, enabling O(1) connection lookup and zero-heap message broadcasting via kernel ring buffers.",
    tokens: 31
  }
];

export default function KnowledgePage() {
  const [query, setQuery] = useState('');
  const [minSimilarity, setMinSimilarity] = useState(0.80);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const executeSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    setTimeout(() => {
      const qLower = searchQuery.toLowerCase();
      const filtered = MOCK_CORPUS.filter((c) => c.similarity >= minSimilarity).map((c) => {
        let boost = 0;
        if (qLower.includes("dpo") && c.filename.includes("DPO")) boost = 0.03;
        if (qLower.includes("kv") && c.filename.includes("KV")) boost = 0.04;
        if (qLower.includes("websocket") && c.filename.includes("UWS")) boost = 0.05;
        return { ...c, similarity: Math.min(0.99, Number((c.similarity + boost).toFixed(2))) };
      });

      setResults(filtered.sort((a, b) => b.similarity - a.similarity));
      setIsSearching(false);
    }, 250);
  };

  const copySnippet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Knowledge Base & Semantic RAG Search</h1>
          <p className="text-slate-400 text-xs mt-1">
            PostgreSQL pgvector Vector Store • Cosine Similarity Indexing • Context Injection
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-sky-400 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>MiniLM-L6-v2 (384-dim)</span>
          </span>
        </div>
      </div>

      {/* Search Input Card */}
      <div className="p-6 rounded-2xl bg-[#0E131F] border border-slate-800/80 space-y-4 shadow-xl">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') executeSearch();
              }}
              placeholder="Ask a technical question or search vectorized code, docs, and memory..."
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors shadow-inner"
            />
          </div>
          <button
            onClick={() => executeSearch()}
            disabled={isSearching || !query.trim()}
            className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Zap className="w-3.5 h-3.5" />
            )}
            <span>Search Vectors</span>
          </button>
        </div>

        {/* Preset Queries */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-slate-500 font-mono">Suggested Vector Lookups:</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_QUERIES.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(q);
                  executeSearch(q);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800/60 text-slate-400 hover:text-slate-200 transition-all text-left truncate max-w-sm"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Similarity Threshold Filter */}
        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <span>Minimum Similarity Threshold:</span>
            <span className="font-mono text-emerald-400 font-semibold">{minSimilarity.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.50"
            max="0.95"
            step="0.05"
            value={minSimilarity}
            onChange={(e) => setMinSimilarity(Number(e.target.value))}
            className="w-48 accent-sky-500"
          />
        </div>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Retrieved <strong>{results.length}</strong> relevant chunks with pgvector cosine similarity</span>
            <span className="font-mono text-[11px] text-emerald-400">Latency: 1.24ms</span>
          </div>

          {results.map((r, idx) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-[#0E131F] border border-slate-800/80 hover:border-sky-500/40 transition-all space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-950/60 border border-sky-800/40 text-sky-400 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-white">{r.filename}</span>
                    <span className="text-[10px] font-mono text-slate-500 ml-2">[{r.type}]</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                    Similarity: {(r.similarity * 100).toFixed(0)}%
                  </span>
                  <button
                    onClick={() => copySnippet(r.snippet, idx)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
                    title="Copy snippet"
                  >
                    {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-3.5 rounded-xl border border-slate-800/60 font-mono">
                {r.snippet}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                <span>Vector Dimension: 384 • Tokens: {r.tokens}</span>
                <span className="text-sky-400 flex items-center gap-1 cursor-pointer hover:underline">
                  <span>Inject into Active Chat</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
