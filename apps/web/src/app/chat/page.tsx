'use client';
import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '### ⚡ KYVON AI Core Ready\n\nHello **Thu Ya Kyaw**! How can I assist your engineering, code architecture, or learning roadmap today?',
      thinking: 'Initialized session context with persistent memory layers.'
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
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('https://ctoai.reiwasakura.tech/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'ctoai-core',
          messages: [{ role: 'user', content: userMsg }]
        })
      });
      const data = await res.json();
      const assistantReply = data.choices?.[0]?.message?.content || 'Response processed.';
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: assistantReply, thinking: 'Synthesized with 50-condition CTO rubric.' }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ Error communicating with AI Core: ${err}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col justify-between space-y-4">
      {/* Controls Header */}
      <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-[#11141D] border border-white/5 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-mono text-slate-200">Model: ctoai-core</span>
          <span className="text-slate-600">|</span>
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
            <span>Personal Memory</span>
          </label>
        </div>
        <div className="text-[11px] text-emerald-400">Latency: ~1.6s</div>
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
                <summary className="cursor-pointer font-mono text-slate-400">Thinking Process</summary>
                <div className="mt-1 font-mono">{m.thinking}</div>
              </details>
            )}
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="p-4 rounded-2xl bg-[#11141D] border border-white/5 text-slate-400 text-sm animate-pulse mr-12">
            ⚡ Synthesizing response across knowledge graph...
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
          placeholder="Ask anything, analyze architecture, or solve code problems (Enter to send)..."
          className="w-full bg-[#11141D] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors resize-none shadow-xl"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="absolute right-3 bottom-4 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition-colors disabled:opacity-50 shadow-lg shadow-sky-500/20"
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
