export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">System Settings</h1>
      <div className="p-6 rounded-2xl bg-[#11141D] border border-white/5 space-y-4 text-xs">
        <div className="font-semibold text-white">Inference Gateway</div>
        <div className="font-mono text-slate-400">https://ctoai.reiwasakura.tech/v1/chat/completions</div>
        <div className="font-semibold text-white mt-4">Active AI Provider</div>
        <div className="font-mono text-emerald-400">Local vLLM Core (ctoai-core)</div>
      </div>
    </div>
  );
}
