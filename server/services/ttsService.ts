import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';
import { exec } from 'child_process';
import util from 'util';
import { Voice, Language } from '../../src/types.js';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import xmlEscape from 'xml-escape';

const execPromise = util.promisify(exec);
const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');
const SAMPLES_DIR = path.join(AUDIO_DIR, 'samples');

// Ensure audio directories exist
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}
if (!fs.existsSync(SAMPLES_DIR)) {
  fs.mkdirSync(SAMPLES_DIR, { recursive: true });
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🌐', voicesCount: 2 },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', voicesCount: 2 },
  { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', voicesCount: 2 },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', voicesCount: 2 },
  { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', voicesCount: 2 },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', voicesCount: 2 },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', voicesCount: 2 },
  { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', voicesCount: 2 },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', voicesCount: 2 },
  { code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', voicesCount: 2 },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', voicesCount: 2 },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷', voicesCount: 2 },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', voicesCount: 2 },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', voicesCount: 2 },
];

export const VOICES: Voice[] = [
  // English (en)
  {
    id: 'en-female-1',
    name: 'Female Voice',
    language: 'English',
    langCode: 'en',
    gender: 'Female',
    accent: 'English',
    style: 'Natural & Warm',
    description: 'Clear, modern English female voice.',
    sampleText: 'Welcome to the speech studio. How can I assist your reading today?',
  },
  {
    id: 'en-male-1',
    name: 'Male Voice',
    language: 'English',
    langCode: 'en',
    gender: 'Male',
    accent: 'English',
    style: 'Deep & Authoritative',
    description: 'Professional baritone English voice well-suited for presentations and articles.',
    sampleText: 'Welcome to the application. Your spoken audio is ready to listen.',
  },

  // Hindi (hi-IN)
  {
    id: 'hi-in-female-sunita',
    name: 'Female Voice',
    language: 'Hindi',
    langCode: 'hi-IN',
    gender: 'Female',
    accent: 'Standard Hindi',
    style: 'Sweet & Melodious',
    description: 'सुंदर और स्पष्ट हिंदी आवाज़, समाचार, कहानियों और दैनिक अध्ययन के लिए अत्यंत उपयुक्त।',
    sampleText: 'नमस्ते! टेक्स्ट टू स्पीच पोर्टल में आपका हार्दिक स्वागत है।',
  },
  {
    id: 'hi-in-male-amit',
    name: 'Male Voice',
    language: 'Hindi',
    langCode: 'hi-IN',
    gender: 'Male',
    accent: 'Standard Hindi',
    style: 'Deep & Resonant',
    description: 'गहरा और आत्मविश्वास से भरा पुरुष स्वर।',
    sampleText: 'टेक्स्ट टू स्पीच के साथ अपनी डिजिटल सामग्री को जीवंत बनाएं।',
  },

  // English (India) (en-IN)
  {
    id: 'en-in-female-ananya',
    name: 'Female Voice',
    language: 'English (India)',
    langCode: 'en-IN',
    gender: 'Female',
    accent: 'Indian English',
    style: 'Warm & Natural',
    description: 'Expressive Indian female voice ideal for audiobooks, education, and podcasts.',
    sampleText: 'Greetings! Listen to your articles with a smooth, authentic Indian voice.',
  },
  {
    id: 'en-in-male-arjun',
    name: 'Male Voice',
    language: 'English (India)',
    langCode: 'en-IN',
    gender: 'Male',
    accent: 'Indian English',
    style: 'Professional & Articulate',
    description: 'Distinguished Indian male voice with crisp, polished corporate diction.',
    sampleText: 'Hello and welcome. I can convert your documents into natural Indian English speech.',
  },

  // Gujarati (gu-IN)
  {
    id: 'gu-in-female-meera',
    name: 'Female Voice',
    language: 'Gujarati',
    langCode: 'gu-IN',
    gender: 'Female',
    accent: 'Standard Gujarati',
    style: 'Expressive & Melodious',
    description: 'સુંદર અને શુદ્ધ ગુજરાતી વાણી, દૈનિક વાંચન અને વાર્તાઓ માટે શ્રેષ્ઠ.',
    sampleText: 'નમસ્તે! ટેક્સ્ટ ટુ સ્પીચ એપ્લિકેશનમાં આપનું હાર્દિક સ્વાગત છે.',
  },
  {
    id: 'gu-in-male-kiran',
    name: 'Male Voice',
    language: 'Gujarati',
    langCode: 'gu-IN',
    gender: 'Male',
    accent: 'Standard Gujarati',
    style: 'Resonant & Energetic',
    description: 'સ્પષ્ટ અને ઉત્સાહી ગુજરાતી પુરુષ અવાજ.',
    sampleText: 'કેમ છો મિત્રો! આ એપ્લિકેશન દ્વારા તમે કોઈપણ લખાણ સાંભળી શકો છો.',
  },

  // Marathi (mr-IN)
  {
    id: 'mr-in-female-gauri',
    name: 'Female Voice',
    language: 'Marathi',
    langCode: 'mr-IN',
    gender: 'Female',
    accent: 'Standard Marathi',
    style: 'Graceful & Clear',
    description: 'गोड आणि अस्खलित मराठी आवाज, पुस्तके आणि बातम्यांसाठी सुयोग्य.',
    sampleText: 'नमस्कार! टेक्स्ट टू स्पीच ॲप्लिकेशनमध्ये आपले स्वागत आहे.',
  },
  {
    id: 'mr-in-male-sachin',
    name: 'Male Voice',
    language: 'Marathi',
    langCode: 'mr-IN',
    gender: 'Male',
    accent: 'Standard Marathi',
    style: 'Deep & Confident',
    description: 'भारदस्त आणि स्पष्ट मराठी पुरुष आवाज, व्याख्याने आणि बातम्यांसाठी योग्य.',
    sampleText: 'नमस्कार! मराठी भाषेत मजकूर ऐकण्यासाठी ही एक उत्तम प्रणाली आहे.',
  },

  // Bengali (bn-IN)
  {
    id: 'bn-in-female-riya',
    name: 'Female Voice',
    language: 'Bengali',
    langCode: 'bn-IN',
    gender: 'Female',
    accent: 'Standard Bengali',
    style: 'Gentle & Sweet',
    description: 'মধুর এবং স্পষ্ট বাংলা নারী কণ্ঠ, সাহিত্য ও সংবাদের জন্য উপযোগী।',
    sampleText: 'নমস্কার! টেক্সট টু স্পিচ অ্যাপ্লিকেশনে আপনাকে স্বাগত জানাই।',
  },
  {
    id: 'bn-in-male-debanjan',
    name: 'Male Voice',
    language: 'Bengali',
    langCode: 'bn-IN',
    gender: 'Male',
    accent: 'Standard Bengali',
    style: 'Clear & Resonant',
    description: 'গম্ভীর ও মার্জিত বাংলা পুরুষ কণ্ঠ।',
    sampleText: 'আপনার লেখা পাঠ্য এখন স্বাভাবিক কণ্ঠে শুনতে পারবেন।',
  },

  // Tamil (ta-IN)
  {
    id: 'ta-in-female-kavya',
    name: 'Female Voice',
    language: 'Tamil',
    langCode: 'ta-IN',
    gender: 'Female',
    accent: 'Standard Tamil',
    style: 'Fluent & Expressive',
    description: 'தெளிவான மற்றும் இனிய தமிழ் பெண் குரல்.',
    sampleText: 'வணக்கம்! உரை ஒலி மாற்றி செயலಿಗೆ உங்களை வரவேற்கிறோம்.',
  },
  {
    id: 'ta-in-male-karthik',
    name: 'Male Voice',
    language: 'Tamil',
    langCode: 'ta-IN',
    gender: 'Male',
    accent: 'Standard Tamil',
    style: 'Confident & Steady',
    description: 'நம்பகமான மற்றும் கம்பீரமான தமிழ் ஆண் குரல்.',
    sampleText: 'வணக்கம், உங்கள் உரை இப்போது குரல் வடிவத்தில் தயாராக உள்ளது.',
  },

  // Telugu (te-IN)
  {
    id: 'te-in-female-sravani',
    name: 'Female Voice',
    language: 'Telugu',
    langCode: 'te-IN',
    gender: 'Female',
    accent: 'Standard Telugu',
    style: 'Soft & Natural',
    description: 'మధురమైన మరియు సహజమైన తెలుగు మహిళా స్వరం.',
    sampleText: 'నమస్కారం! టెక్స్ట్ టు స్పీచ్ అప్లికేషన్‌కు స్వాగతం.',
  },
  {
    id: 'te-in-male-suresh',
    name: 'Male Voice',
    language: 'Telugu',
    langCode: 'te-IN',
    gender: 'Male',
    accent: 'Standard Telugu',
    style: 'Clear & Resonant',
    description: 'స్పష్టమైన మరియు గంభీరమైన తెలుగు పురుష స్వరం.',
    sampleText: 'నమస్కారం మిత్రులారా, మీ ఆడియో సిద్ధంగా ఉంది.',
  },

  // Kannada (kn-IN)
  {
    id: 'kn-in-female-deepa',
    name: 'Female Voice',
    language: 'Kannada',
    langCode: 'kn-IN',
    gender: 'Female',
    accent: 'Standard Kannada',
    style: 'Expressive & Pleasant',
    description: 'ಸ್ಪಷ್ಟ ಮತ್ತು ಸುಮಧುರ ಕನ್ನಡ ಮಹಿಳಾ ಧ್ವನಿ.',
    sampleText: 'ನಮಸ್ಕಾರ! ಟೆಕ್ಸ್ಟ್ ಟು ಸ್ಪೀಚ್ ಅಪ್ಲಿಕೇಶನ್‌ಗೆ ಸುಸ್ವಾಗತ.',
  },
  {
    id: 'kn-in-male-vijay',
    name: 'Male Voice',
    language: 'Kannada',
    langCode: 'kn-IN',
    gender: 'Male',
    accent: 'Standard Kannada',
    style: 'Confident & Natural',
    description: 'ಆಕರ್ಷಕ ಮತ್ತು ದೃಢ ಕನ್ನಡ ಪುರುಷ ಧ್ವನಿ.',
    sampleText: 'ನಮಸ್ಕಾರ, ನಿಮ್ಮ ಪಠ್ಯವು ಶ್ರವ್ಯ ರೂಪಕ್ಕೆ ಸಿದ್ಧವಾಗಿದೆ.',
  },

  // Malayalam (ml-IN)
  {
    id: 'ml-in-female-anu',
    name: 'Female Voice',
    language: 'Malayalam',
    langCode: 'ml-IN',
    gender: 'Female',
    accent: 'Standard Malayalam',
    style: 'Gentle & Melodious',
    description: 'വ്യക്തവും സ്വാഭാവികവുമായ മലയാളം സ്ത്രീ ശബ്ദം.',
    sampleText: 'നമസ്കാരം! ടെക്സ്റ്റ് ടു സ്പീച്ച് ആപ്ലിക്കേഷനിലേക്ക് സ്വാഗതം.',
  },
  {
    id: 'ml-in-male-rahul',
    name: 'Male Voice',
    language: 'Malayalam',
    langCode: 'ml-IN',
    gender: 'Male',
    accent: 'Standard Malayalam',
    style: 'Smooth & Articulate',
    description: 'ആത്മവിശ്വാസമുള്ള മലയാളം പുരുഷ ശബ്ദം.',
    sampleText: 'നിങ്ങളുടെ ടെക്സ്റ്റ് ഇപ്പോൾ ഓഡിയോ രൂപത്തിൽ പ്ലേ ചെയ്യാം.',
  },

  // Punjabi (pa-IN)
  {
    id: 'pa-in-female-simran',
    name: 'Female Voice',
    language: 'Punjabi',
    langCode: 'pa-IN',
    gender: 'Female',
    accent: 'Standard Punjabi',
    style: 'Bright & Cheerful',
    description: 'ਸਪੱਸ਼ਟ ਅਤੇ ਮਿੱਠੀ ਪੰਜਾਬੀ ਆਵਾਜ਼।',
    sampleText: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਟੈਕਸਟ ਟੂ ਸਪੀਚ ਐਪਲੀਕੇਸ਼ਨ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ।',
  },
  {
    id: 'pa-in-male-harpreet',
    name: 'Male Voice',
    language: 'Punjabi',
    langCode: 'pa-IN',
    gender: 'Male',
    accent: 'Standard Punjabi',
    style: 'Energetic & Strong',
    description: 'ਬੁਲੰਦ ਅਤੇ ਪ੍ਰਭਾਵਸ਼ਾਲੀ ਪੰਜਾਬੀ ਆਵਾਜ਼।',
    sampleText: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਜੀ, ਤੁਹਾਡੀ ਆਵਾਜ਼ ਫਾਈਲ ਤਿਆਰ ਹੈ।',
  },

  // English (US)
  {
    id: 'en-us-female-1',
    name: 'Female Voice',
    language: 'English (United States)',
    langCode: 'en-US',
    gender: 'Female',
    accent: 'American',
    style: 'Natural & Warm',
    description: 'Clear, modern American female voice ideal for articles and narrations.',
    sampleText: 'Welcome to the speech studio. How can I assist your reading today?',
  },
  {
    id: 'en-us-male-1',
    name: 'Male Voice',
    language: 'English (United States)',
    langCode: 'en-US',
    gender: 'Male',
    accent: 'American',
    style: 'Deep & Authoritative',
    description: 'Professional baritone American voice well-suited for tutorials and podcasts.',
    sampleText: 'Welcome to the application. Your spoken audio is ready to listen.',
  },

  // English (UK)
  {
    id: 'en-gb-female-1',
    name: 'Female Voice',
    language: 'English (United Kingdom)',
    langCode: 'en-GB',
    gender: 'Female',
    accent: 'British',
    style: 'Refined & Polished',
    description: 'Crisp British accent with sophisticated delivery.',
    sampleText: 'Good day! Converting your written documents into speech is effortless.',
  },
  {
    id: 'en-gb-male-1',
    name: 'Male Voice',
    language: 'English (United Kingdom)',
    langCode: 'en-GB',
    gender: 'Male',
    accent: 'British',
    style: 'Warm & Professional',
    description: 'Classic British broadcast voice with excellent articulation.',
    sampleText: 'Hello there. Please enjoy this spoken rendition of your text.',
  },

  // Spanish
  {
    id: 'es-es-female-1',
    name: 'Female Voice',
    language: 'Spanish',
    langCode: 'es-ES',
    gender: 'Female',
    accent: 'Castilian',
    style: 'Vibrant & Natural',
    description: 'Voz femenina en español clara, dinámica y expresiva.',
    sampleText: '¡Hola! Bienvenido a la aplicación de texto a voz.',
  },
  {
    id: 'es-es-male-1',
    name: 'Male Voice',
    language: 'Spanish',
    langCode: 'es-ES',
    gender: 'Male',
    accent: 'Castilian',
    style: 'Deep & Conversational',
    description: 'Voz masculina agradable y profesional.',
    sampleText: 'Hola, tu audio en español ha sido generado con éxito.',
  },

  // French
  {
    id: 'fr-fr-female-1',
    name: 'Female Voice',
    language: 'French',
    langCode: 'fr-FR',
    gender: 'Female',
    accent: 'Parisian',
    style: 'Elegant & Fluent',
    description: 'Voix française douce, idéale pour la lecture.',
    sampleText: 'Bonjour! Bienvenue dans l’application de synthèse vocale.',
  },
  {
    id: 'fr-fr-male-1',
    name: 'Male Voice',
    language: 'French',
    langCode: 'fr-FR',
    gender: 'Male',
    accent: 'Parisian',
    style: 'Neutral & Articulate',
    description: 'Voix masculine claire et équilibrée.',
    sampleText: 'Bonjour à tous, votre document est prêt à être écouté.',
  },

  // German
  {
    id: 'de-de-female-1',
    name: 'Female Voice',
    language: 'German',
    langCode: 'de-DE',
    gender: 'Female',
    accent: 'Standard German',
    style: 'Crisp & Modern',
    description: 'Klare und angenehme deutsche Frauenstimme.',
    sampleText: 'Guten Tag! Willkommen bei der Text-zu-Sprache-Anwendung.',
  },
  {
    id: 'de-de-male-1',
    name: 'Male Voice',
    language: 'German',
    langCode: 'de-DE',
    gender: 'Male',
    accent: 'Standard German',
    style: 'Professional & Calm',
    description: 'Präzise deutsche Männerstimme für Vorträge.',
    sampleText: 'Hallo, Ihr Text wurde erfolgreich umgewandelt.',
  },

  // Japanese
  {
    id: 'ja-jp-female-1',
    name: 'Female Voice',
    language: 'Japanese',
    langCode: 'ja-JP',
    gender: 'Female',
    accent: 'Tokyo',
    style: 'Gentle & Polite',
    description: '明るく丁寧な日本語の女性音声です。',
    sampleText: 'こんにちは！音声合成アプリケーションへようこそ。',
  },
  {
    id: 'ja-jp-male-1',
    name: 'Male Voice',
    language: 'Japanese',
    langCode: 'ja-JP',
    gender: 'Male',
    accent: 'Tokyo',
    style: 'Calm & Steady',
    description: '落ち着いたトーンの男性音声です。',
    sampleText: 'こんにちは。入力されたテキストの読み上げを開始します。',
  },
];

// Language mapping to TTS engine code
function getEngineLangCode(langCode: string): string {
  const map: Record<string, string> = {
    'en': 'en',
    'en-US': 'en',
    'en-GB': 'en-GB',
    'en-IN': 'en',
    'hi-IN': 'hi',
    'gu-IN': 'gu',
    'mr-IN': 'mr',
    'bn-IN': 'bn',
    'ta-IN': 'ta',
    'te-IN': 'te',
    'kn-IN': 'kn',
    'ml-IN': 'ml',
    'pa-IN': 'pa',
    'es-ES': 'es',
    'fr-FR': 'fr',
    'de-DE': 'de',
    'ja-JP': 'ja',
  };
  return map[langCode] || 'en';
}

// Split text into chunks <= 160 chars without cutting words
function splitIntoChunks(text: string, maxLen = 150): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return [trimmed];

  const chunks: string[] = [];
  const sentences = trimmed.split(/(?<=[.?!,\n\r;।॥])/);
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLen) {
      currentChunk += sentence;
    } else {
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
      }
      if (sentence.length <= maxLen) {
        currentChunk = sentence;
      } else {
        const words = sentence.split(/\s+/);
        currentChunk = '';
        for (const word of words) {
          if ((currentChunk + ' ' + word).trim().length <= maxLen) {
            currentChunk = (currentChunk + ' ' + word).trim();
          } else {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = word;
          }
        }
      }
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [trimmed.slice(0, maxLen)];
}

// Fetch single audio chunk from Google TTS
function fetchTTSChunk(text: string, lang: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(text);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encoded}`;

    const req = https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://translate.google.com/',
        },
        timeout: 9000,
      },
      (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`TTS Service returned HTTP ${res.statusCode}`));
          return;
        }
        const data: Buffer[] = [];
        res.on('data', (chunk) => data.push(chunk));
        res.on('end', () => resolve(Buffer.concat(data)));
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('TTS request timed out'));
    });
  });
}

// Fallback WAV audio synthesizer
function generateFallbackWav(durationSeconds = 3): Buffer {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Soft speech-like resonance
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const baseFreq = 200 + 15 * Math.sin(2 * Math.PI * 2 * t);
    const envelope = Math.min(1, Math.max(0, Math.sin((Math.PI * t) / durationSeconds)));
    const sample =
      (0.5 * Math.sin(2 * Math.PI * baseFreq * t) +
        0.28 * Math.sin(2 * Math.PI * baseFreq * 2 * t) +
        0.12 * Math.sin(2 * Math.PI * baseFreq * 3 * t)) *
      envelope;
    const intSample = Math.floor(sample * 16000);
    buffer.writeInt16LE(Math.max(-32768, Math.min(32767, intSample)), 44 + i * 2);
  }

  return buffer;
}

// Map language, gender, accent, and male tone to authentic human neural voice models
export function resolveNeuralVoice(
  langCode: string,
  gender: 'Male' | 'Female',
  accent?: string,
  maleTone?: string
): string {
  const normLang = (langCode || 'en').toLowerCase();
  const isMale = gender === 'Male';
  const acc = (accent || '').toLowerCase();

  // English
  if (normLang === 'en' || normLang.startsWith('en-')) {
    if (isMale) {
      if (acc.includes('gb') || acc.includes('uk')) {
        return 'en-GB-ThomasNeural'; // Rich deep UK baritone
      }
      if (acc.includes('in')) {
        return 'en-IN-PrabhatNeural';
      }
      if (acc.includes('au')) {
        return 'en-AU-WilliamNeural';
      }
      if (acc.includes('ca')) {
        return 'en-CA-LiamNeural';
      }
      // US Male: Deep broadcast voice is the one and only voice
      return 'en-US-ChristopherNeural';
    } else {
      // Female English
      if (acc.includes('gb') || acc.includes('uk')) {
        return 'en-GB-SoniaNeural';
      }
      if (acc.includes('in')) {
        return 'en-IN-NeerjaNeural';
      }
      if (acc.includes('au')) {
        return 'en-AU-NatashaNeural';
      }
      if (acc.includes('ca')) {
        return 'en-CA-ClaraNeural';
      }
      return 'en-US-JennyNeural'; // Natural, warm soprano
    }
  }

  // Hindi
  if (normLang.startsWith('hi')) {
    return isMale ? 'hi-IN-MadhurNeural' : 'hi-IN-SwaraNeural';
  }

  // Gujarati
  if (normLang.startsWith('gu')) {
    return isMale ? 'gu-IN-NiranjanNeural' : 'gu-IN-DhwaniNeural';
  }

  // Marathi
  if (normLang.startsWith('mr')) {
    return isMale ? 'mr-IN-ManoharNeural' : 'mr-IN-AarohiNeural';
  }

  // Bengali
  if (normLang.startsWith('bn')) {
    return isMale ? 'bn-IN-BashkarNeural' : 'bn-IN-TanishaaNeural';
  }

  // Tamil
  if (normLang.startsWith('ta')) {
    return isMale ? 'ta-IN-ValluvarNeural' : 'ta-IN-PallaviNeural';
  }

  // Telugu
  if (normLang.startsWith('te')) {
    return isMale ? 'te-IN-MohanNeural' : 'te-IN-ShrutiNeural';
  }

  // Kannada
  if (normLang.startsWith('kn')) {
    return isMale ? 'kn-IN-GaganNeural' : 'kn-IN-SapnaNeural';
  }

  // Malayalam
  if (normLang.startsWith('ml')) {
    return isMale ? 'ml-IN-MidhunNeural' : 'ml-IN-SobhanaNeural';
  }

  // Spanish
  if (normLang.startsWith('es')) {
    if (acc.includes('us') || acc.includes('mx')) {
      return isMale ? 'es-MX-JorgeNeural' : 'es-MX-DaliaNeural';
    }
    return isMale ? 'es-ES-AlvaroNeural' : 'es-ES-ElviraNeural';
  }

  // French
  if (normLang.startsWith('fr')) {
    if (acc.includes('ca')) {
      return isMale ? 'fr-CA-AntoineNeural' : 'fr-CA-SylvieNeural';
    }
    return isMale ? 'fr-FR-HenriNeural' : 'fr-FR-DeniseNeural';
  }

  // German
  if (normLang.startsWith('de')) {
    return isMale ? 'de-DE-FlorianMultilingualNeural' : 'de-DE-KatjaNeural';
  }

  // Japanese
  if (normLang.startsWith('ja')) {
    return isMale ? 'ja-JP-KeitaNeural' : 'ja-JP-NanamiNeural';
  }

  // Fallback default
  return isMale ? 'en-US-ChristopherNeural' : 'en-US-JennyNeural';
}

// Split text into readable chunks for neural TTS synthesis without breaking sentences
function splitTextIntoNeuralChunks(text: string, maxChunkLen = 2200): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= maxChunkLen) return [trimmed];

  const chunks: string[] = [];
  const sentences = trimmed.split(/(?<=[.\n\r?!।॥;])/);
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxChunkLen) {
      currentChunk += sentence;
    } else {
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
      }
      if (sentence.length <= maxChunkLen) {
        currentChunk = sentence;
      } else {
        const words = sentence.split(/\s+/);
        currentChunk = '';
        for (const word of words) {
          if ((currentChunk + ' ' + word).trim().length <= maxChunkLen) {
            currentChunk = (currentChunk + ' ' + word).trim();
          } else {
            if (currentChunk.trim()) chunks.push(currentChunk.trim());
            currentChunk = word;
          }
        }
      }
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [trimmed];
}

// Synthesize a single chunk with Microsoft Edge Neural TTS
async function generateSingleEdgeTTSChunk(
  text: string,
  neuralVoice: string,
  userSpeed: number = 1.0,
  userPitch: number = 1.0,
  destPath: string
): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(neuralVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

      const speedVal = typeof userSpeed === 'number' && !isNaN(userSpeed) && userSpeed > 0 ? userSpeed : 1.0;
      const pitchVal = typeof userPitch === 'number' && !isNaN(userPitch) && userPitch > 0 ? userPitch : 1.0;

      const speedPercent = Math.max(-50, Math.min(100, Math.round((speedVal - 1.0) * 100)));
      const rateStr = speedPercent >= 0 ? `+${speedPercent}%` : `${speedPercent}%`;

      const pitchOffset = Math.max(-50, Math.min(50, Math.round((pitchVal - 1.0) * 40)));
      const pitchStr = pitchOffset >= 0 ? `+${pitchOffset}Hz` : `${pitchOffset}Hz`;

      const safeText = xmlEscape(text);
      const { audioStream } = tts.toStream(safeText, {
        rate: rateStr,
        pitch: pitchStr,
      });

      const writeStream = fs.createWriteStream(destPath);
      let bytesReceived = 0;

      audioStream.on('data', (chunk: Buffer) => {
        bytesReceived += chunk.length;
      });

      audioStream.pipe(writeStream);

      const timeoutMs = Math.max(20000, Math.min(120000, text.length * 40));
      const timer = setTimeout(() => {
        try { writeStream.end(); } catch {}
        if (bytesReceived > 400 && fs.existsSync(destPath)) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, timeoutMs);

      writeStream.on('finish', () => {
        clearTimeout(timer);
        if (bytesReceived > 400 && fs.existsSync(destPath) && fs.statSync(destPath).size > 400) {
          resolve(true);
        } else {
          resolve(false);
        }
      });

      audioStream.on('error', (err: any) => {
        clearTimeout(timer);
        console.warn('Edge TTS stream error:', err?.message || err);
        resolve(false);
      });

      writeStream.on('error', (err: any) => {
        clearTimeout(timer);
        console.warn('Edge TTS write error:', err?.message || err);
        resolve(false);
      });
    } catch (err: any) {
      console.warn('Edge TTS setup failure:', err?.message || err);
      resolve(false);
    }
  });
}

// High-fidelity neural speech synthesis using Microsoft Edge Neural TTS with multi-chunk support up to 100,000 characters
async function generateSpeechWithEdgeTTS(
  text: string,
  neuralVoice: string,
  userSpeed: number = 1.0,
  userPitch: number = 1.0,
  destPath: string
): Promise<boolean> {
  const trimmed = text.trim();
  if (!trimmed) return false;

  // If text is short, generate in a single pass
  if (trimmed.length <= 2500) {
    return generateSingleEdgeTTSChunk(trimmed, neuralVoice, userSpeed, userPitch, destPath);
  }

  // Multi-chunk synthesis for long documents up to 100,000 characters
  const chunks = splitTextIntoNeuralChunks(trimmed, 2200);
  const tempFiles: string[] = [];

  try {
    for (let i = 0; i < chunks.length; i++) {
      const chunkPath = path.join(
        AUDIO_DIR,
        `temp_edge_${Date.now()}_${i}_${Math.random().toString(36).slice(2)}.mp3`
      );
      const ok = await generateSingleEdgeTTSChunk(chunks[i], neuralVoice, userSpeed, userPitch, chunkPath);
      if (!ok || !fs.existsSync(chunkPath) || fs.statSync(chunkPath).size < 300) {
        throw new Error(`Failed to synthesize chunk ${i + 1} of ${chunks.length}`);
      }
      tempFiles.push(chunkPath);
    }

    // Concatenate all synthesized MP3 chunks into destination file
    const outStream = fs.createWriteStream(destPath);
    for (const chunkFile of tempFiles) {
      const buf = fs.readFileSync(chunkFile);
      outStream.write(buf);
    }
    outStream.end();

    await new Promise<void>((resolve) => outStream.on('finish', () => resolve()));

    return fs.existsSync(destPath) && fs.statSync(destPath).size > 500;
  } catch (err: any) {
    console.warn('Edge TTS multi-chunk error:', err?.message || err);
    return false;
  } finally {
    for (const file of tempFiles) {
      try {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      } catch {}
    }
  }
}

async function transformAudioWithVoice(
  rawPath: string,
  destPath: string,
  voice: Voice | null | undefined,
  userSpeed: number = 1.0,
  userPitch: number = 1.0,
  maleTone?: string
): Promise<void> {
  let basePitch = 1.0;
  let baseTempo = 1.0;
  let eqFilter = '';

  const isMale = voice ? voice.gender === 'Male' : false;
  const toneLower = (maleTone || (voice?.style || '')).toLowerCase();

  if (isMale) {
    if (toneLower.includes('deep') || toneLower.includes('resonant')) {
      basePitch = 0.88;
      baseTempo = 0.98;
      eqFilter = 'equalizer=f=160:t=q:w=1.0:g=4';
    } else if (toneLower.includes('crisp') || toneLower.includes('clear')) {
      basePitch = 0.94;
      baseTempo = 1.0;
      eqFilter = 'equalizer=f=2800:t=q:w=1.0:g=2.5';
    } else {
      basePitch = 0.91;
      baseTempo = 1.0;
      eqFilter = 'equalizer=f=220:t=q:w=1.0:g=3';
    }
  } else {
    basePitch = 1.02;
    baseTempo = 1.0;
  }

  const cleanPitch = typeof userPitch === 'number' && !isNaN(userPitch) && userPitch > 0 ? userPitch : 1.0;
  const cleanSpeed = typeof userSpeed === 'number' && !isNaN(userSpeed) && userSpeed > 0 ? userSpeed : 1.0;

  const effectivePitch = Math.max(0.6, Math.min(1.8, basePitch * cleanPitch));
  const effectiveTempo = Math.max(0.5, Math.min(2.0, baseTempo * cleanSpeed));

  const filterStandard = `rubberband=pitch=${effectivePitch.toFixed(3)}:tempo=${effectiveTempo.toFixed(3)}${eqFilter ? ',' + eqFilter : ''}`;

  try {
    const cmd = `ffmpeg -y -i "${rawPath}" -af "${filterStandard}" "${destPath}"`;
    await execPromise(cmd);
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 100) {
      if (fs.existsSync(rawPath)) {
        try { fs.unlinkSync(rawPath); } catch {}
      }
      return;
    }
  } catch (fallbackErr: any) {
    console.warn('ffmpeg fallback warning:', fallbackErr?.message);
    if (fs.existsSync(rawPath) && !fs.existsSync(destPath)) {
      fs.copyFileSync(rawPath, destPath);
      try { fs.unlinkSync(rawPath); } catch {}
    }
  }
}

export const ttsService = {
  getLanguages(): Language[] {
    return LANGUAGES;
  },

  getVoices(langCode?: string): Voice[] {
    if (!langCode) return VOICES;
    const lower = langCode.toLowerCase();
    if (lower === 'en' || lower === 'en-global') {
      return VOICES.filter((v) => v.langCode === 'en');
    }
    return VOICES.filter((v) => v.langCode.toLowerCase() === lower);
  },

  findVoiceById(voiceId: string): Voice | undefined {
    const direct = VOICES.find((v) => v.id.toLowerCase() === voiceId.toLowerCase());
    if (direct) return direct;
    if (voiceId.startsWith('en')) {
      return voiceId.includes('male') && !voiceId.includes('female')
        ? VOICES.find((v) => v.id === 'en-male-1')
        : VOICES.find((v) => v.id === 'en-female-1');
    }
    return undefined;
  },

  async synthesizeSpeech({
    text,
    language,
    voiceId,
    voice: voiceParam,
    speed = 1.0,
    pitch = 1.0,
    accent,
    tone,
  }: {
    text: string;
    language: string;
    voiceId?: string;
    voice?: string;
    speed?: number;
    pitch?: number;
    accent?: string;
    tone?: string;
  }): Promise<{
    id: string;
    audioUrl: string;
    filePath: string;
    durationEstimate: number;
    wordCount: number;
    charCount: number;
  }> {
    const cleanText = text.trim();
    if (!cleanText) {
      throw new Error('Text must not be empty.');
    }
    if (cleanText.length > 100000) {
      throw new Error('Text exceeds maximum limit of 100,000 characters.');
    }

    const resolvedVoiceId = voiceId || voiceParam;
    const voice = resolvedVoiceId ? this.findVoiceById(resolvedVoiceId) : null;
    const targetLang = voice ? voice.langCode : language;
    const isMale = voice ? voice.gender === 'Male' : (tone ? true : false);

    const words = cleanText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = cleanText.length;
    const durationEstimate = Math.max(1.5, Math.round((wordCount / (2.4 * Math.max(0.5, speed))) * 10) / 10);

    const fileId = crypto.randomBytes(12).toString('hex');
    const finalFilename = `speech_${fileId}.mp3`;
    const destPath = path.join(AUDIO_DIR, finalFilename);

    // 1. First priority: High-fidelity Microsoft Edge Neural TTS with genuine male/female voice models
    const neuralVoiceName = resolveNeuralVoice(targetLang, isMale ? 'Male' : 'Female', accent, tone);
    const edgeSuccess = await generateSpeechWithEdgeTTS(cleanText, neuralVoiceName, speed, pitch, destPath);

    if (edgeSuccess && fs.existsSync(destPath) && fs.statSync(destPath).size > 500) {
      return {
        id: fileId,
        audioUrl: `/audio/${finalFilename}`,
        filePath: destPath,
        durationEstimate,
        wordCount,
        charCount,
      };
    }

    // 2. Fallback to Google TTS chunking if Edge TTS is unavailable
    const engineCode = (accent && accent.trim()) || getEngineLangCode(targetLang);
    const rawFilename = `raw_${fileId}.mp3`;
    const rawPath = path.join(AUDIO_DIR, rawFilename);

    try {
      const chunks = splitIntoChunks(cleanText, 140);
      const audioBuffers: Buffer[] = [];

      for (const chunk of chunks) {
        if (!chunk) continue;
        const buf = await fetchTTSChunk(chunk, engineCode);
        audioBuffers.push(buf);
      }

      const combinedAudio = Buffer.concat(audioBuffers);
      fs.writeFileSync(rawPath, combinedAudio);

      await transformAudioWithVoice(rawPath, destPath, voice, speed, pitch, tone);

      return {
        id: fileId,
        audioUrl: `/audio/${finalFilename}`,
        filePath: destPath,
        durationEstimate,
        wordCount,
        charCount,
      };
    } catch (error) {
      console.warn('External TTS request fallback:', error);
      const wavFilename = `speech_${fileId}.wav`;
      const wavPath = path.join(AUDIO_DIR, wavFilename);
      const fallbackBuffer = generateFallbackWav(durationEstimate);
      fs.writeFileSync(wavPath, fallbackBuffer);

      return {
        id: fileId,
        audioUrl: `/audio/${wavFilename}`,
        filePath: wavPath,
        durationEstimate,
        wordCount,
        charCount,
      };
    }
  },

  async getOrCreateVoiceSample(voiceId: string, accent?: string, tone?: string): Promise<string> {
    const voice = this.findVoiceById(voiceId);
    if (!voice) {
      throw new Error(`Voice with id "${voiceId}" not found.`);
    }

    const safeAccent = accent ? accent.replace(/[^a-zA-Z0-9_-]/g, '') : '';
    const safeTone = tone ? tone.replace(/[^a-zA-Z0-9_-]/g, '') : '';
    const suffixParts: string[] = [];
    if (safeAccent) suffixParts.push(safeAccent);
    if (safeTone) suffixParts.push(safeTone);
    const suffix = suffixParts.length > 0 ? `_${suffixParts.join('_')}` : '';

    const sampleFilename = `sample_${voice.id}${suffix}.mp3`;
    const samplePath = path.join(SAMPLES_DIR, sampleFilename);

    if (fs.existsSync(samplePath) && fs.statSync(samplePath).size > 1000) {
      return `/audio/samples/${sampleFilename}`;
    }

    // Generate sample with genuine neural voice
    const neuralVoiceName = resolveNeuralVoice(voice.langCode, voice.gender, accent, tone);
    const success = await generateSpeechWithEdgeTTS(voice.sampleText, neuralVoiceName, 1.0, 1.0, samplePath);

    if (success && fs.existsSync(samplePath) && fs.statSync(samplePath).size > 1000) {
      return `/audio/samples/${sampleFilename}`;
    }

    // Fallback if needed
    const engineCode = safeAccent || getEngineLangCode(voice.langCode);
    const rawSamplePath = path.join(SAMPLES_DIR, `raw_sample_${voice.id}${suffix}.mp3`);

    try {
      const buf = await fetchTTSChunk(voice.sampleText, engineCode);
      fs.writeFileSync(rawSamplePath, buf);
      await transformAudioWithVoice(rawSamplePath, samplePath, voice, 1.0, 1.0, tone);
      return `/audio/samples/${sampleFilename}`;
    } catch (err) {
      console.warn(`Could not fetch live TTS for sample ${voice.id}, using fallback source:`, err);
      const dummyBuf = generateFallbackWav(3);
      fs.writeFileSync(samplePath, dummyBuf);
      return `/audio/samples/${sampleFilename}`;
    }
  },

  async initSeedAudio() {
    const sampleEnPath = path.join(AUDIO_DIR, 'sample-en.mp3');
    const sampleHiPath = path.join(AUDIO_DIR, 'sample-hi.mp3');
    const sampleMrPath = path.join(AUDIO_DIR, 'sample-mr.mp3');

    // Generate crisp neural baseline samples
    if (!fs.existsSync(sampleEnPath) || fs.statSync(sampleEnPath).size < 1000) {
      await generateSpeechWithEdgeTTS(
        'Welcome to the Text-to-Speech studio. Listen to realistic human voices in multiple languages.',
        'en-US-JennyNeural',
        1.0,
        1.0,
        sampleEnPath
      );
    }

    if (!fs.existsSync(sampleHiPath) || fs.statSync(sampleHiPath).size < 1000) {
      await generateSpeechWithEdgeTTS(
        'नमस्ते! टेक्स्ट टू स्पीच पोर्टल में आपका हार्दिक स्वागत है।',
        'hi-IN-SwaraNeural',
        1.0,
        1.0,
        sampleHiPath
      );
    }

    if (!fs.existsSync(sampleMrPath) || fs.statSync(sampleMrPath).size < 1000) {
      await generateSpeechWithEdgeTTS(
        'नमस्कार! टेक्स्ट टू स्पीच ॲप्लिकेशनमध्ये आपले स्वागत आहे.',
        'mr-IN-AarohiNeural',
        1.0,
        1.0,
        sampleMrPath
      );
    }

    // Pre-generate male & female English samples
    try {
      await this.getOrCreateVoiceSample('en-male-1', 'en-US', 'warm');
      await this.getOrCreateVoiceSample('en-male-1', 'en-US', 'deep');
      await this.getOrCreateVoiceSample('en-male-1', 'en-US', 'crisp');
      await this.getOrCreateVoiceSample('en-female-1', 'en-US');
    } catch (e) {
      // Non-blocking
    }
  },
};

ttsService.initSeedAudio().catch((err) => console.log('Seed audio notice:', err?.message));
