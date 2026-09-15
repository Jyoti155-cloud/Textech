import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, SpeechHistoryItem } from '../../src/types.js';

interface DatabaseSchema {
  users: Array<User & { passwordHash: string }>;
  history: SpeechHistoryItem[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'tts_secret_salt_2026').digest('hex');
}

// Initial Indian seed accounts and speech library
const initialData: DatabaseSchema = {
  users: [
    {
      id: 'usr_aarav',
      name: 'Aarav Patel',
      email: 'aarav@example.com',
      passwordHash: hashPassword('demo123'),
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'Pro Member',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      preferences: {
        defaultLanguage: 'en-IN',
        defaultVoice: 'en-in-male-arjun',
        defaultSpeed: 1.0,
      },
    },
    {
      id: 'usr_priya',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      passwordHash: hashPassword('demo123'),
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      role: 'Pro Member',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      preferences: {
        defaultLanguage: 'hi-IN',
        defaultVoice: 'hi-in-female-sunita',
        defaultSpeed: 1.0,
      },
    },
    {
      id: 'usr_rohan',
      name: 'Rohan Deshmukh',
      email: 'rohan@example.com',
      passwordHash: hashPassword('demo123'),
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'Member',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      preferences: {
        defaultLanguage: 'mr-IN',
        defaultVoice: 'mr-in-male-sachin',
        defaultSpeed: 1.0,
      },
    },
    {
      id: 'usr_ananya',
      name: 'Ananya Iyer',
      email: 'ananya@example.com',
      passwordHash: hashPassword('demo123'),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Pro Member',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      preferences: {
        defaultLanguage: 'ta-IN',
        defaultVoice: 'ta-in-female-kavya',
        defaultSpeed: 1.0,
      },
    },
  ],
  history: [
    {
      id: 'hist_aarav_1',
      userId: 'usr_aarav',
      text: 'Good morning everyone. Welcome to the Indian Text-to-Speech studio. You can easily listen to daily news, study material, and technical docs in clear Indian voices.',
      language: 'en-IN',
      voice: 'Male Voice',
      audioUrl: '/audio/sample-en.mp3',
      characterCount: 161,
      wordCount: 26,
      duration: 8.5,
      isFavorite: true,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'hist_priya_1',
      userId: 'usr_priya',
      text: 'नमस्ते दोस्तों! टेक्स्ट टू स्पीच पोर्टल में आपका स्वागत है। यहां आप हिंदी, गुजराती, मराठी और अन्य भारतीय भाषाओं में प्राकृतिक आवाज़ सुन सकते हैं।',
      language: 'hi-IN',
      voice: 'Female Voice',
      audioUrl: '/audio/sample-hi.mp3',
      characterCount: 140,
      wordCount: 23,
      duration: 7.2,
      isFavorite: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'hist_rohan_1',
      userId: 'usr_rohan',
      text: 'नमस्कार! मराठी भाषेत मजकूर ऐकण्यासाठी ही एक उत्कृष्ट प्रणाली आहे. आपले साहित्य आणि बातम्या सहजपणे ऑडिओमध्ये रूपांतरित करा.',
      language: 'mr-IN',
      voice: 'Male Voice',
      audioUrl: '/audio/sample-mr.mp3',
      characterCount: 124,
      wordCount: 19,
      duration: 6.4,
      isFavorite: true,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

function readDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading db.json, re-initializing with seed data:', err);
  }
  writeDb(initialData);
  return initialData;
}

function writeDb(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

// In-memory token storage (Simple token session mapping)
const activeTokens = new Map<string, { userId: string; expiresAt: number }>();

// Pre-seed sessions for instant access
activeTokens.set('tts_tok_aarav', { userId: 'usr_aarav', expiresAt: Date.now() + 30 * 24 * 3600 * 1000 });
activeTokens.set('tts_tok_priya', { userId: 'usr_priya', expiresAt: Date.now() + 30 * 24 * 3600 * 1000 });

export const db = {
  // Users
  findUserByEmail(email: string) {
    const data = readDb();
    return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  findUserById(id: string): User | null {
    const data = readDb();
    const user = data.users.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },

  createUser(name: string, email: string, password: string): User {
    const data = readDb();
    if (data.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const newUser: User & { passwordHash: string } = {
      id: 'usr_' + crypto.randomBytes(8).toString('hex'),
      name,
      email,
      passwordHash: hashPassword(password),
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      role: 'Member',
      createdAt: new Date().toISOString(),
      preferences: {
        defaultLanguage: 'en-IN',
        defaultVoice: 'en-in-male-arjun',
        defaultSpeed: 1.0,
      },
    };
    data.users.push(newUser);
    writeDb(data);
    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  },

  verifyCredentials(email: string, password: string): User | null {
    const user = this.findUserByEmail(email);
    if (!user) return null;
    if (user.passwordHash !== hashPassword(password)) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },

  createSession(userId: string): string {
    const token = 'tts_tok_' + crypto.randomBytes(24).toString('hex');
    activeTokens.set(token, {
      userId,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    return token;
  },

  getUserByToken(token: string): User | null {
    const session = activeTokens.get(token);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      activeTokens.delete(token);
      return null;
    }
    return this.findUserById(session.userId);
  },

  updatePreferences(userId: string, prefs: NonNullable<User['preferences']>): User | null {
    const data = readDb();
    const user = data.users.find((u) => u.id === userId);
    if (!user) return null;
    user.preferences = { ...user.preferences, ...prefs };
    writeDb(data);
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },

  // History
  getHistory(userId: string): SpeechHistoryItem[] {
    const data = readDb();
    return data.history
      .filter((h) => h.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addHistory(item: Omit<SpeechHistoryItem, 'id' | 'createdAt'>): SpeechHistoryItem {
    const data = readDb();
    const newItem: SpeechHistoryItem = {
      ...item,
      id: 'hist_' + crypto.randomBytes(8).toString('hex'),
      createdAt: new Date().toISOString(),
    };
    data.history.unshift(newItem);
    if (data.history.length > 150) {
      data.history = data.history.slice(0, 150);
    }
    writeDb(data);
    return newItem;
  },

  deleteHistory(id: string, userId: string): boolean {
    const data = readDb();
    const initialLen = data.history.length;
    data.history = data.history.filter((h) => !(h.id === id && h.userId === userId));
    if (data.history.length !== initialLen) {
      writeDb(data);
      return true;
    }
    return false;
  },

  toggleFavorite(id: string, userId: string): SpeechHistoryItem | null {
    const data = readDb();
    const item = data.history.find((h) => h.id === id && h.userId === userId);
    if (!item) return null;
    item.isFavorite = !item.isFavorite;
    writeDb(data);
    return item;
  },
};
