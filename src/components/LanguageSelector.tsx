import React from 'react';
import { Language } from '../types';
import { Globe2 } from 'lucide-react';

interface LanguageSelectorProps {
  languages: Language[];
  selectedLanguage: string;
  onSelectLanguage: (code: string) => void;
  loading?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  selectedLanguage,
  onSelectLanguage,
  loading = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
      <div className="flex items-center justify-between mb-3">
        <label htmlFor="language-select-dropdown" className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-indigo-600" />
          <span>Select Language</span>
        </label>
        <span className="text-xs text-slate-400 font-mono">
          {languages.length} supported
        </span>
      </div>

      <div className="relative">
        <select
          id="language-select-dropdown"
          value={selectedLanguage}
          onChange={(e) => onSelectLanguage(e.target.value)}
          disabled={loading}
          className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-hidden transition-all cursor-pointer disabled:opacity-50"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name === lang.nativeName ? lang.name : `${lang.name} (${lang.nativeName})`}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Quick Language Selector */}
      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-slate-400 font-bold mr-1">Quick Select:</span>
        {[
          { code: 'en', label: '🌐 English' },
          { code: 'hi-IN', label: '🇮🇳 हिन्दी' },
          { code: 'gu-IN', label: '🇮🇳 ગુજરાતી' },
          { code: 'mr-IN', label: '🇮🇳 मराठी' },
          { code: 'bn-IN', label: '🇮🇳 বাংলা' },
          { code: 'ta-IN', label: '🇮🇳 தமிழ்' },
          { code: 'te-IN', label: '🇮🇳 తెలుగు' },
          { code: 'kn-IN', label: '🇮🇳 ಕನ್ನಡ' },
        ].map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => onSelectLanguage(item.code)}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
              selectedLanguage === item.code
                ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
