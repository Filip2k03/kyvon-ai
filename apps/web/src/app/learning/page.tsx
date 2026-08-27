'use client';
import { useState } from 'react';

interface Topic {
  title: string;
  desc: string;
  quiz: {
    q: string;
    options: string[];
    correct: number;
    explanation: string;
  };
  flashcard: {
    front: string;
    back: string;
  };
}

const TOPICS: Topic[] = [
  {
    title: "1. Distributed Data Parallel (DDP)",
    desc: "Ring all-reduce gradient synchronization, bucket grouping, and multi-GPU process groups.",
    quiz: {
      q: "What is the primary communication primitive used by PyTorch DDP for gradient averaging?",
      options: ["All-to-all", "Ring All-Reduce", "Master Broadcast", "Scatter-gather"],
      correct: 1,
      explanation: "Ring all-reduce distributes gradient communication uniformly across GPUs, achieving near-optimal bandwidth utilization independent of cluster size."
    },
    flashcard: {
      front: "Why does PyTorch DDP overlap gradient all-reduce with backward computation?",
      back: "By grouping gradients into contiguous parameter buckets, DDP initiates all-reduce asynchronously while earlier layers are still computing gradients."
    }
  },
  {
    title: "2. Tensor Parallelism & Megatron-LM",
    desc: "Column-parallel and row-parallel matrix multiplication across GPU tensor cores.",
    quiz: {
      q: "Why are GeLU activations placed after Column-Parallel linear layers in Megatron-LM?",
      options: ["To avoid an extra all-reduce communication step", "To compress activations into FP8", "To enforce KV caching", "To double batch size"],
      correct: 0,
      explanation: "Column-parallel split produces shard activations in the column dimension, allowing element-wise GeLU to execute locally on each GPU without cross-GPU communication."
    },
    flashcard: {
      front: "What communication primitive synchronizes Row-Parallel Linear layer outputs?",
      back: "All-Reduce (summing partial matrix product shards across all tensor parallel ranks)."
    }
  },
  {
    title: "3. Pipeline Parallelism & 1F1B Scheduling",
    desc: "Micro-batch bubble minimization, 1F1B (1-Forward-1-Backward) memory capping, and activation checkpointing.",
    quiz: {
      q: "What does activation checkpointing trade in order to reduce GPU VRAM consumption?",
      options: ["Network bandwidth for disk IO", "Additional forward compute (~33%) for activation memory", "Model accuracy for speed", "Context length for batch size"],
      correct: 1,
      explanation: "Activation checkpointing recomputes forward activations on-the-fly during the backward pass, reducing peak activation memory from O(N) to O(sqrt(N)) at the cost of ~33% additional compute."
    },
    flashcard: {
      front: "What is the primary benefit of 1F1B scheduling over naive pipeline schedules?",
      back: "1F1B caps the number of active in-flight micro-batches to the pipeline depth, bounding peak activation memory."
    }
  }
];

export default function LearningPage() {
  const [selectedTopic, setSelectedTopic] = useState(0);
  const [activeTab, setActiveTab] = useState<'quiz' | 'flashcard'>('quiz');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);

  const handleSelectTopic = (idx: number) => {
    setSelectedTopic(idx);
    setSelectedOption(null);
    setShowExplanation(false);
    setIsFlipped(false);
  };

  const handleAnswer = (optionIdx: number) => {
    setSelectedOption(optionIdx);
    setShowExplanation(true);
  };

  const active = TOPICS[selectedTopic];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Learning AI & Mastery Roadmaps</h1>
          <p className="text-slate-400 text-xs mt-1">
            PyTorch Distributed Systems • Interactive Assessments • Spaced Repetition Flashcards
          </p>
        </div>
        <div className="flex bg-[#11141D] p-1 rounded-xl border border-white/5 text-xs">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === 'quiz' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Quiz Assessment
          </button>
          <button
            onClick={() => setActiveTab('flashcard')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === 'flashcard' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Flashcard Deck
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roadmap Topics Sidebar */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-400 uppercase">Curriculum Topics</div>
          {TOPICS.map((t, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectTopic(idx)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedTopic === idx
                  ? 'bg-sky-950/30 border-sky-500/50 text-white shadow-lg shadow-sky-500/5'
                  : 'bg-[#11141D] border-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-semibold text-xs text-white">{t.title}</div>
              <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{t.desc}</div>
            </div>
          ))}
        </div>

        {/* Interactive Workspace Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Topic Summary Card */}
          <div className="p-6 rounded-2xl bg-[#11141D] border border-white/5 space-y-2">
            <div className="text-xs font-mono text-sky-400 uppercase">Active Unit</div>
            <h2 className="text-lg font-bold text-white">{active.title}</h2>
            <p className="text-xs text-slate-300 leading-relaxed">{active.desc}</p>
          </div>

          {activeTab === 'quiz' ? (
            /* Quiz Card */
            <div className="p-6 rounded-2xl bg-[#11141D] border border-white/5 space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="text-xs font-mono text-emerald-400 uppercase font-semibold">Multiple-Choice Assessment</div>
                <div className="text-[11px] text-slate-500 font-mono">1 Question</div>
              </div>

              <div className="text-sm font-semibold text-white leading-relaxed">{active.quiz.q}</div>

              <div className="space-y-2">
                {active.quiz.options.map((opt, i) => {
                  const isChosen = selectedOption === i;
                  const isCorrect = i === active.quiz.correct;
                  let btnStyle = 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-200';

                  if (selectedOption !== null) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300 font-semibold';
                    } else if (isChosen) {
                      btnStyle = 'bg-rose-950/50 border-rose-500/60 text-rose-300';
                    } else {
                      btnStyle = 'bg-white/5 border-transparent text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{String.fromCharCode(65 + i)}. {opt}</span>
                      {selectedOption !== null && isCorrect && <span className="text-emerald-400 font-bold">✓</span>}
                      {selectedOption !== null && isChosen && !isCorrect && <span className="text-rose-400 font-bold">✗</span>}
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-800/40 text-xs space-y-1.5 animate-fadeIn">
                  <div className="font-semibold text-sky-400 font-mono">Architectural Rationale:</div>
                  <p className="text-slate-300 leading-relaxed">{active.quiz.explanation}</p>
                </div>
              )}
            </div>
          ) : (
            /* Flashcard Deck Card */
            <div className="p-6 rounded-2xl bg-[#11141D] border border-white/5 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="text-xs font-mono text-purple-400 uppercase font-semibold">Spaced Repetition Deck</div>
                <div className="text-[11px] text-slate-400 font-mono">Reviewed: {reviewCount} times</div>
              </div>

              {/* 3D Flashcard */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="h-56 rounded-2xl bg-gradient-to-br from-slate-900 via-black to-slate-900 border border-white/10 p-6 flex flex-col justify-between cursor-pointer hover:border-sky-500/40 transition-all select-none shadow-2xl relative overflow-hidden group"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>{isFlipped ? 'BACK (SOLUTION)' : 'FRONT (PROMPT)'}</span>
                  <span className="text-sky-400 group-hover:underline">Click to Flip ↺</span>
                </div>

                <div className="text-center px-4 py-2">
                  <div className="text-sm font-medium text-white leading-relaxed">
                    {isFlipped ? active.flashcard.back : active.flashcard.front}
                  </div>
                </div>

                <div className="text-center text-[10px] font-mono text-slate-600">
                  SM-2 Adaptive Spaced Repetition Engine
                </div>
              </div>

              {/* Spaced Repetition Confidence Buttons */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                <button
                  onClick={() => setReviewCount((c) => c + 1)}
                  className="py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 font-medium transition-colors"
                >
                  Again <span className="block text-[10px] text-rose-400 font-mono">+1d</span>
                </button>
                <button
                  onClick={() => setReviewCount((c) => c + 1)}
                  className="py-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/40 text-amber-300 font-medium transition-colors"
                >
                  Hard <span className="block text-[10px] text-amber-400 font-mono">+3d</span>
                </button>
                <button
                  onClick={() => setReviewCount((c) => c + 1)}
                  className="py-2.5 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/40 text-sky-300 font-medium transition-colors"
                >
                  Good <span className="block text-[10px] text-sky-400 font-mono">+7d</span>
                </button>
                <button
                  onClick={() => setReviewCount((c) => c + 1)}
                  className="py-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 text-emerald-300 font-medium transition-colors"
                >
                  Easy <span className="block text-[10px] text-emerald-400 font-mono">+14d</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
