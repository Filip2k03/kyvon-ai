'use client';
import { useState } from 'react';

export default function KnowledgePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = () => {
    if (!query) return;
    setResults([
      {
        filename: "DPO_ALIGNMENT_GUIDE.md",
        similarity: 0.94,
        snippet: "Direct Preference Optimization reparameterizes the reward function directly in terms of the policy..."
      },
      {
        filename: "GPU_VRAM_KV_CACHE.py",
        similarity: 0.88,
        snippet: "Grouped-Query Attention (GQA) reduces KV cache memory footprint by 4x (32 query heads to 8 key-value heads)..."
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Knowledge Base & RAG Vector Search</h1>
        <p className="text-slate-400 text-xs mt-1">
          Vectorized pgvector document store with cosine similarity retrieval.
        </p>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Semantic search across all uploaded PDFs, code, and documentation..."
          className="flex-1 bg-[#11141D] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
        />
        <button
          onClick={handleSearch}
          className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-sky-500/20"
        >
          Search Vectors
        </button>
      </div>

      <div className="space-y-4">
        {results.map((r, i) => (
          <div key={i} className="p-4 rounded-xl bg-[#11141D] border border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sky-400 font-mono">📁 {r.filename}</span>
              <span className="text-emerald-400 font-mono">Score: {r.similarity}</span>
            </div>
            <p className="text-slate-300 leading-relaxed">{r.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
