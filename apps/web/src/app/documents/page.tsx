'use client';
import { useState } from 'react';
import { 
  FolderKanban, 
  UploadCloud, 
  FileText, 
  Trash2, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Database,
  Layers,
  Sliders
} from 'lucide-react';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  chunks: number;
  tokens: number;
  uploadedAt: string;
}

const INITIAL_DOCS: DocumentItem[] = [
  {
    id: "doc-1",
    name: "DPO_ALIGNMENT_GUIDE.md",
    type: "Markdown",
    size: "42.8 KB",
    chunks: 14,
    tokens: 4200,
    uploadedAt: "2026-08-27 18:30"
  },
  {
    id: "doc-2",
    name: "GPU_VRAM_KV_CACHE.py",
    type: "Python",
    size: "18.4 KB",
    chunks: 6,
    tokens: 1840,
    uploadedAt: "2026-08-27 19:15"
  },
  {
    id: "doc-3",
    name: "DISTRIBUTED_RAFT_CONSENSUS.md",
    type: "Markdown",
    size: "64.2 KB",
    chunks: 21,
    tokens: 6420,
    uploadedAt: "2026-08-27 20:00"
  }
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCS);
  const [chunkSize, setChunkSize] = useState(500);
  const [chunkOverlap, setChunkOverlap] = useState(50);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);
    setTimeout(() => {
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || 'TXT',
        size: `${(file.size / 1024).toFixed(1)} KB`,
        chunks: Math.ceil(file.size / (chunkSize * 4)),
        tokens: Math.ceil(file.size / 4),
        uploadedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };
      setDocuments((prev) => [newDoc, ...prev]);
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 600);
  };

  const deleteDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Document Vault & Vector Ingestion</h1>
          <p className="text-slate-400 text-xs mt-1">
            PostgreSQL pgvector Store • MiniLM 384-dim Embeddings • Chunking Telemetry
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>Active Vault Docs: {documents.length}</span>
          </span>
        </div>
      </div>

      {/* Upload & Ingestion Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Dropzone */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0E131F] border border-slate-800/80 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">Vectorize & Ingest Document</label>
            {uploadSuccess && <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Indexed Successfully</span>}
          </div>

          <label className="border-2 border-dashed border-slate-800 hover:border-sky-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-950/40 group">
            <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-sky-400 transition-colors mb-2" />
            <div className="text-xs font-semibold text-slate-300">
              {isUploading ? 'Chunking and generating embeddings...' : 'Click or Drag & Drop Document Here'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Supports PDF, Markdown, TypeScript, Python, JSON (Max 25MB)
            </div>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              accept=".pdf,.md,.txt,.py,.ts,.tsx,.json"
            />
          </label>
        </div>

        {/* Chunking Sliders Card */}
        <div className="p-6 rounded-2xl bg-[#0E131F] border border-slate-800/80 space-y-5 text-xs shadow-xl">
          <div className="flex items-center gap-2 text-slate-300 font-semibold border-b border-slate-800/60 pb-3">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Chunking Strategy</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Chunk Size (Words)</span>
              <span className="font-mono text-sky-400">{chunkSize}</span>
            </div>
            <input
              type="range"
              min="200"
              max="1000"
              step="50"
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Overlap Window</span>
              <span className="font-mono text-emerald-400">{chunkOverlap} words</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="10"
              value={chunkOverlap}
              onChange={(e) => setChunkOverlap(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="p-3 rounded-lg bg-black/40 border border-slate-800/60 font-mono text-[10px] text-slate-500">
            Cosine Metric: Normalized Dot Product in 384-dimensional Euclidean space.
          </div>
        </div>
      </div>

      {/* Ingested Documents List */}
      <div className="p-6 rounded-2xl bg-[#0E131F] border border-slate-800/80 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
          <h2 className="text-xs font-semibold text-slate-300 uppercase font-mono">Vectorized Document Repository</h2>
          <span className="text-[11px] text-slate-500 font-mono">{documents.length} Items</span>
        </div>

        <div className="space-y-2.5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-700 transition-all flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-950/60 border border-sky-800/40 text-sky-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200">{doc.name}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                    <span>{doc.type}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>{doc.chunks} Chunks ({doc.tokens} Tokens)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">{doc.uploadedAt}</span>
                <button
                  onClick={() => deleteDoc(doc.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
