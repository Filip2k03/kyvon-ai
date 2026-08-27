'use client';
import { useState } from 'react';
import { 
  Dna, 
  Layers, 
  Plus, 
  Trash2, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  HardDrive,
  Cpu,
  Bookmark
} from 'lucide-react';

interface MemoryItem {
  id: string;
  category: 'TECH_STACK' | 'PREFERENCES' | 'PROJECTS' | 'INVARIANTS' | 'SECURITY';
  key: string;
  value: string;
  layer: 'Request' | 'Working' | 'Long-Term' | 'Knowledge';
  createdAt: string;
}

const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: "mem-1",
    category: "TECH_STACK",
    key: "Backend Core",
    value: "FastAPI, PostgreSQL 16 (pgvector), Redis 7, uWebSockets.js, Mediasoup SFU",
    layer: "Long-Term",
    createdAt: "2026-08-27 12:00"
  },
  {
    id: "mem-2",
    category: "TECH_STACK",
    key: "Frontend Architecture",
    value: "Next.js 14 App Router, Tailwind CSS, Lucide React, Lit-HTML mobile PWA",
    layer: "Long-Term",
    createdAt: "2026-08-27 12:00"
  },
  {
    id: "mem-3",
    category: "PREFERENCES",
    key: "Engineering Invariants",
    value: "O(1) hot paths, zero heap escapes on query loops, constant-time cryptography, 50-condition CTO rubric",
    layer: "Long-Term",
    createdAt: "2026-08-27 14:30"
  },
  {
    id: "mem-4",
    category: "PROJECTS",
    key: "Operator & Ecosystem",
    value: "Operator: Thu Ya Kyaw (thuyakyaw.com) • Host: ctoai.reiwasakura.tech • Repo: Filip2k03/kyvon-ai",
    layer: "Working",
    createdAt: "2026-08-27 18:00"
  },
  {
    id: "mem-5",
    category: "INVARIANTS",
    key: "VPS Infrastructure Constraint",
    value: "Strict rule: Never modify VPS IP 187.127.110.32 directly during normal deployment passes",
    layer: "Long-Term",
    createdAt: "2026-08-27 19:15"
  },
  {
    id: "mem-6",
    category: "SECURITY",
    key: "Password & Token Invariant",
    value: "Constant-time scrypt/PBKDF2 hashing, HS256 JWT, zero hardcoded tokens in git repositories",
    layer: "Long-Term",
    createdAt: "2026-08-27 20:00"
  }
];

export default function MemoryPage() {
  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_MEMORIES);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryItem['category']>('TECH_STACK');
  const [newLayer, setNewLayer] = useState<MemoryItem['layer']>('Long-Term');

  const filteredMemories = memories.filter(
    (m) => activeCategory === 'ALL' || m.category === activeCategory
  );

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    const newItem: MemoryItem = {
      id: `mem-${Date.now()}`,
      category: newCategory,
      key: newKey.trim(),
      value: newValue.trim(),
      layer: newLayer,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    setMemories((prev) => [newItem, ...prev]);
    setNewKey('');
    setNewValue('');
    setShowAddForm(false);
  };

  const deleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const clearWorkingMemory = () => {
    setMemories((prev) => prev.filter((m) => m.layer !== 'Working'));
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(memories, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `kyvon_memory_vault_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Personal AI Memory Vault</h1>
          <p className="text-slate-400 text-xs mt-1">
            4-Tier Layered Memory Architecture (Request, Working, Long-Term, Knowledge)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportJSON}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-all shadow-lg shadow-sky-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Memory</span>
          </button>
        </div>
      </div>

      {/* 4-Tier Memory Architecture Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0E131F] border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Request Memory</span>
            <Cpu className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-[11px] text-slate-500">Ephemeral single-request token budget. Auto-discarded.</p>
          <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">TTL: 0s (Discarded)</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0E131F] border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-sky-400">Working Memory</span>
            <Sparkles className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-[11px] text-slate-500">Active session context & ongoing task state.</p>
          <div className="text-[10px] font-mono text-sky-400 pt-2 border-t border-slate-800/60">
            {memories.filter((m) => m.layer === 'Working').length} Active Items
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0E131F] border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-400">Long-Term Memory</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-[11px] text-slate-500">Persistent operator profile, tech preferences, and invariants.</p>
          <div className="text-[10px] font-mono text-emerald-400 pt-2 border-t border-slate-800/60">
            {memories.filter((m) => m.layer === 'Long-Term').length} Stored Items
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0E131F] border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-400">Knowledge Memory</span>
            <Bookmark className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-[11px] text-slate-500">pgvector cosine embeddings from documents and codebases.</p>
          <div className="text-[10px] font-mono text-indigo-400 pt-2 border-t border-slate-800/60">HNSW Vector Space</div>
        </div>
      </div>

      {/* Add Memory Form */}
      {showAddForm && (
        <form onSubmit={handleAddMemory} className="p-6 rounded-2xl bg-[#0E131F] border border-sky-500/40 space-y-4 shadow-xl">
          <h2 className="text-xs font-semibold text-white uppercase font-mono">Add New Memory Invariant</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Memory Key / Title</label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="e.g. Primary Cloud Provider"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="TECH_STACK">TECH_STACK</option>
                  <option value="PREFERENCES">PREFERENCES</option>
                  <option value="PROJECTS">PROJECTS</option>
                  <option value="INVARIANTS">INVARIANTS</option>
                  <option value="SECURITY">SECURITY</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Layer</label>
                <select
                  value={newLayer}
                  onChange={(e) => setNewLayer(e.target.value as any)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Long-Term">Long-Term</option>
                  <option value="Working">Working</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Memory Value / Context</label>
            <textarea
              rows={2}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="e.g. Prefer AWS ap-northeast-1 / Vercel Edge with zero downtime deployment"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-sky-500/20"
            >
              Save Memory
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs & Working Memory Purge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 p-1 bg-black/40 rounded-xl border border-slate-800/60 text-xs">
          {['ALL', 'TECH_STACK', 'PREFERENCES', 'PROJECTS', 'INVARIANTS', 'SECURITY'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={clearWorkingMemory}
          className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1 font-mono"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Purge Working Memory</span>
        </button>
      </div>

      {/* Memories List */}
      <div className="space-y-3">
        {filteredMemories.map((m) => (
          <div
            key={m.id}
            className="p-5 rounded-2xl bg-[#0E131F] border border-slate-800/80 hover:border-slate-700 transition-all flex items-start justify-between text-xs group"
          >
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/40 text-sky-400 font-semibold">
                  [{m.category}]
                </span>
                <span className="text-slate-200 font-semibold text-sm">{m.key}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  m.layer === 'Long-Term'
                    ? 'bg-emerald-950/60 border-emerald-800/40 text-emerald-400'
                    : 'bg-sky-950/60 border-sky-800/40 text-sky-400'
                }`}>
                  {m.layer}
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">{m.value}</p>
              <div className="text-[10px] font-mono text-slate-600">Created: {m.createdAt}</div>
            </div>

            <button
              onClick={() => deleteMemory(m.id)}
              className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all opacity-0 group-hover:opacity-100"
              title="Delete Memory"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
