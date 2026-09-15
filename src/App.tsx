import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { TextInput } from './components/TextInput';
import { LanguageSelector } from './components/LanguageSelector';
import { VoiceSelector } from './components/VoiceSelector';
import { GenerateButton } from './components/GenerateButton';
import { AudioPlayer } from './components/AudioPlayer';
import { SpeechHistory } from './components/SpeechHistory';
import { ApiDocsModal } from './components/ApiDocsModal';
import { AuthModal } from './components/AuthModal';
import { ErrorMessage } from './components/ErrorMessage';
import { Language, Voice, SpeechHistoryItem, TTSResponse } from './types';
import { api } from './services/api';
import { getAccentsForLanguage } from './utils/accentConfig';
import { Sparkles, CheckCircle2, ShieldCheck, Zap, Globe, AudioWaveform } from 'lucide-react';

function MainTTSContent() {
  const { user } = useAuth();

  // State
  const [inputText, setInputText] = useState<string>(
    'Welcome to the Text to Speech studio. You can enter any text here, select your preferred voice, and instantly listen to or download natural audio speech.'
  );
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('en-female-1');
  const speed = 1.0;
  const pitch = 1.0;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active audio player state
  const [currentAudio, setCurrentAudio] = useState<{
    audioUrl: string;
    voiceName: string;
    language: string;
    duration: number;
    textSnippet: string;
    isFavorite?: boolean;
    historyId?: string;
    accent?: string;
    tone?: string;
  } | null>({
    audioUrl: '/audio/sample-en.mp3',
    voiceName: 'Female Voice',
    language: 'English',
    duration: 8.5,
    textSnippet: 'Welcome to the Text to Speech studio. You can easily listen to daily news, study material, and technical docs in clear English voices.',
    isFavorite: true,
  });

  // Accents and Male Tones
  const [femaleAccent, setFemaleAccent] = useState<string>('en-US');
  const [maleAccent, setMaleAccent] = useState<string>('en-US');
  const [maleTone] = useState<string>('deep');

  // Speech History
  const [history, setHistory] = useState<SpeechHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  // Tabs & Modals
  const [activeTab, setActiveTab] = useState<'convert' | 'history'>('convert');
  const [isApiDocsOpen, setIsApiDocsOpen] = useState<boolean>(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(false);

  // Load languages on mount
  useEffect(() => {
    async function loadData() {
      try {
        const langRes = await api.getLanguages();
        if (langRes.languages && langRes.languages.length > 0) {
          setLanguages(langRes.languages);
        }
      } catch (err) {
        console.warn('Failed to load languages from backend:', err);
      }
    }
    loadData();
  }, []);

  // Sync accents when language changes
  useEffect(() => {
    const langAccents = getAccentsForLanguage(selectedLanguage);
    if (langAccents && langAccents.length > 0) {
      setFemaleAccent(langAccents[0].code);
      setMaleAccent(langAccents[0].code);
    }
  }, [selectedLanguage]);

  // Load voices whenever selectedLanguage changes
  useEffect(() => {
    async function loadVoices() {
      try {
        const voicesRes = await api.getVoices(selectedLanguage);
        if (voicesRes.voices && voicesRes.voices.length > 0) {
          setVoices(voicesRes.voices);
          const stillValid = voicesRes.voices.some((v) => v.id === selectedVoiceId);
          if (!stillValid) {
            setSelectedVoiceId(voicesRes.voices[0].id);
          }
        }
      } catch (err) {
        console.warn('Failed to load voices:', err);
      }
    }
    loadVoices();
  }, [selectedLanguage]);

  // Load user history
  const loadHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      return;
    }
    setHistoryLoading(true);
    try {
      const res = await api.getHistory();
      setHistory(res.history || []);
    } catch (err) {
      console.warn('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Handle Speech Generation
  const handleGenerate = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      setError('Please enter or paste some text to synthesize.');
      return;
    }
    if (trimmed.length > 2000) {
      setError('Text exceeds maximum limit of 2000 characters.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const chosenVoice = voices.find((v) => v.id === selectedVoiceId);
      const isFemale = chosenVoice ? chosenVoice.gender === 'Female' : true;
      const chosenAccent = isFemale ? femaleAccent : maleAccent;
      const chosenTone = !isFemale ? 'deep' : undefined;

      const res: TTSResponse = await api.generateSpeech({
        text: trimmed,
        language: selectedLanguage,
        voice: selectedVoiceId,
        speed,
        pitch,
        accent: chosenAccent,
        tone: chosenTone,
      });

      const voiceLabel = chosenVoice ? chosenVoice.name : res.voice;

      setCurrentAudio({
        audioUrl: res.audioUrl,
        voiceName: voiceLabel,
        language: res.language,
        duration: res.duration || 3.0,
        textSnippet: trimmed,
        historyId: (res as any).historyId,
        isFavorite: false,
        accent: chosenAccent,
        tone: chosenTone,
      });
      setAutoPlayAudio(true);

      // Refresh personal history if signed in
      if (user) {
        loadHistory();
      }
    } catch (err: any) {
      setError(err?.message || 'Server error while synthesizing speech. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputText, selectedLanguage, selectedVoiceId, speed, pitch]);

  // Voice preview handler
  const handlePreviewVoice = (sampleText: string, langCode: string, voiceId: string) => {
    setSelectedLanguage(langCode);
    setSelectedVoiceId(voiceId);
    if (!inputText || inputText.trim().length === 0) {
      setInputText(sampleText);
    }
  };

  // Playback history item
  const handleSelectHistoryForPlayback = (item: SpeechHistoryItem) => {
    setCurrentAudio({
      audioUrl: item.audioUrl,
      voiceName: item.voice,
      language: item.language,
      duration: item.duration || 3.0,
      textSnippet: item.text,
      isFavorite: item.isFavorite,
      historyId: item.id,
    });
    setAutoPlayAudio(true);
    setActiveTab('convert');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = async (id?: string) => {
    const targetId = id || currentAudio?.historyId;
    if (!targetId || !user) return;
    try {
      const res = await api.toggleFavorite(targetId);
      if (res?.item) {
        setHistory((prev) =>
          prev.map((h) => (h.id === targetId ? { ...h, isFavorite: res.item.isFavorite } : h))
        );
        if (currentAudio && currentAudio.historyId === targetId) {
          setCurrentAudio({ ...currentAudio, isFavorite: res.item.isFavorite });
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update favorite status.');
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await api.deleteHistory(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      if (currentAudio?.historyId === id) {
        setCurrentAudio(null);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to remove history record.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navigation Header */}
      <Navbar
        onOpenApiDocs={() => setIsApiDocsOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
      />

      {/* Main Studio Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Error notification banner */}
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
          onRetry={handleGenerate}
        />

        {/* View Switch */}
        {activeTab === 'convert' ? (
          <div className="space-y-6 animate-in fade-in">
            {/* Audio Player */}
            {currentAudio && (
              <AudioPlayer
                audioUrl={currentAudio.audioUrl}
                voiceName={currentAudio.voiceName}
                language={currentAudio.language}
                duration={currentAudio.duration}
                textSnippet={currentAudio.textSnippet}
                playbackSpeed={speed}
                isFavorite={currentAudio.isFavorite}
                onToggleFavorite={user && currentAudio.historyId ? () => handleToggleFavorite() : undefined}
                autoPlay={autoPlayAudio}
                accent={currentAudio.accent}
                tone={currentAudio.tone}
              />
            )}

            {/* Text Input Component */}
            <TextInput
              value={inputText}
              onChange={setInputText}
              onClear={() => setInputText('')}
              maxChars={2000}
              selectedLanguage={selectedLanguage}
              onError={(msg) => setError(msg)}
            />

            {/* Language Selector */}
            <LanguageSelector
              languages={languages}
              selectedLanguage={selectedLanguage}
              onSelectLanguage={setSelectedLanguage}
              loading={loading}
            />

            {/* Voice Option Selector (Female Voice and Deep Male Voice with Accents) */}
            <VoiceSelector
              voices={voices}
              selectedVoiceId={selectedVoiceId}
              onSelectVoice={setSelectedVoiceId}
              loading={loading}
              onPreviewVoice={handlePreviewVoice}
              speed={speed}
              pitch={pitch}
              language={selectedLanguage}
              femaleAccent={femaleAccent}
              onFemaleAccentChange={setFemaleAccent}
              maleAccent={maleAccent}
              onMaleAccentChange={setMaleAccent}
            />

            {/* Generate Action Button */}
            <GenerateButton
              onGenerate={handleGenerate}
              loading={loading}
              disabled={!inputText.trim()}
            />

            {/* Feature Highlights Grid (Production Quality) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">10+ Indian Languages</h4>
                  <p className="text-[11px] text-slate-500">Hindi, Gujarati, Marathi, Tamil, Telugu, Kannada & more</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Instant MP3 Export</h4>
                  <p className="text-[11px] text-slate-500">Fast cloud synthesis and direct high-fidelity downloads</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Personal Audio Vault</h4>
                  <p className="text-[11px] text-slate-500">Dedicated accounts with persistent speech histories</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* History View */
          <div className="animate-in fade-in">
            <SpeechHistory
              history={history}
              loading={historyLoading}
              onSelectForPlayback={handleSelectHistoryForPlayback}
              onToggleFavorite={handleToggleFavorite}
              onDeleteItem={handleDeleteHistoryItem}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-xs text-slate-500">
          <p>© 2026 Textech(Text -&gt; Speech) • All Rights Reserved</p>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal />
      <ApiDocsModal isOpen={isApiDocsOpen} onClose={() => setIsApiDocsOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainTTSContent />
    </AuthProvider>
  );
}
