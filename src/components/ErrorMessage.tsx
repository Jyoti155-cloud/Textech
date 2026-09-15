import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss, onRetry }) => {
  if (!message) return null;

  return (
    <div
      id="error-message-banner"
      className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start justify-between gap-3 text-red-800 shadow-xs animate-in fade-in"
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-red-900">Conversion or Request Notice</h4>
          <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="p-1.5 text-red-700 hover:bg-red-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
            title="Retry request"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Retry</span>
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
