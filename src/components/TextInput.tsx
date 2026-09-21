import React, { useRef, useState } from 'react';
import { Trash2, Upload, Sparkles, FileText } from 'lucide-react';
import { api } from '../services/api';

interface TextInputProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  maxChars?: number;
  selectedLanguage?: string;
  onError: (msg: string) => void;
}

export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  onClear,
  maxChars = 100000,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [enhancing, setEnhancing] = useState(false);
  const [enhanceAction, setEnhanceAction] = useState<string | null>(null);

  const charCount = value.length;
  const words = value.trim().split(/\s+/).filter(Boolean);
  const wordCount = value.trim() ? words.length : 0;
  // Estimate ~140 words per minute => ~2.3 words/sec
  const estimatedSeconds = Math.round(wordCount / 2.3);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      onError('Please select a plain text document (.txt).');
      return;
    }

    if (file.size > 500 * 1024) {
      onError('File exceeds 500 KB limit. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onChange(content.slice(0, maxChars));
      }
    };
    reader.onerror = () => {
      onError('Unable to read selected text file.');
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAiEnhance = async (action: 'summarize' | 'grammar' | 'conversational') => {
    if (!value.trim()) {
      onError('Please type or paste some text first before applying AI enhancement.');
      return;
    }
    setEnhancing(true);
    setEnhanceAction(action);
    try {
      const res = await api.enhanceText(value, action);
      if (res?.enhancedText) {
        onChange(res.enhancedText.slice(0, maxChars));
      }
    } catch (err: any) {
      onError(err?.message || 'AI text enhancement failed.');
    } finally {
      setEnhancing(false);
      setEnhanceAction(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 transition-all">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <label htmlFor="text-input-field" className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>Input Text</span>
        </label>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Upload Text File */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt"
            className="hidden"
          />
          <button
            type="button"
            id="btn-upload-file"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
            title="Upload a .txt document"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>

          {/* Clear Text */}
          {value.length > 0 && (
            <button
              type="button"
              id="btn-clear-text"
              onClick={onClear}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors"
              title="Clear all text"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          id="text-input-field"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxChars}
          rows={6}
          placeholder="Type, paste, or upload text to synthesize natural voice output..."
          className="w-full px-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white resize-y transition-all outline-hidden leading-relaxed"
        />
      </div>

      {/* Footer Details & AI Tools */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="font-mono">
            Characters:{' '}
            <strong className={charCount > maxChars * 0.9 ? 'text-amber-600' : 'text-slate-800'}>
              {charCount.toLocaleString()}
            </strong>{' '}
            / {maxChars.toLocaleString()}
          </span>
          <span>
            Words: <strong className="text-slate-800">{wordCount.toLocaleString()}</strong>
          </span>
          {wordCount > 0 && (
            <span className="hidden md:inline">
              Estimated Duration:{' '}
              <strong className="text-indigo-700">
                {estimatedSeconds < 60
                  ? `${estimatedSeconds}s`
                  : estimatedSeconds < 3600
                  ? `${Math.floor(estimatedSeconds / 60)}m ${estimatedSeconds % 60}s`
                  : `${Math.floor(estimatedSeconds / 3600)}h ${Math.floor((estimatedSeconds % 3600) / 60)}m`}
              </strong>
            </span>
          )}
        </div>

        {/* AI Enhancement Tools */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            AI Polish:
          </span>
          <button
            type="button"
            id="btn-ai-grammar"
            onClick={() => handleAiEnhance('grammar')}
            disabled={enhancing || !value.trim()}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors disabled:opacity-40"
            title="Correct grammar and spelling automatically"
          >
            {enhancing && enhanceAction === 'grammar' ? 'Polishing...' : 'Correct Grammar'}
          </button>
          <button
            type="button"
            id="btn-ai-conversational"
            onClick={() => handleAiEnhance('conversational')}
            disabled={enhancing || !value.trim()}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors disabled:opacity-40"
            title="Make delivery conversational and smooth"
          >
            {enhancing && enhanceAction === 'conversational' ? 'Rewriting...' : 'Conversational Tone'}
          </button>
          <button
            type="button"
            id="btn-ai-summarize"
            onClick={() => handleAiEnhance('summarize')}
            disabled={enhancing || !value.trim()}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors disabled:opacity-40"
            title="Summarize key points for faster listening"
          >
            {enhancing && enhanceAction === 'summarize' ? 'Summarizing...' : 'Summarize'}
          </button>
        </div>
      </div>
    </div>
  );
};
