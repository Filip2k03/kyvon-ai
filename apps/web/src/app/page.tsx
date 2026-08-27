import Link from 'next/link';
import { 
  MessageSquare, 
  Code2, 
  BrainCircuit, 
  BookOpen, 
  Bot, 
  Dna, 
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function DashboardPage() {
  const cards = [
    {
      title: "AI Chat & Inference",
      desc: "Conversational pairing with RAG knowledge injection, 5 adaptive modes, and persistent memory.",
      href: "/chat",
      icon: MessageSquare,
      badge: "ACTIVE",
      color: "from-sky-500/20 to-blue-500/5",
      iconColor: "text-sky-400"
    },
    {
      title: "Code Studio",
      desc: "AST complexity analysis, N+1 query detection, and 1-click error solving with drop-in fixes.",
      href: "/code",
      icon: Code2,
      badge: "50-RUBRIC",
      color: "from-cyan-500/20 to-teal-500/5",
      iconColor: "text-cyan-400"
    },
    {
      title: "Learning AI",
      desc: "PyTorch & Systems mastery roadmaps, interactive quizzes, and SM-2 3D flashcard decks.",
      href: "/learning",
      icon: BrainCircuit,
      badge: "SM-2 DECK",
      color: "from-indigo-500/20 to-purple-500/5",
      iconColor: "text-indigo-400"
    },
    {
      title: "Knowledge Base",
      desc: "Upload PDFs, docs, and codebases into searchable pgvector vector embedding space.",
      href: "/knowledge",
      icon: BookOpen,
      badge: "PGVECTOR",
      color: "from-emerald-500/20 to-green-500/5",
      iconColor: "text-emerald-400"
    },
    {
      title: "Autonomous Agents",
      desc: "Multi-agent orchestration: Planner ➔ Research ➔ Code ➔ Review bounded pipeline.",
      href: "/agents",
      icon: Bot,
      badge: "MULTI-AGENT",
      color: "from-amber-500/20 to-yellow-500/5",
      iconColor: "text-amber-400"
    },
    {
      title: "Personal Memory",
      desc: "4-tier memory vault (Short-Term, Working, Long-Term, Knowledge) for contextual pairing.",
      href: "/memory",
      icon: Dna,
      badge: "4-TIER",
      color: "from-rose-500/20 to-pink-500/5",
      iconColor: "text-rose-400"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Welcome */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0E131F] to-slate-900 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="text-xs font-mono text-sky-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KYVON AI OPERATING SYSTEM</span>
            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
            <span className="text-slate-400">PRODUCTION v2.2</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome, Operator Thu Ya Kyaw
          </h1>
          <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
            Your unified workspace for intelligent learning, code refactoring, personal memory, 
            and autonomous multi-agent pipelines with $O(1)$ latency bounds.
          </p>
        </div>
      </div>

      {/* Grid of Workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className="p-6 rounded-2xl bg-[#0E131F] border border-slate-800/60 hover:border-sky-500/40 transition-all hover:shadow-xl hover:shadow-sky-500/5 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} border border-white/5 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${c.iconColor} transition-transform group-hover:scale-110`} />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {c.badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white group-hover:text-sky-300 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    {c.desc}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-sky-400 transition-colors">
                <span>Open Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
