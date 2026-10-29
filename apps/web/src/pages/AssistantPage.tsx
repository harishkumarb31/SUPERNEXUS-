import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bot,
  Send,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Info,
} from 'lucide-react';
import { assistantService } from '../services/api';

export const AssistantPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [question, setQuestion] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{
    q: string;
    a: string;
    citations: any[];
    grounded: boolean;
  }>>([
    {
      q: 'What is the mandatory Student-to-Faculty Ratio (SFR) and Cadre Ratio for Undergraduate Engineering programmes?',
      a: 'According to the **AICTE Approval Process Handbook (2026-2027)**, under **Clause 2.1 - Student Faculty Ratio (SFR)** (Page 35, Section 2.1.2):\n\n> "For Undergraduate Engineering and Technology programmes, the Student-Faculty Ratio shall be 1:20. For Master of Business Administration (MBA) and MCA programmes, the SFR shall be 1:15."\n\nFurthermore, under **Clause 2.4 - Cadre Ratio** (Page 38, Section 2.4.1):\n\n> "The faculty cadre structure shall be in the ratio of 1:2:6 for Professor : Associate Professor : Assistant Professor. In institutions running PG programmes, at least one regular Professor with Ph.D. is mandatory per department."',
      citations: [
        {
          documentTitle: 'AICTE Approval Process Handbook — Chapter 2: Cadre Ratio and Student-Faculty Ratios',
          chapter: 'Chapter 2',
          section: 'Clause 2.1 - Student Faculty Ratio (SFR)',
          pageRef: 'Page 35, Section 2.1.2',
          excerpt: 'For Undergraduate Engineering and Technology programmes, the Student-Faculty Ratio shall be 1:20.',
        },
        {
          documentTitle: 'AICTE Approval Process Handbook — Chapter 2: Cadre Ratio and Student-Faculty Ratios',
          chapter: 'Chapter 2',
          section: 'Clause 2.4 - Cadre Ratio',
          pageRef: 'Page 38, Section 2.4.1',
          excerpt: 'The faculty cadre structure shall be in the ratio of 1:2:6 for Professor : Associate Professor : Assistant Professor.',
        },
      ],
      grounded: true,
    },
  ]);

  const handleSend = async (queryText?: string) => {
    const qToSend = queryText || question;
    if (!qToSend.trim()) return;

    setLoading(true);
    try {
      const res = await assistantService.query(qToSend);
      setHistory((prev) => [
        ...prev,
        {
          q: qToSend,
          a: res.answer,
          citations: res.citations || [],
          grounded: res.grounded,
        },
      ]);
      setQuestion('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'What are the minimum land norms required for technical institutions in urban areas?',
    'What are the mandatory Fire Safety Certificate rules under Chapter 1 Clause 1.4?',
    'What is the composition and inspection checklist for an Expert Visiting Committee (EVC)?',
    'What are the requirements for 30-year registered lease deed validity?',
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              AICTE Regulatory Knowledge & RAG Assistant
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grounded answers derived strictly from the AICTE Approval Process Handbook (APH 2024-2027) with exact clause citations
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Regulatory Inquiries */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Suggested Regulatory Inquiries
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-left px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="space-y-6">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-3 animate-in fade-in">
            {/* User Query */}
            <div className="flex justify-end">
              <div className="max-w-xl bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-sm text-xs leading-relaxed shadow-sm">
                {item.q}
              </div>
            </div>

            {/* AI Assistant Grounded Response */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1" /> RegulaFlow Regulatory Engine
                  </span>
                  {item.grounded && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      100% Handbook Grounded
                    </span>
                  )}
                </div>
              </div>

              {/* Formatted Answer Body */}
              <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed space-y-2 whitespace-pre-line">
                {item.a}
              </div>

              {/* Citations Cards */}
              {item.citations && item.citations.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                    <BookOpen className="w-3 h-3 mr-1" /> Verified Statutory Citations:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.citations.map((cite: any, cIdx: number) => (
                      <div
                        key={cIdx}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <p className="font-bold text-indigo-600 dark:text-indigo-400 truncate">
                          {cite.section}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{cite.pageRef}</p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 italic mt-1 line-clamp-2">
                          "{cite.excerpt}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 animate-pulse flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
            <span>Retrieving AICTE Approval Process Handbook clauses and synthesizing grounded answer...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="sticky bottom-4 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-elevated flex items-center space-x-2"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a regulatory question on AICTE land norms, faculty SFR, fire safety, or EVC..."
          className="flex-1 px-4 py-2.5 text-xs bg-transparent border-0 focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center space-x-1"
        >
          <span>Consult</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Regulatory Safety Notice */}
      <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center space-x-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          <strong>Statutory Compliance Boundary:</strong> RegulaFlow AI Assistant performs retrieval and summarization over authorized AICTE APH documentation. Official statutory scrutiny and approval decisions remain under the exclusive authority of AICTE officers and committees.
        </span>
      </div>
    </div>
  );
};
