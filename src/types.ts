export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  createdAt: string;
  preferences?: {
    defaultLanguage?: string;
    defaultVoice?: string;
    defaultSpeed?: number;
  };
}

export interface Voice {
  id: string;
  name: string;
  language: string;
  langCode: string;
  gender: 'Female' | 'Male';
  accent: string;
  style: string;
  description: string;
  sampleText: string;
}

export interface AccentOption {
  code: string;
  label: string;
  flag: string;
}

export interface MaleToneOption {
  id: string;
  label: string;
  description: string;
  icon?: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  voicesCount: number;
}

export interface TTSRequest {
  text: string;
  language: string;
  voice: string;
  speed?: number;
  pitch?: number;
  accent?: string;
  tone?: string;
}

export interface TTSResponse {
  success: boolean;
  audioUrl: string;
  id: string;
  duration?: number;
  characterCount: number;
  wordCount: number;
  voice: string;
  language: string;
  format: string;
  message?: string;
}

export interface SpeechHistoryItem {
  id: string;
  userId: string;
  text: string;
  language: string;
  voice: string;
  audioUrl: string;
  characterCount: number;
  wordCount: number;
  duration?: number;
  isFavorite: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface ApiHealthResponse {
  status: string;
  service: string;
  timestamp: string;
  version: string;
  voicesAvailable: number;
}
