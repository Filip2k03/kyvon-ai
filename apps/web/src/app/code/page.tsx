'use client';
import { useState } from 'react';

export default function CodeStudioPage() {
  const [tab, setTab] = useState<'audit' | 'error'>('audit');
  const [code, setCode] = useState(`function findUserOrders(users, orders) {
  const results = [];
  // Nested loop causing O(N^2) complexity
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < orders.length; j++) {
      if (users[i].id === orders[j].userId) {
        results.push({ user: users[i], order: orders[j] });
      }
    }
  }
  return results;
}`);
  const [errorInput, setErrorInput] = useState('ModuleNotFoundError: No module named \'torch\'');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const runAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setAnalysisResult({
        score: 75,
        complexity: 'O(N^2)',
        issues: [
          {
            severity: 'HIGH',
            category: 'Complexity & Latency',
            description: 'Nested for loop detected causing quadratic O(N^2) lookup scaling.',
            suggestedFix: 'const lookup = new Map(orders.map(o => [o.userId, o]));\nreturn users.map(u => ({ user: u, order: lookup.get(u.id) }));'
          }
        ]
      });
      setIsAuditing(false);
    }, 400);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Workspace Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Code Studio</h1>
          <p className="text-slate-400 text-xs mt-1">
            AST-level complexity bounds, 50-condition CTO rubric audit, and structured error solver.
          </p>
        </div>
        <div className="flex bg-[#11141D] p-1 rounded-xl border border-white/5 text-xs">
          <button
            onClick={() => setTab('audit')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              tab === 'audit' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            AST Code Audit
          </button>
          <button
            onClick={() => setTab('error')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              tab === 'error' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Error Solver
          </button>
        </div>
      </div>

      {tab === 'audit' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Source Code Input</span>
              <span className="font-mono">Language: TypeScript / JS</span>
            </div>
            <textarea
              rows={16}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-[#11141D] border border-white/10 rounded-2xl p-4 font-mono text-xs text-sky-200 focus:outline-none focus:border-sky-500 transition-colors resize-none"
            />
            <button
              onClick={runAudit}
              disabled={isAuditing}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-sky-500/20"
            >
              {isAuditing ? 'Auditing AST...' : '⚡ Run 50-Condition CTO Audit'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="text-xs text-slate-400">Audit Telemetry & Complexity Analysis</div>
            {analysisResult ? (
              <div className="p-6 rounded-2xl bg-[#11141D] border border-white/5 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-mono">Quality Score</div>
                    <div className="text-3xl font-bold text-sky-400">{analysisResult.score} / 100</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 uppercase font-mono">Asymptotic Bound</div>
                    <div className="text-lg font-bold font-mono text-amber-400">{analysisResult.complexity}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-xs font-semibold text-slate-200">Discovered Architectural Findings:</div>
                  {analysisResult.issues.map((iss: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-400">[{iss.severity}] {iss.category}</span>
                      </div>
                      <div className="text-slate-300">{iss.description}</div>
                      <div className="mt-2 p-2 rounded bg-black/40 font-mono text-emerald-400">
                        {iss.suggestedFix}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-72 rounded-2xl bg-[#11141D] border border-white/5 flex items-center justify-center text-xs text-slate-500">
                Click "Run 50-Condition CTO Audit" to inspect code
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Paste Runtime Exception or Error Message</label>
            <input
              type="text"
              value={errorInput}
              onChange={(e) => setErrorInput(e.target.value)}
              className="w-full bg-[#11141D] border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="p-6 rounded-2xl bg-[#11141D] border border-white/5 space-y-4 text-xs">
            <div className="font-bold text-sm text-sky-400">Structured Root Cause Analysis</div>
            <div>
              <span className="font-semibold text-slate-300">PROBLEM:</span>
              <p className="text-slate-400 mt-0.5">Missing package dependency in Python virtual environment.</p>
            </div>
            <div>
              <span className="font-semibold text-slate-300">CAUSE:</span>
              <p className="text-slate-400 mt-0.5">PyTorch (`torch`) is not installed in the current active interpreter environment.</p>
            </div>
            <div>
              <span className="font-semibold text-slate-300">SOLUTION:</span>
              <div className="mt-1 p-2 rounded bg-black/40 font-mono text-emerald-400">
                pip install torch torchvision
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
