import Link from 'next/link';

export default function DashboardPage() {
  const cards = [
    {
      title: "AI Chat & Inference",
      desc: "Conversational pairing with RAG knowledge injection and persistent memory.",
      href: "/chat",
      icon: "💬",
      badge: "ACTIVE"
    },
    {
      title: "Code Studio",
      desc: "AST complexity analysis, N+1 query detection, and 1-click error solving.",
      href: "/code",
      icon: "💻",
      badge: "50-RUBRIC"
    },
    {
      title: "Learning AI",
      desc: "Mastery roadmaps, interactive quizzes, and spaced repetition flashcards.",
      href: "/learning",
      icon: "🧠",
      badge: "ADAPTIVE"
    },
    {
      title: "Knowledge Base (RAG)",
      desc: "Upload PDFs, docs, and codebases into searchable pgvector vector space.",
      href: "/knowledge",
      icon: "📚",
      badge: "PGVECTOR"
    },
    {
      title: "Autonomous Agents",
      desc: "Multi-agent orchestration: Planner ➔ Research ➔ Code ➔ Review pipeline.",
      href: "/agents",
      icon: "🤖",
      badge: "MULTI-AGENT"
    },
    {
      title: "Personal Memory",
      desc: "Short-term, working, long-term, and knowledge-tier memory management.",
      href: "/memory",
      icon: "🧬",
      badge: "4-TIER"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Welcome */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-[#11141D] to-slate-900 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="text-xs font-mono text-sky-400 uppercase tracking-widest flex items-center gap-2">
            <span>⚡ KYVON AI OPERATING SYSTEM</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            <span>PRODUCTION v2.2</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome, Operator Thu Ya Kyaw
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Your unified workspace for intelligent learning, code refactoring, personal memory, 
            and autonomous multi-agent pipelines.
          </p>
        </div>
      </div>

      {/* Grid of Workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="p-6 rounded-2xl bg-[#11141D] border border-white/5 hover:border-sky-500/40 transition-all hover:shadow-xl hover:shadow-sky-500/5 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl group-hover:scale-110 transition-transform">{c.icon}</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                  {c.badge}
                </span>
              </div>
              <h3 className="font-semibold text-lg text-white group-hover:text-sky-300 transition-colors">
                {c.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {c.desc}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-sky-400 transition-colors">
              <span>Open Workspace</span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
