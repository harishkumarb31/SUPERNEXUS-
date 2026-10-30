import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Building2, ShieldAlert, BookOpen, X, CornerDownLeft } from 'lucide-react';
import { assistantService } from '../services/api';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await assistantService.globalSearch(query);
        setResults(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'Application':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'Institution':
        return <Building2 className="w-4 h-4 text-emerald-500" />;
      case 'Compliance':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'Knowledge':
        return <BookOpen className="w-4 h-4 text-purple-500" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            className="w-full py-4 text-base bg-transparent border-0 focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
            placeholder="Search applications, institutions, compliance deadlines, APH rules (or press Esc)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2">
          {loading && (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Searching regulatory records...
            </div>
          )}

          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No matching applications, institutions, or regulatory rules found.
            </div>
          )}

          {!loading && results.length === 0 && query.length < 2 && (
            <div className="px-4 py-6 text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-slate-500 uppercase tracking-wider">Quick Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {['Apex Institute', 'Fire Safety NOC', 'APP-00101', 'Land Norms', 'EVC Schedule'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-mono"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                navigate(item.link);
                onClose();
              }}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {getIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                </div>
              </div>
              <CornerDownLeft className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
          <span>AICTE RegulaFlow Unified Regulatory Index</span>
          <div className="flex items-center space-x-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded shadow-sm">
                ESC
              </kbd>{' '}
              to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

