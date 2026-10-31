import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LearningWorkspacePage: React.FC = () => {
  const navigate = useNavigate();

  const [modules, setModules] = useState([
    {
      id: 'MOD-101',
      title: 'AICTE Approval Process Handbook (APH 2024-27) Fundamentals',
      category: 'Statutory Foundations',
      duration: '45 mins',
      progress: 100,
      completed: true,
      description: 'Understanding institutional categorization, autonomous status norms, and statutory definitions.',
    },
    {
      id: 'MOD-102',
      title: 'Land Norms & Infrastructure Calculation Masterclass',
      category: 'Physical Infrastructure',
      duration: '60 mins',
      progress: 75,
      completed: false,
      description: 'Calculating carpet area, FSI ratios, administrative built-up area and mega/urban/rural minimum acreage.',
    },
    {
      id: 'MOD-103',
      title: 'Document OCR Intelligence & Evidence Extraction',
      category: 'Technical Scrutiny',
      duration: '40 mins',
      progress: 50,
      completed: false,
      description: 'How the Tesseract engine detects lessor metadata, lease tenure and generates evidence-linked citations.',
    },
    {
      id: 'MOD-104',
      title: 'Faculty Cadre Ratio (SFR) & Qualification Verification',
      category: 'Academic Compliance',
      duration: '50 mins',
      progress: 0,
      completed: false,
      description: 'Verification of 1:15 & 1:20 teacher-student ratios, pay scale compliance, and principal qualification norms.',
    },
  ]);

  const toggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, progress: m.progress === 100 ? 0 : 100, completed: m.progress !== 100 }
          : m
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
          <GraduationCap className="w-6 h-6 mr-2.5 text-indigo-600 dark:text-indigo-400" />
          Fresher Learning Workspace & Scrutiny Academy
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Supervised regulatory evaluation onboarding, interactive handbook coursework & quality scoring
        </p>
      </div>

      {/* Trainee Progress Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
              Training Completion
            </span>
            <Award className="w-5 h-5 text-amber-300" />
          </div>
          <div className="text-3xl font-extrabold mt-2">68%</div>
          <div className="mt-2 text-xs text-indigo-100 flex items-center">
            2 of 4 modules certified
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Supervised Verification Score
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            94.2%
          </div>
          <p className="text-xs text-slate-500 mt-1">Accuracy on benchmark sample cases</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Mentor Sign-Offs
          </span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            12 Cases
          </div>
          <p className="text-xs text-slate-500 mt-1">Reviewed by Senior Regional Officers</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Certification Track
          </span>
          <div className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-2 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1 text-emerald-500" /> Junior Evaluator
          </div>
          <p className="text-xs text-slate-500 mt-1">Eligible for independent review in 14 days</p>
        </div>
      </div>

      {/* Curriculum Modules */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card p-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
          <BookOpen className="w-4 h-4 mr-2 text-indigo-600" />
          Core Onboarding Modules
        </h2>

        <div className="space-y-4">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <button
                  onClick={() => toggleModule(mod.id)}
                  className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                    mod.completed
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                  }`}
                >
                  {mod.completed && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {mod.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase">
                      {mod.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> {mod.duration}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {mod.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 shrink-0 justify-between sm:justify-end">
                <div className="w-28 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${mod.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 w-10 text-right">
                  {mod.progress}%
                </span>
                <button
                  onClick={() => navigate('/assistant')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  Study Guide
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supervised Verification Checklist Card */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
            <FileCheck2 className="w-4 h-4 mr-2 text-indigo-600" />
            Supervised Hands-On Verification Sandbox
          </h3>
          <span className="text-[11px] text-slate-400">Sandbox training mode active</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
          Practice your document scrutiny skills on pre-verified institutional applications. Your extractions are benchmarked against senior regional officer notes.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/documents')}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <span>Open Document Inspection Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <span>View Assigned Practice Tasks</span>
          </button>
        </div>
      </div>
    </div>
  );
};
