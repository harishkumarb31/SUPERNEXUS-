import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SuperNexus AI ErrorBoundary Caught]:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem('regulaflow_token');
    localStorage.removeItem('regulaflow_user');
    window.location.href = '/login';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white">Application Exception Encountered</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              SuperNexus AI encountered a runtime state conflict. Your local session has been secured and can be refreshed below.
            </p>
            {this.state.error?.message && (
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 font-mono text-[11px] text-rose-300 text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="pt-2 flex items-center justify-center space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
