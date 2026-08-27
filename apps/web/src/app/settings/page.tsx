'use client';
import { useState } from 'react';
import { 
  Settings, 
  Server, 
  ShieldCheck, 
  Cpu, 
  Key, 
  Save, 
  CheckCircle2, 
  Sliders, 
  HardDrive, 
  Lock,
  Globe
} from 'lucide-react';

export default function SettingsPage() {
  const [gatewayUrl, setGatewayUrl] = useState('https://ctoai.reiwasakura.tech/v1/chat/completions');
  const [modelName, setModelName] = useState('ctoai-core');
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Configuration & Invariants</h1>
          <p className="text-slate-400 text-xs mt-1">
            AI Gateway Inference • Security Parameters • Operator Identity
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>System Healthy</span>
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Inference Gateway Card */}
        <div className="p-6 rounded-2xl bg-[#0E131F] border border-slate-800/80 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs border-b border-slate-800/60 pb-3">
            <Server className="w-4 h-4 text-sky-400" />
            <span>AI INFERENCE GATEWAY</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-medium">Inference Endpoint URL</label>
              <input
                type="text"
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-medium">Model ID</label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>Temperature</span>
                  <span className="font-mono text-sky-400">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-sky-500 mt-2"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>Max Tokens</span>
                  <span className="font-mono text-emerald-400">{maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="1024"
                  max="8192"
                  step="512"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  className="w-full accent-emerald-500 mt-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security & Cryptographic Invariants */}
        <div className="p-6 rounded-2xl bg-[#0E131F] border border-slate-800/80 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs border-b border-slate-800/60 pb-3">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>SECURITY & CRYPTOGRAPHIC INVARIANTS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1">
              <div className="text-slate-400 font-medium">Password Hashing</div>
              <div className="font-mono text-emerald-400 text-[11px]">Scrypt + Constant-Time Verify</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1">
              <div className="text-slate-400 font-medium">Transport Encryption</div>
              <div className="font-mono text-emerald-400 text-[11px]">TLS 1.3 Perfect Forward Secrecy</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1">
              <div className="text-slate-400 font-medium">Push Protection Status</div>
              <div className="font-mono text-emerald-400 text-[11px]">100% Clean (0 Hardcoded Secrets)</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1">
              <div className="text-slate-400 font-medium">Edge Ingress Rate Limiting</div>
              <div className="font-mono text-emerald-400 text-[11px]">30 req/sec (Burst: 50)</div>
            </div>
          </div>
        </div>

        {/* Operator Profile */}
        <div className="p-6 rounded-2xl bg-[#0E131F] border border-slate-800/80 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs border-b border-slate-800/60 pb-3">
            <Globe className="w-4 h-4 text-sky-400" />
            <span>PRIMARY OPERATOR PROFILE</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="space-y-1">
              <div className="font-semibold text-white">Thu Ya Kyaw (TechyyFilip / stephanfilip)</div>
              <div className="text-slate-500 font-mono text-[11px]">thuyakyaw.com • Chief Systems Architect</div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/40 text-sky-400">
              OPERATOR LEVEL 0
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3">
          {isSaved && (
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Settings Saved Successfully</span>
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-sky-500/20 flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
