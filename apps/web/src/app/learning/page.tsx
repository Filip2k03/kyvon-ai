'use client';
import { useState } from 'react';

export default function LearningPage() {
  const [skill, setSkill] = useState('PyTorch Distributed Training');
  const [selectedTopic, setSelectedTopic] = useState(0);

  const topics = [
    {
      title: "1. Foundations & Distributed Data Parallel (DDP)",
      desc: "All-reduce gradient synchronization, ring topology, and process group initialization.",
      quiz: {
        q: "What is the primary communication primitive used by PyTorch DDP for gradient averaging?",
        options: ["All-to-all", "All-Reduce (Ring / Tree)", "Broadcast single-master", "Scatter-gather"],
        correct: 1
      }
    },
    {
      title: "2. Tensor Parallelism & Megatron-LM",
      desc: "Column-parallel and row-parallel matrix multiplications across GPU tensor cores.",
      quiz: {
        q: "Why are GeLU activations placed after Column-Parallel linear layers in Megatron-LM?",
        options: ["To avoid an extra all-reduce communication step", "To compress activations", "To convert FP16 to FP8", "To enforce KV caching"],
        correct: 0
      }
    },
    {
      title: "3. Pipeline Parallelism & Activation Checkpointing",
      desc: "1F1B scheduling, micro-batch bubbles, and recomputing activations on backward pass.",
      quiz: {
        q: "What does activation checkpointing trade in order to reduce GPU VRAM consumption?",
        options: ["Network bandwidth for disk IO", "Additional forward compute (~33%) for activation memory", "Accuracy for speed", "Context length for batch size"],
        correct: 1
      }
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Learning AI & Mastery Roadmaps</h1>
        <p className="text-slate-400 text-xs mt-1">
          Adaptive skill trees, interactive multiple-choice quizzes, and spaced repetition.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roadmap Topics */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-400 uppercase">Curriculum Topics</div>
          {topics.map((t, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedTopic(idx)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedTopic === idx
                  ? 'bg-sky-950/30 border-sky-500/50 text-white'
                  : 'bg-[#11141D] border-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-semibold text-xs text-white">{t.title}</div>
              <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{t.desc}</div>
            </div>
          ))}
        </div>

        {/* Selected Topic & Quiz Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-[#11141D] border border-white/5 space-y-4">
            <div className="text-xs font-mono text-sky-400 uppercase">Active Topic</div>
            <h2 className="text-lg font-bold text-white">{topics[selectedTopic].title}</h2>
            <p className="text-xs text-slate-300 leading-relaxed">{topics[selectedTopic].desc}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#11141D] border border-white/5 space-y-4">
            <div className="text-xs font-mono text-emerald-400 uppercase">Topic Assessment Quiz</div>
            <div className="text-sm font-semibold text-white">{topics[selectedTopic].quiz.q}</div>
            <div className="space-y-2">
              {topics[selectedTopic].quiz.options.map((opt, i) => (
                <button
                  key={i}
                  className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-200 transition-colors"
                >
                  {String.fromCharCode(65 + i)}. {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
