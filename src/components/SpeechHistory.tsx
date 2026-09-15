import React, { useState } from 'react';
import { SpeechHistoryItem } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  History,
  Play,
  Download,
  Trash2,
  Heart,
  Search,
  LogIn,
  Clock,
  FileText,
  Volume2,
} from 'lucide-react';

interface SpeechHistoryProps {
  history: SpeechHistoryItem[];
  loading: boolean;
  onSelectForPlayback: (item: SpeechHistoryItem) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteItem: (id: string) => void;
}

export const SpeechHistory: React.FC<SpeechHistoryProps> = ({
  history,
  loading,
  onSelectForPlayback,
  onToggleFavorite,
  onDeleteItem,
}) => {
  const { user, openAuthModal } = useAuth();
  const [search, setSearch] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  if (!user) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <History className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Personal Speech History</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
          Sign in or create your own free account to preserve all synthesized speeches, organize
          favorites, and access previous audio files on any session.
        </p>
        <button
          type="button"
          id="btn-history-signin-prompt"
          onClick={() => openAuthModal('login')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In to View History</span>
        </button>
      </div>
    );
  }

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.text.toLowerCase().includes(search.toLowerCase()) ||
      item.voice.toLowerCase().includes(search.toLowerCase()) ||
      item.language.toLowerCase().includes(search.toLowerCase());
    const matchesFavorite = onlyFavorites ? item.isFavorite : true;
    return matchesSearch && matchesFavorite;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
      {/* Header with Search and Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Speech Generation History</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              {history.length} Saved
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Personal recordings saved for account <strong className="text-slate-700">{user.email}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
            />
          </div>

          <button
            type="button"
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              onlyFavorites
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-rose-600' : ''}`} />
            <span>Favorites</span>
          </button>
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">Loading your history records...</div>
      ) : filteredHistory.length === 0 ? (
        <div className="py-12 text-center">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No speech records found</p>
          <p className="text-xs text-slate-400 mt-1">
            {onlyFavorites
              ? 'You have not favorited any recordings yet.'
              : 'Enter some text above and click "Generate Speech" to begin building your personal library.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              id={`history-item-${item.id}`}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {item.voice}
                  </span>
                  <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    {item.language}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed italic">
                  "{item.text}"
                </p>

                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-mono">
                  <span>{item.characterCount} chars</span>
                  <span>•</span>
                  <span>{item.wordCount} words</span>
                  {item.duration && (
                    <>
                      <span>•</span>
                      <span>~{item.duration}s audio</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  id={`btn-play-history-${item.id}`}
                  onClick={() => onSelectForPlayback(item)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  title="Play audio in main player"
                >
                  <Play className="w-3 h-3 ml-0.5" />
                  <span>Play</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleFavorite(item.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    item.isFavorite
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-slate-50'
                  }`}
                  title={item.isFavorite ? 'Remove from favorites' : 'Favorite'}
                >
                  <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-rose-600' : ''}`} />
                </button>

                <a
                  href={`${item.audioUrl}?download=1`}
                  download
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  title="Download MP3"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                  title="Delete from history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
