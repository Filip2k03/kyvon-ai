export default function TopBar() {
  return (
    <header className="h-16 border-b border-[rgba(255,255,255,0.08)] bg-[#090a0f]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search knowledge, code, agents, documents (⌘K)..."
            className="w-full bg-slate-900/80 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Core v2.2 Online</span>
        </div>
        <div className="text-slate-400">TLSv1.3 · ctoai.reiwasakura.tech</div>
      </div>
    </header>
  );
}
