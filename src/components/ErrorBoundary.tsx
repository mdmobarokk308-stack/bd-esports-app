import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorText: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorText: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorText: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in BD ESPORTS MS:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      localStorage.removeItem('bd_temp_cache');
    } catch (e) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-4 shadow-lg shadow-rose-950/50">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">সাময়িক সমস্যা হয়েছে</h2>
          <p className="text-sm text-slate-400 max-w-xs mb-6 leading-relaxed">
            অ্যাপটি স্বয়ংক্রিয়ভাবে রিস্টার্ট করতে নিচের বাটনে চাপ দিন।
          </p>
          <button
            onClick={this.handleReload}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-95 text-slate-950 font-bold rounded-2xl shadow-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
            রিলোড করুন (Reload App)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
