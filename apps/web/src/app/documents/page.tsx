export default function DocumentsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Document Vault</h1>
      <p className="text-slate-400 text-xs">Upload PDFs, markdown files, and code repositories for indexing into pgvector.</p>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center text-xs text-slate-400 hover:border-sky-500/40 transition-colors">
        Drag & drop PDF, Markdown, or Code files here to vectorize
      </div>
    </div>
  );
}
