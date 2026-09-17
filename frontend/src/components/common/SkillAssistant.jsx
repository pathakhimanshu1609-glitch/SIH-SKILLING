import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../lib/api';
import {
  BrainCircuit,
  Send,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

// Suggested quick questions shown as chips
const SUGGESTED_QUESTIONS = [
  'What skills should I learn for this job?',
  'Why don\'t I match this role?',
  'Which jobs am I closest to qualifying for?',
  'What is my biggest skill gap right now?',
  'How can I improve my assessment score?',
];

/**
 * SkillAssistant — AI-powered chat panel using Gemini via backend.
 *
 * Props:
 *   candidateId  — candidate's ID (defaults to auth user id)
 *   trade        — current trade filter (e.g. 'Advanced CNC Machinist')
 *   district     — current district filter (e.g. 'Pune')
 *   defaultOpen  — whether the panel starts expanded (default false)
 */
export const SkillAssistant = ({ candidateId, trade, district, defaultOpen = false }) => {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]); // { role: 'user'|'ai'|'error', text, isFallback }
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const resolvedCandidateId = candidateId || user?.candidateRecord?.id || user?.id || 'cand-01';

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const sendQuestion = async (q) => {
    const text = (q || question).trim();
    if (!text || loading) return;

    setQuestion('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const res = await fetchWithAuth(
        '/api/assistant/ask',
        {
          method: 'POST',
          body: JSON.stringify({
            candidate_id: resolvedCandidateId,
            question: text,
            trade: trade || 'Advanced CNC Machinist',
            district: district || 'Pune',
          }),
        },
        role
      );

      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: res.answer,
          isFallback: res.fallback === true,
          context: res.context_used,
        },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'error',
          text: 'Could not reach the AI assistant. Please check your connection and try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  return (
    <div className="rounded-xl border border-[#0B3D6B]/20 bg-white shadow-sm overflow-hidden font-sans">

      {/* ── Header / Toggle ─────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#0B3D6B] to-[#0D4F8C] text-white hover:from-[#072847] hover:to-[#0B3D6B] transition-all"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-[#D2691E]" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight">SkillSetuu</span>
              <span className="bg-[#D2691E] text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wide">
                AI GUIDANCE
              </span>
            </div>
            <p className="text-[11px] text-blue-200">
              SkillSetuu AI: Ask about your skill gaps, job readiness, or career path
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
              {messages.filter(m => m.role === 'user').length} Q
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-blue-200" />
          ) : (
            <ChevronDown className="w-4 h-4 text-blue-200" />
          )}
        </div>
      </button>

      {/* ── Collapsible Body ─────────────────────────────────────────── */}
      {isOpen && (
        <div className="flex flex-col">

          {/* ── Message History ─────────────────────────────────────── */}
          <div className="min-h-[200px] max-h-[380px] overflow-y-auto px-4 py-4 space-y-4 bg-[#F8F9FA]">

            {/* Empty state */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#0B3D6B]/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#D2691E]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0B3D6B]">Ask SkillSetuu anything about your skills & job matches</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Answers are grounded in your real assessment data and local job market.
                  </p>
                </div>

                {/* Suggested question chips */}
                <div className="flex flex-wrap justify-center gap-2 mt-1">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendQuestion(q)}
                      className="text-[11px] px-3 py-1.5 rounded-full bg-white border border-[#0B3D6B]/20 text-[#0B3D6B] hover:bg-[#0B3D6B] hover:text-white hover:border-[#0B3D6B] transition-colors shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'user' && (
                  <div className="w-7 h-7 rounded-full bg-[#0B3D6B] flex items-center justify-center flex-shrink-0 mr-2.5 mt-0.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-[#D2691E]" />
                  </div>
                )}

                <div className={`max-w-[85%] ${msg.role === 'user' ? 'max-w-[75%]' : ''}`}>
                  {/* Bubble */}
                  <div
                    className={`px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-[#0B3D6B] text-white rounded-br-sm'
                        : msg.role === 'error'
                        ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-sm'
                        : msg.isFallback
                        ? 'bg-amber-50 text-amber-900 border border-amber-200 rounded-bl-sm'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {msg.role === 'error' && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-[11px] font-bold text-red-600 uppercase tracking-wide">Connection Error</span>
                      </div>
                    )}
                    {msg.role === 'ai' && msg.isFallback && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">AI Unavailable</span>
                      </div>
                    )}
                    {msg.text}
                  </div>

                  {/* AI disclaimer */}
                  {msg.role === 'ai' && !msg.isFallback && (
                    <p className="text-[10px] text-slate-400 mt-1.5 px-1 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI-generated guidance based on your assessment data. For official counseling, contact your training center.
                    </p>
                  )}

                  {/* Context badge (shows what data was used) */}
                  {msg.role === 'ai' && msg.context && !msg.isFallback && (
                    <p className="text-[9px] text-slate-400 mt-0.5 px-1 font-mono">
                      Context: {msg.context.assessments_count} skills assessed · {msg.context.jobs_analyzed} local jobs analyzed
                    </p>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-[#D2691E] flex items-center justify-center flex-shrink-0 ml-2.5 mt-0.5">
                    <MessageSquare className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading bubble */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-[#0B3D6B] flex items-center justify-center flex-shrink-0 mr-2.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-[#D2691E]" />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-[#0B3D6B] animate-spin" />
                  <span className="text-xs text-slate-500">Analysing your skills &amp; local jobs… (may take ~10s)</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Input Row ───────────────────────────────────────────── */}
          <div className="border-t border-slate-200 px-4 py-3 bg-white flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your skill gaps, job matches, or career path… (Enter to send)"
              rows={2}
              maxLength={500}
              disabled={loading}
              className="flex-1 resize-none text-sm border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0B3D6B] focus:ring-1 focus:ring-[#0B3D6B]/30 disabled:opacity-50 transition-colors"
            />
            <button
              onClick={() => sendQuestion()}
              disabled={loading || !question.trim()}
              className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#D2691E] hover:bg-[#B5581A] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-sm"
              aria-label="Send question"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* ── Footer note ─────────────────────────────────────────── */}
          <div className="bg-[#F8F9FA] border-t border-slate-100 px-4 py-2 flex items-center justify-between">
            <p className="text-[10px] text-slate-400">
              Powered by SkillSetuu (Google Gemini AI) · Context: {trade || 'All trades'} · {district || 'All districts'}
            </p>
            <p className="text-[10px] text-slate-400">
              {question.length}/500
            </p>
          </div>

        </div>
      )}
    </div>
  );
};
