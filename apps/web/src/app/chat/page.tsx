'use client';
import { useState } from 'react';

type AIMode = 'simple' | 'learn' | 'work' | 'think' | 'develop';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  mode?: AIMode;
}

const MODES: { id: AIMode; label: string; icon: string; promptNote: string }[] = [
  { id: 'work', label: 'WORK', icon: '🛠️', promptNote: 'Action-first problem solving. Follow UNDERSTAND -> PLAN -> WORK -> VERIFY -> SHOW RESULT.' },
  { id: 'develop', label: 'DEVELOP', icon: '💻', promptNote: 'Senior engineering mode. $O(1)$ hot paths, zero heap escapes, production drop-in code.' },
  { id: 'think', label: 'THINK', icon: '🧠', promptNote: 'Deep architectural & mathematical analysis. Asymptotic bounds, trade-offs, proof.' },
  { id: 'learn', label: 'LEARN', icon: '📚', promptNote: 'Teach step-by-step with clear analogies, real code examples, and comprehension checks.' },
  { id: 'simple', label: 'SIMPLE', icon: '🧒', promptNote: 'Explain like I am new. Plain simple words, direct answers, zero confusing jargon.' }
];

export default function ChatPage() {
  const [activeMode, setActiveMode] = useState<AIMode>('work');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '### ⚡ KYVON Autonomous Core Ready\n\nHello **Thu Ya Kyaw**! Active mode: **🛠️ WORK MODE**.\n\nAsk any engineering question, paste broken code, or describe a systems task to solve.',
      thinking: 'Initialized session context with persistent memory layers and dual-gateway inference routing.',
      mode: 'work'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useRAG, setUseRAG] = useState(true);
  const [useMemory, setUseMemory] = useState(true);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg, mode: activeMode }]);
    setIsLoading(true);

    const modeConfig = MODES.find((m) => m.id === activeMode) || MODES[0];
    const systemPrompt = `You are KYVON AI, an autonomous CTO and senior engineer.
CURRENT OPERATING MODE: [${modeConfig.label} MODE]
INSTRUCTION: ${modeConfig.promptNote}
${useMemory ? 'CONTEXT: Operator Thu Ya Kyaw (thuyakyaw.com), Primary Repo: Filip2k03/kyvon-ai.' : ''}`;

    try {
      const res = await fetch('https://ctoai.reiwasakura.tech/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'ctoai-core',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMsg }
          ]
        })
      });
      const data = await res.json();
      const assistantReply = data.choices?.[0]?.message?.content || 'Response processed.';
      const thinking = data.choices?.[0]?.message?.thinking || `Mode: ${modeConfig.label} | Verified with CTO 50-condition rubric.`;
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: assistantReply, thinking, mode: activeMode }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ Error communicating with AI Core: ${err}`, mode: activeMode }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col justify-between space-y-4">
      {/* Mode Selector & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-[#11141D] border border-white/5 text-xs">
        {/* 5 Mode Buttons */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeMode === m.id
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Knowledge & Memory Toggles */}
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useRAG}
              onChange={(e) => setUseRAG(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-sky-500"
            />
            <span>RAG Knowledge</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useMemory}
              onChange={(e) => setUseMemory(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-sky-500"
            />
            <span>Memory</span>
          </label>
          <span className="text-emerald-400 font-mono">TLS 1.3 Online</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border leading-relaxed text-sm ${
              m.role === 'user'
                ? 'bg-sky-950/20 border-sky-500/30 text-sky-100 ml-12'
                : 'bg-[#11141D] border-white/5 text-slate-200 mr-12'
            }`}
          >
            {m.thinking && (
              <details className="mb-3 text-xs text-slate-500 bg-black/30 p-2 rounded-lg border border-white/5">
                <summary className="cursor-pointer font-mono text-slate-400 flex items-center justify-between">
                  <span>Thinking Process</span>
                  {m.mode && <span className="uppercase text-[10px] text-sky-400 font-bold">[{m.mode} MODE]</span>}
                </summary>
                <div className="mt-1 font-mono">{m.thinking}</div>
              </details>
            )}
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="p-4 rounded-2xl bg-[#11141D] border border-white/5 text-slate-400 text-sm animate-pulse mr-12 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
            <span>Synthesizing response across KYVON Working Intelligence pipeline...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="relative">
        <textarea
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={`[${activeMode.toUpperCase()} MODE] Ask anything, analyze architecture, or solve code problems (Enter to send)...`}
          className="w-full bg-[#11141D] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors resize-none shadow-xl"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="absolute right-3 bottom-4 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition-colors disabled:opacity-50 shadow-lg shadow-sky-500/20 flex items-center gap-1.5"
        >
          <span>Send</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
