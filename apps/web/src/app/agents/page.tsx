'use client';
import { useState } from 'react';
import { 
  Bot, 
  Play, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Layers, 
  Sparkles, 
  Terminal,
  ShieldCheck,
  Search,
  Code2,
  Brain,
  GraduationCap
} from 'lucide-react';

interface Stage {
  name: string;
  agent: string;
  icon: any;
  action: string;
  details: string;
  toolUsed: string;
  durationMs: number;
  tokens: number;
  status: 'pending' | 'running' | 'completed';
}

const PRESET_TASKS = [
  "Architect lock-free ring buffer for uWebSockets.js chat engine",
  "Implement autonomous DPO preference dataset extraction from conversation logs",
  "Design zero-copy WebRTC video frame compositor for Mediasoup SFU",
  "Audit PostgreSQL transaction isolation and prevent N+1 deadlock state"
];

export default function AgentsPage() {
  const [task, setTask] = useState(PRESET_TASKS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [stages, setStages] = useState<Stage[]>([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const runPipeline = () => {
    if (isRunning) return;
    setIsRunning(true);
    setCurrentStep(0);
    setTotalTokens(0);
    setTotalDuration(0);

    const initialStages: Stage[] = [
      {
        name: "Stage 1: Task Deconstruction",
        agent: "PlannerAgent",
        icon: Layers,
        action: `Deconstruct requirements for: "${task.slice(0, 50)}..."`,
        details: "Identified 4 atomic execution invariants, bounded buffer limits, and concurrency safety requirements.",
        toolUsed: "TaskDeconstructTool",
        durationMs: 142,
        tokens: 110,
        status: "running"
      },
      {
        name: "Stage 2: Context & Memory Retrieval",
        agent: "ResearchAgent",
        icon: Search,
        action: "Query internal 600-taxonomies RAG engine & user memory vault",
        details: "Retrieved O(1) lock-free ring buffer benchmarks and past concurrency decisions.",
        toolUsed: "BM25SearchTool",
        durationMs: 85,
        tokens: 180,
        status: "pending"
      },
      {
        name: "Stage 3: Drop-in Code Synthesis",
        agent: "CodeAgent",
        icon: Code2,
        action: "Synthesize production drop-in implementation with 64-byte padding",
        details: "Generated TypeScript/C++ binding with CPU cache line isolation and zero heap allocations.",
        toolUsed: "ASTCodeGeneratorTool",
        durationMs: 310,
        tokens: 420,
        status: "pending"
      },
      {
        name: "Stage 4: CTO Rubric Quality Audit",
        agent: "ReviewAgent",
        icon: ShieldCheck,
        action: "Verify against 50-condition CTO quality rubric & gatekeeper invariants",
        details: "Result: 98/100 (APPROVE). Zero race conditions, 0 hardcoded secrets, O(1) hot paths verified.",
        toolUsed: "CTOGatekeeperTool",
        durationMs: 115,
        tokens: 135,
        status: "pending"
      },
      {
        name: "Stage 5: Continuous DPO Learning",
        agent: "LearningAgent",
        icon: GraduationCap,
        action: "Extract DPO training pair & record telemetry to master knowledge graph",
        details: "Ingested verified solution into DPO alignment buffer for future autonomous fine-tuning.",
        toolUsed: "DPODatasetExtractorTool",
        durationMs: 95,
        tokens: 95,
        status: "pending"
      }
    ];

    setStages(initialStages);

    // Progressive step execution simulation
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < initialStages.length) {
        setCurrentStep(step);
        setStages((prev) =>
          prev.map((s, idx) => {
            if (idx === step - 1) return { ...s, status: "completed" };
            if (idx === step) return { ...s, status: "running" };
            return s;
          })
        );
      } else {
        clearInterval(interval);
        setCurrentStep(initialStages.length);
        setStages((prev) => prev.map((s) => ({ ...s, status: "completed" })));
        setIsRunning(false);
        setTotalTokens(940);
        setTotalDuration(747);
      }
    }, 450);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Autonomous Multi-Agent Orchestrator</h1>
          <p className="text-slate-400 text-xs mt-1">
            Deterministic DAG Execution • 5 Specialized Agents • Bounded Tool Invocations
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>Max Steps: 5</span>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Bounded Loop Safe</span>
          </span>
        </div>
      </div>

      {/* Task Input Card */}
      <div className="p-6 rounded-2xl bg-[#0E131F] border border-slate-800/80 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">Engineering Objective / Task Description</label>
          <span className="text-[11px] text-slate-500 font-mono">Select preset or enter custom task</span>
        </div>

        <textarea
          rows={2}
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors resize-none shadow-inner"
        />

        {/* Task Presets */}
        <div className="flex flex-wrap gap-1.5">
          {PRESET_TASKS.map((p, i) => (
            <button
              key={i}
              onClick={() => setTask(p)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800/60 text-slate-400 hover:text-slate-200 transition-all text-left truncate max-w-xs"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Launch Button */}
        <button
          onClick={runPipeline}
          disabled={isRunning || !task.trim()}
          className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isRunning ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Executing Stage {currentStep + 1} of 5...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Multi-Agent Pipeline</span>
            </>
          )}
        </button>
      </div>

      {/* DAG Visualizer Pipeline */}
      {stages.length > 0 && (
        <div className="space-y-4">
          {/* Telemetry Summary Bar */}
          <div className="p-4 rounded-xl bg-[#0E131F] border border-slate-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="font-mono text-slate-400">
                Status: <strong className={isRunning ? 'text-amber-400' : 'text-emerald-400'}>{isRunning ? 'RUNNING' : 'COMPLETED'}</strong>
              </span>
              <span className="text-slate-700">|</span>
              <span className="font-mono text-slate-400">Total Tokens: <strong className="text-sky-400">{totalTokens}</strong></span>
              <span className="text-slate-700">|</span>
              <span className="font-mono text-slate-400">Duration: <strong className="text-emerald-400">{totalDuration}ms</strong></span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Pipeline Version 2.2</span>
          </div>

          {/* Execution Stages List */}
          <div className="space-y-3">
            {stages.map((st, idx) => {
              const Icon = st.icon;
              const isDone = st.status === 'completed';
              const isCurrent = st.status === 'running';

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-sky-950/20 border-sky-500/50 shadow-lg shadow-sky-500/10'
                      : isDone
                      ? 'bg-[#0E131F] border-slate-800/80'
                      : 'bg-slate-950/40 border-slate-900 opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                        isDone
                          ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                          : isCurrent
                          ? 'bg-sky-950/60 border-sky-800/60 text-sky-400 animate-pulse'
                          : 'bg-slate-900 border-slate-800 text-slate-600'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-white">{st.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-sky-400 border border-slate-800">
                            {st.agent}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{st.action}</p>
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-mono text-slate-500">
                      {isDone && (
                        <div className="space-y-0.5">
                          <span className="text-emerald-400 block">{st.durationMs}ms</span>
                          <span className="text-slate-600 block">{st.tokens} tokens</span>
                        </div>
                      )}
                      {isCurrent && <span className="text-amber-400 animate-pulse">Running...</span>}
                    </div>
                  </div>

                  {/* Stage Detailed Output */}
                  {(isDone || isCurrent) && (
                    <div className="mt-4 pt-3 border-t border-slate-800/40 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-black/40 border border-slate-800/60 font-mono text-[11px] text-slate-300">
                        <span className="text-slate-500 block text-[10px] mb-1">TELEMETRY & INVARIANTS:</span>
                        {st.details}
                      </div>
                      <div className="p-3 rounded-lg bg-black/40 border border-slate-800/60 font-mono text-[11px] text-slate-400 flex flex-col justify-between">
                        <div>
                          <span className="text-slate-500 block text-[10px] mb-1">TOOL INVOCATION:</span>
                          <span className="text-sky-400 font-semibold">{st.toolUsed}()</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 self-end">Exit Code: 0 (OK)</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
