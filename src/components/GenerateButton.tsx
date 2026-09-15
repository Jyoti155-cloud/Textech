import React from 'react';
import { Volume2, Loader2, Play } from 'lucide-react';

interface GenerateButtonProps {
  onGenerate: () => void;
  loading: boolean;
  disabled?: boolean;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  onGenerate,
  loading,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div className="text-xs text-slate-500">
        <span className="font-semibold text-slate-700">Ready to synthesize</span> • Calls{' '}
        <code className="font-mono bg-slate-100 text-indigo-700 px-1 py-0.5 rounded text-[11px]">
          POST /api/tts
        </code>
      </div>

      <button
        type="button"
        id="btn-generate-speech"
        onClick={onGenerate}
        disabled={loading || disabled}
        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Synthesizing Voice...</span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Generate Speech</span>
          </>
        )}
      </button>
    </div>
  );
};
