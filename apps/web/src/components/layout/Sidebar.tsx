import Link from 'next/link';

export default function Sidebar() {
  const navItems = [
    { label: "Dashboard", href: "/", icon: "⚡" },
    { label: "AI Chat", href: "/chat", icon: "💬" },
    { label: "Code Studio", href: "/code", icon: "💻" },
    { label: "Learning AI", href: "/learning", icon: "🧠" },
    { label: "Knowledge Base", href: "/knowledge", icon: "📚" },
    { label: "AI Agents", href: "/agents", icon: "🤖" },
    { label: "Memory", href: "/memory", icon: "🧬" },
    { label: "Documents", href: "/documents", icon: "📁" },
    { label: "Settings", href: "/settings", icon: "⚙️" },
  ];

  return (
    <aside className="w-64 bg-[#0d1017] border-r border-[rgba(255,255,255,0.08)] flex flex-col justify-between p-4 h-screen fixed left-0 top-0 select-none z-30">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-[rgba(255,255,255,0.06)]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/20">
            K
          </div>
          <div>
            <div className="font-bold text-sm text-white tracking-wider flex items-center gap-2">
              KYVON AI <span className="text-[10px] bg-emerald-950/80 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/50">PROD</span>
            </div>
            <div className="text-[11px] text-slate-400">AI Operating System</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all group"
            >
              <span className="text-base group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Operator Footer */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400">
        <div className="font-semibold text-slate-200">Thu Ya Kyaw</div>
        <div className="text-[11px] text-slate-500">thuyakyaw.com · CTO</div>
      </div>
    </aside>
  );
}
