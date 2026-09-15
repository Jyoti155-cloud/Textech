import React, { useState, useEffect } from 'react';
import { Voice } from '../types';
import { Mic, UserCheck, Volume2, Square, User, Globe } from 'lucide-react';
import { playVoiceSample, stopAllSpeech } from '../utils/audioEngine';
import { getAccentsForLanguage } from '../utils/accentConfig';

interface VoiceSelectorProps {
  voices: Voice[];
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
  loading?: boolean;
  onPreviewVoice?: (sampleText: string, langCode: string, voiceId: string) => void;
  speed?: number;
  pitch?: number;
  language?: string;
  femaleAccent?: string;
  onFemaleAccentChange?: (accent: string) => void;
  maleAccent?: string;
  onMaleAccentChange?: (accent: string) => void;
  maleTone?: string;
  onMaleToneChange?: (tone: string) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoiceId,
  onSelectVoice,
  loading = false,
  onPreviewVoice,
  speed = 1.0,
  pitch = 1.0,
  language = 'en',
  femaleAccent = 'en-US',
  onFemaleAccentChange,
  maleAccent = 'en-US',
  onMaleAccentChange,
}) => {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Clean up when unmounting
  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, []);

  const accents = getAccentsForLanguage(language);

  // Sort female first, then male
  const sortedVoices = [...voices].sort((a, b) => {
    if (a.gender === 'Female' && b.gender === 'Male') return -1;
    if (a.gender === 'Male' && b.gender === 'Female') return 1;
    return 0;
  });

  const handlePreviewClick = async (e: React.MouseEvent, voice: Voice) => {
    e.stopPropagation();

    // Select the voice immediately
    onSelectVoice(voice.id);
    if (onPreviewVoice) {
      onPreviewVoice(voice.sampleText, voice.langCode, voice.id);
    }

    if (playingVoiceId === voice.id) {
      stopAllSpeech();
      setPlayingVoiceId(null);
      return;
    }

    setPlayingVoiceId(voice.id);

    const isFemale = voice.gender === 'Female';
    const chosenAccent = isFemale ? femaleAccent : maleAccent;
    const chosenTone = !isFemale ? 'deep' : undefined;

    try {
      await playVoiceSample({
        text: voice.sampleText,
        langCode: voice.langCode,
        voiceId: voice.id,
        accent: chosenAccent,
        tone: chosenTone,
        speed,
        pitch,
        onStart: () => setPlayingVoiceId(voice.id),
        onEnd: () => setPlayingVoiceId(null),
        onError: (err) => {
          console.warn('Voice preview playback error:', err);
          setPlayingVoiceId(null);
        },
      });
    } catch (err) {
      console.warn('Failed to play preview sample:', err);
      setPlayingVoiceId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Mic className="w-4 h-4 text-indigo-600" />
          <span>Select Voice Option</span>
        </label>
        <span className="text-xs text-slate-500 font-medium">
          Accents & Dialects
        </span>
      </div>

      {voices.length === 0 ? (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
          Loading voices for selected language...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedVoices.map((voice) => {
            const isSelected = selectedVoiceId === voice.id;
            const isPlaying = playingVoiceId === voice.id;
            const isFemale = voice.gender === 'Female';
            const currentAccent = isFemale ? femaleAccent : maleAccent;

            return (
              <div
                key={voice.id}
                id={`voice-card-${voice.id}`}
                onClick={() => onSelectVoice(voice.id)}
                className={`group relative p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? isFemale
                      ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-400/25 shadow-xs'
                      : 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/25 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                {/* Voice Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isFemale
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      <User className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900 truncate">
                          {isFemale ? 'Female Voice' : 'Male Voice'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isFemale
                          ? 'Clear, Natural & Sweet Soprano'
                          : 'Deep, Rich & Resonant Voice'}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                        isFemale ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Accent Selection Options */}
                <div className="mt-3.5 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Globe
                        className={`w-3.5 h-3.5 ${
                          isFemale ? 'text-rose-500' : 'text-indigo-500'
                        }`}
                      />
                      <span>Accent:</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {accents.map((acc) => {
                      const isAccSelected = currentAccent === acc.code;
                      return (
                        <button
                          key={acc.code}
                          type="button"
                          id={`btn-accent-${voice.id}-${acc.code}`}
                          onClick={() => {
                            stopAllSpeech();
                            setPlayingVoiceId(null);
                            onSelectVoice(voice.id);
                            if (isFemale && onFemaleAccentChange) {
                              onFemaleAccentChange(acc.code);
                            } else if (!isFemale && onMaleAccentChange) {
                              onMaleAccentChange(acc.code);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                            isAccSelected
                              ? isFemale
                                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                                : 'bg-indigo-600 text-white shadow-xs font-semibold'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title={`${acc.label}`}
                        >
                          <span>{acc.flag}</span>
                          <span>{acc.shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sample phrase & Audio Preview trigger */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="italic truncate pr-2 max-w-[180px]" title={voice.sampleText}>
                    "{voice.sampleText}"
                  </span>

                  <button
                    type="button"
                    id={`btn-preview-voice-${voice.id}`}
                    onClick={(e) => handlePreviewClick(e, voice)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isPlaying
                        ? isFemale
                          ? 'bg-rose-600 text-white shadow-xs animate-pulse ring-2 ring-rose-400'
                          : 'bg-indigo-600 text-white shadow-xs animate-pulse ring-2 ring-indigo-400'
                        : isFemale
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                    }`}
                    title={isPlaying ? 'Click to stop sample audio' : 'Listen to voice sample with current accent & tone'}
                  >
                    {isPlaying ? (
                      <>
                        <Square className="w-3 h-3 fill-white text-white" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Preview Audio</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
