'use client';
import { useState } from 'react';

export default function AgentsPage() {
  const [task, setTask] = useState('Build a resilient WebSocket chat server with zero heap allocation');
  const [isRunning, setIsRunning] = useState(false);
  const [runLog, setRunLog] = useState<any>(null);

  const runAgents = () => {
    setIsRunning(true);
    setTimeout(() => {
      setRunLog({
        status: 'COMPLETED',
        time: '1.42s',
        steps: [
          { agent: 'PlannerAgent', action: 'Deconstructed into 4 bounded execution stages.' },
          { agent: 'ResearchAgent', action: 'Retrieved uWebSockets.js lock-free channel pattern.' },
          { agent: 'CodeAgent', action: 'Generated TypeScript drop-in with 64-byte padding.' },
          { agent: 'ReviewAgent', action: 'Score: 98/100 (APPROVE). Zero lock contention.' }
        ]
      });
      setIsRunning(false);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Autonomous Multi-Agent Orchestrator</h1>
        <p className="text-slate-400 text-xs mt-1">
          Coordinated task pipeline: Planner ➔ Research ➔ Code ➔ Review.
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-xs text-slate-400">Describe Engineering Task</label>
        <textarea
          rows={3}
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="w-full bg-[#11141D] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
        />
        <button
          onClick={runAgents}
          disabled={isRunning}
          className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-sky-500/20"
        >
          {isRunning ? 'Orchestrating Agents...' : '🚀 Launch Multi-Agent Pipeline'}
        </button>
      </div>

      {runLog && (
        <div className="p-6 rounded-2xl bg-[#11141D] border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="font-bold text-xs text-emerald-400 font-mono">STATUS: {runLog.status}</span>
            <span className="text-xs text-slate-400 font-mono">Duration: {runLog.time}</span>
          </div>
          <div className="space-y-3">
            {runLog.steps.map((st: any, i: number) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <span className="font-mono text-sky-400 w-32 shrink-0">[{st.agent}]</span>
                <span className="text-slate-300">{st.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
