'use client';

export default function MemoryPage() {
  const memories = [
    { category: "TECH_STACK", key: "Backend Engine", value: "FastAPI, Go, PostgreSQL, Redis", layer: "Long-Term" },
    { category: "TECH_STACK", key: "Frontend UI", value: "Next.js 14 App Router, Tailwind CSS, Lit-HTML", layer: "Long-Term" },
    { category: "PREFERENCES", key: "Complexity Goal", value: "O(1) hot paths, zero heap escapes", layer: "Long-Term" },
    { category: "PROJECTS", key: "Primary Domain", value: "thuyakyaw.com, ctoai.reiwasakura.tech", layer: "Working" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Personal AI Memory Vault</h1>
        <p className="text-slate-400 text-xs mt-1">
          4-tier memory architecture (Short-Term, Working, Long-Term, Knowledge).
        </p>
      </div>

      <div className="space-y-3">
        {memories.map((m, i) => (
          <div key={i} className="p-4 rounded-xl bg-[#11141D] border border-white/5 flex items-center justify-between text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-sky-400">[{m.category}]</span>
                <span className="text-slate-200 font-semibold">{m.key}</span>
              </div>
              <div className="text-slate-400">{m.value}</div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
              {m.layer}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
