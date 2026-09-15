// Unified Audio & Speech Synthesis Engine

let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeAudioElement: HTMLAudioElement | null = null;
let currentPreviewVoiceId: string | null = null;

export interface VoicePlayOptions {
  text: string;
  langCode: string;
  voiceId?: string;
  accent?: string;
  tone?: string;
  speed?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Stop any ongoing speech preview (browser synthesis or audio element)
 */
export function stopAllSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('speechSynthesis cancel error:', e);
    }
  }

  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch (e) {
      console.warn('audioElement pause error:', e);
    }
    activeAudioElement = null;
  }

  activeUtterance = null;
  currentPreviewVoiceId = null;
}

/**
 * Check if a specific voice is currently playing
 */
export function isVoicePlaying(voiceId: string): boolean {
  return currentPreviewVoiceId === voiceId;
}

/**
 * Play a voice sample preview using high-fidelity server-side audio
 * with support for distinct voice pitch, timbre, accent, and character profiles.
 */
export async function playVoiceSample({
  text,
  langCode,
  voiceId,
  accent,
  tone,
  speed = 1.0,
  pitch = 1.0,
  onStart,
  onEnd,
  onError,
}: VoicePlayOptions): Promise<void> {
  // If this voice is already playing, stop it (toggle behavior)
  if (voiceId && currentPreviewVoiceId === voiceId) {
    stopAllSpeech();
    onEnd?.();
    return;
  }

  stopAllSpeech();

  if (voiceId) {
    currentPreviewVoiceId = voiceId;
  }

  const isMaleVoice = voiceId ? voiceId.toLowerCase().includes('male') : false;
  const effectiveTone = tone || (isMaleVoice ? 'deep' : undefined);

  // 1. Direct High-Fidelity Audio Preview from Server Voice Sample Endpoint
  if (voiceId) {
    try {
      const params = new URLSearchParams({ t: Date.now().toString() });
      if (accent) params.append('accent', accent);
      if (effectiveTone) params.append('tone', effectiveTone);
      const sampleUrl = `/api/voices/${encodeURIComponent(voiceId)}/sample?${params.toString()}`;
      const audio = new Audio(sampleUrl);
      activeAudioElement = audio;

      let started = false;
      audio.onplay = () => {
        started = true;
        onStart?.();
      };

      audio.onended = () => {
        currentPreviewVoiceId = null;
        activeAudioElement = null;
        onEnd?.();
      };

      audio.onerror = async (err) => {
        console.warn('Dedicated voice sample load warning, attempting fallback speech:', err);
        activeAudioElement = null;
        await fallbackServerSpeech(text, langCode, voiceId, accent, tone, onStart, onEnd, onError);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        if (!started) {
          started = true;
          onStart?.();
        }
      }
      return;
    } catch (directErr) {
      console.warn('Direct voice sample play rejected, falling back to /api/tts:', directErr);
    }
  }

  // 2. Fallback: Dynamic Server Audio Synthesis
  await fallbackServerSpeech(text, langCode, voiceId, accent, tone, onStart, onEnd, onError);
}

async function fallbackServerSpeech(
  text: string,
  langCode: string,
  voiceId?: string,
  accent?: string,
  tone?: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
) {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        language: langCode,
        voice: voiceId,
        accent,
        tone,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data.audioUrl) {
      throw new Error('No audio URL returned from server.');
    }

    const audio = new Audio(data.audioUrl);
    activeAudioElement = audio;

    audio.onplay = () => {
      onStart?.();
    };

    audio.onended = () => {
      currentPreviewVoiceId = null;
      activeAudioElement = null;
      onEnd?.();
    };

    audio.onerror = (e) => {
      currentPreviewVoiceId = null;
      activeAudioElement = null;
      onError?.(e);
      onEnd?.();
    };

    await audio.play();
  } catch (err) {
    currentPreviewVoiceId = null;
    activeAudioElement = null;
    onError?.(err);
    onEnd?.();
  }
}
