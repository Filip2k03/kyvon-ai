'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Zap, 
  MessageSquare, 
  Code2, 
  BrainCircuit, 
  BookOpen, 
  Bot, 
  Dna, 
  FolderKanban, 
  Settings,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/", icon: Zap },
    { label: "AI Chat", href: "/chat", icon: MessageSquare },
    { label: "Code Studio", href: "/code", icon: Code2 },
    { label: "Learning AI", href: "/learning", icon: BrainCircuit },
    { label: "Knowledge Base", href: "/knowledge", icon: BookOpen },
    { label: "AI Agents", href: "/agents", icon: Bot },
    { label: "Memory Vault", href: "/memory", icon: Dna },
    { label: "Documents", href: "/documents", icon: FolderKanban },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0A0D14] border-r border-slate-800/60 flex flex-col justify-between p-4 h-screen fixed left-0 top-0 select-none z-30">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-800/40">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center font-mono font-bold text-white shadow-lg shadow-sky-500/20 text-sm">
            K
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-100 tracking-wide flex items-center gap-2">
              KYVON AI <span className="text-[10px] font-mono bg-emerald-950/70 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/40">v2.2</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">Autonomous Core OS</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive 
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 ${isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Operator Footer */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-200 text-[11px]">Thu Ya Kyaw</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-[10px] font-mono text-slate-500">thuyakyaw.com · CTO</div>
      </div>
    </aside>
  );
}
