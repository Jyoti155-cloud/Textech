import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Heart,
  Share2,
  Check,
  Radio,
  AlertCircle,
} from 'lucide-react';
import { playVoiceSample } from '../utils/audioEngine';

interface AudioPlayerProps {
  audioUrl: string;
  voiceName: string;
  language: string;
  duration?: number;
  textSnippet: string;
  playbackSpeed?: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  format?: string;
  autoPlay?: boolean;
  accent?: string;
  tone?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  voiceName,
  language,
  duration = 0,
  textSnippet,
  playbackSpeed = 1.0,
  isFavorite = false,
  onToggleFavorite,
  format = 'audio/mpeg',
  autoPlay = false,
  accent,
  tone,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(duration);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeRate, setActiveRate] = useState<number>(playbackSpeed);
  const [playbackError, setPlaybackError] = useState<boolean>(false);
  const [needsClickToPlay, setNeedsClickToPlay] = useState<boolean>(false);

  useEffect(() => {
    // When audioUrl changes, reset state
    setIsPlaying(false);
    setCurrentTime(0);
    setPlaybackError(false);
    setNeedsClickToPlay(false);

    if (audioRef.current) {
      audioRef.current.load();
      if (autoPlay) {
        // Attempt immediate playback
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((err) => {
              console.log('Autoplay deferred for user gesture:', err?.message);
              setNeedsClickToPlay(true);
            });
        }
      }
    }
  }, [audioUrl, autoPlay]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = activeRate;
    }
  }, [activeRate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    setNeedsClickToPlay(false);

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setPlaybackError(false);
        })
        .catch((err) => {
          console.warn('Audio play error, using speech synthesis fallback:', err);
          // Fallback to browser speech synthesis if audio file playback failed
          playVoiceSample({
            text: textSnippet,
            langCode: language,
            speed: activeRate,
            onStart: () => setIsPlaying(true),
            onEnd: () => setIsPlaying(false),
            onError: () => {
              setIsPlaying(false);
              setPlaybackError(true);
            },
          });
        });
    }
  };

  const handleAudioError = () => {
    console.warn('Audio element error for URL:', audioUrl);
    setPlaybackError(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setTotalDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) setIsMuted(true);
      else setIsMuted(false);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play().then(() => setIsPlaying(true));
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    const extension = format.includes('wav') ? 'wav' : 'mp3';
    link.download = `vani-speech-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(textSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const mins = Math.floor(secs / 60);
    const remSecs = Math.floor(secs % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div
      id="audio-player-container"
      className="bg-white rounded-2xl border-2 border-indigo-100 shadow-xs p-5 sm:p-6 transition-all"
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="auto"
        onError={handleAudioError}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPlaying ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
              }`}
            ></span>
            <h3 className="font-bold text-base text-slate-900">
              {isPlaying ? 'Now Speaking' : 'Speech Ready'}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {voiceName} ({language})
            </span>
            {accent && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {accent}
              </span>
            )}
            {tone && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                Deep Voice
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic max-w-lg">
            "{textSnippet}"
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {onToggleFavorite && (
            <button
              type="button"
              id="btn-player-favorite"
              onClick={onToggleFavorite}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorite
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600' : ''}`} />
            </button>
          )}

          <button
            type="button"
            id="btn-player-copy"
            onClick={handleCopySnippet}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            title="Copy synthesized text"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Click-to-Play Notice if browser requested gesture */}
      {needsClickToPlay && (
        <div className="mb-3 p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900">
          <span className="font-medium">Audio is ready! Tap play to listen:</span>
          <button
            onClick={togglePlay}
            className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-2xs"
          >
            Listen Now
          </button>
        </div>
      )}

      {/* Frequency Waveform Bar Visualization */}
      <div className="mb-4 bg-slate-900 rounded-xl p-4 flex items-center justify-center gap-1 sm:gap-1.5 h-20 overflow-hidden shadow-inner">
        {[
          40, 65, 25, 80, 50, 95, 30, 70, 85, 45, 90, 60, 100, 75, 35, 90, 55, 80, 40, 70,
          30, 85, 60, 95, 45, 80, 50, 90, 35, 65, 50, 75, 90, 40, 60, 30,
        ].map((height, idx) => {
          const isCurrentSlice = (idx / 36) * 100 <= progressPercent;
          return (
            <div
              key={idx}
              className={`w-1 sm:w-1.5 rounded-full transition-all duration-150 ${
                isPlaying
                  ? isCurrentSlice
                    ? 'bg-indigo-400'
                    : 'bg-slate-700'
                  : isCurrentSlice
                  ? 'bg-indigo-500/70'
                  : 'bg-slate-800'
              }`}
              style={{
                height: isPlaying
                  ? `${Math.max(15, height * (0.5 + Math.sin(idx + currentTime * 5) * 0.5))}%`
                  : `${height * 0.4}%`,
              }}
            />
          );
        })}
      </div>

      {/* Progress Slider */}
      <div className="space-y-1 mb-4">
        <input
          id="audio-seek-slider"
          type="range"
          min="0"
          max={totalDuration || 1}
          step="0.05"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-[11px] font-mono text-slate-500 px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-player-play-pause"
            onClick={togglePlay}
            className="w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xs transition-transform active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button
            type="button"
            id="btn-player-restart"
            onClick={handleRestart}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Restart playback"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 ml-1 bg-slate-100 px-2.5 py-1.5 rounded-xl">
            <button
              type="button"
              id="btn-player-mute"
              onClick={toggleMute}
              className="text-slate-600 hover:text-slate-900"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              id="slider-player-volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>

        {/* Speed Switcher & Download CTA */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            {[0.75, 1.0, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setActiveRate(rate)}
                className={`px-2 py-1 rounded-lg transition-all ${
                  activeRate === rate
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          <button
            type="button"
            id="btn-download-audio"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Audio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
