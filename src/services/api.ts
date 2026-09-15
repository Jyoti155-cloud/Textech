import {
  User,
  Voice,
  Language,
  TTSRequest,
  TTSResponse,
  SpeechHistoryItem,
  AuthResponse,
  ApiHealthResponse,
} from '../types';

const TOKEN_KEY = 'tts_auth_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async getHealth(): Promise<ApiHealthResponse> {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getVoices(language?: string): Promise<{ success: boolean; count: number; voices: Voice[] }> {
    const url = language ? `/api/voices?language=${encodeURIComponent(language)}` : '/api/voices';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch voices');
    return res.json();
  },

  async getLanguages(): Promise<{ success: boolean; count: number; languages: Language[] }> {
    const res = await fetch('/api/languages');
    if (!res.ok) throw new Error('Failed to fetch languages');
    return res.json();
  },

  async generateSpeech(req: TTSRequest): Promise<TTSResponse> {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(req),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to generate speech');
    }
    return data;
  },

  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed');
    }
    this.setToken(data.token);
    return data;
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Registration failed');
    }
    this.setToken(data.token);
    return data;
  },

  async getCurrentUser(): Promise<{ success: boolean; user: User }> {
    const token = this.getToken();
    if (!token) throw new Error('No session token');

    const res = await fetch('/api/auth/me', {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      this.removeToken();
      throw new Error(data.message || 'Session expired');
    }
    return data;
  },

  async updatePreferences(prefs: NonNullable<User['preferences']>): Promise<{ success: boolean; user: User }> {
    const res = await fetch('/api/auth/preferences', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(prefs),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update preferences');
    return data;
  },

  // History
  async getHistory(): Promise<{ success: boolean; history: SpeechHistoryItem[] }> {
    const res = await fetch('/api/history', {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch history');
    return data;
  },

  async deleteHistory(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/history/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete history');
    return data;
  },

  async toggleFavorite(id: string): Promise<{ success: boolean; item: SpeechHistoryItem }> {
    const res = await fetch(`/api/history/${id}/favorite`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to toggle favorite');
    return data;
  },

  // AI Text Enhancement
  async enhanceText(text: string, action: 'summarize' | 'grammar' | 'conversational' | 'bulletize') {
    const res = await fetch('/api/enhance-text', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ text, action }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to enhance text');
    }
    return data;
  },
};
