import React, { useRef, useState } from 'react';
import { Trash2, Upload, Sparkles, FileText } from 'lucide-react';
import { api } from '../services/api';

interface TextInputProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  maxChars?: number;
  selectedLanguage: string;
  onError: (msg: string) => void;
}

const SAMPLE_TEXTS: Record<string, string> = {
  'hi-IN': 'नमस्ते! वाणी टेक्स्ट टू स्पीच पोर्टल में आपका हार्दिक स्वागत है। यह प्रणाली किसी भी लिखे हुए पाठ को अत्यंत स्पष्ट, स्वाभाविक और मधुर आवाज़ में बदल सकती है। आप इसे सीधे सुन सकते हैं और ऑडियो फ़ाइल डाउनलोड भी कर सकते हैं।',
  'en-IN': 'Hello and welcome to the Indian Text-to-Speech studio. You can enter or paste any news article, book excerpt, or study material here to hear it read out in clear, natural Indian English speech.',
  'gu-IN': 'નમસ્તે! ટેક્સ્ટ ટુ સ્પીચ એપ્લિકેશનમાં આપનું હાર્દિક સ્વાગત છે. તમે કોઈપણ લખાણ અહીં ટાઇપ કરીને તેને સુંદર અને સ્પષ્ટ ગુજરાતી અવાજમાં સાંભળી શકો છો તેમજ ઓડિયો ડાઉનલોડ કરી શકો છો.',
  'mr-IN': 'नमस्कार! वाणी टेक्स्ट टू स्पीच प्रणालीमध्ये आपले सहर्ष स्वागत आहे. आपण लिहिलेला कोणताही मजकूर सहजपणे सुंदर, अस्खलित आणि स्पष्ट आवाजात रूपांतरित करा.',
  'bn-IN': 'নমস্কার! টেক্সট টু স্পিচ অ্যাপ্লিকেশনে আপনাকে স্বাগত জানাই। আপনার লেখা যে কোনো পাঠ্যকে নিমেষেই সুস্পষ্ট ও প্রাকৃতিক বাংলা কণ্ঠে রূপান্তর করুন।',
  'ta-IN': 'வணக்கம்! உரை ஒலி மாற்றி செயலಿಗೆ உங்களை அன்புடன் வரவேற்கிறோம். நீங்கள் வழங்கும் உரையை தெளிவான மற்றும் இனிமையான குரலில் கேட்டு மகிழுங்கள்.',
  'te-IN': 'నమస్కారం! టెక్స్ట్ టు స్పీచ్ అప్లికేషన్‌కు స్వాగతం. మీరు నమోదు చేసిన పాఠ్యాన్ని స్పష్టమైన మరియు సహజమైన తెలుగు స్వరంలో వినవచ్చు.',
  'kn-IN': 'ನಮಸ್ಕಾರ! ಟೆಕ್ಸ್ಟ್ ಟು ಸ್ಪೀಚ್ ಅಪ್ಲಿಕೇಶನ್‌ಗೆ ಸುಸ್ವಾಗತ. ನೀವು ಬರೆದ ಯಾವುದೇ ಲೇಖನವನ್ನು ಸುಂದರ ಮತ್ತು ಸ್ಪಷ್ಟ ಕನ್ನಡ ಧ್ವನಿಯಲ್ಲಿ ಆಲಿಸಿ.',
  'ml-IN': 'നമസ്കാരം! ടെക്സ്റ്റ് ടു സ്പീച്ച് ആപ്ലിക്കേഷനിലേക്ക് സ്വാഗതം. നിങ്ങൾ നൽകുന്ന ഏത് വാചകവും സ്വാഭാവികമായ മലയാളം ശബ്ദത്തിൽ കേൾക്കൂ.',
  'pa-IN': 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਟੈਕਸਟ ਟੂ ਸਪੀਚ ਐਪਲੀਕੇਸ਼ਨ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਲਿਖਤ ਨੂੰ ਸਪੱਸ਼ਟ ਪੰਜਾਬੀ ਬੋਲੀ ਵਿੱਚ ਸੁਣ ਅਤੇ ਡਾਊਨਲੋਡ ਕਰ ਸਕਦੇ ਹੋ।',
  'en-US': 'Welcome to the text-to-speech studio. Convert your written text into lifelike natural speech across dozens of voices with complete speed and volume controls.',
  'en-GB': 'Good day! Welcome to our speech studio. It seamlessly transforms written documents into crisp British vocal narration with pristine clarity.',
  'es-ES': '¡Hola! Bienvenido a la plataforma de texto a voz. Convierte cualquier texto en audio fluido y natural al instante.',
  'fr-FR': 'Bonjour et bienvenue dans notre application de synthèse vocale. Transformez vos textes écrits en voix naturelle.',
  'de-DE': 'Guten Tag! Willkommen bei der Text-zu-Sprache-Anwendung. Konvertieren Sie geschriebene Texte im Handumdrehen in natürliche Sprachausgabe.',
  'ja-JP': 'こんにちは！音声合成アプリケーションへようこそ。入力されたテキストを自然な音声に変換し、ブラウザで再生またはダウンロードできます。',
};

export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  onClear,
  maxChars = 2000,
  selectedLanguage,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [enhancing, setEnhancing] = useState(false);
  const [enhanceAction, setEnhanceAction] = useState<string | null>(null);

  const charCount = value.length;
  const words = value.trim().split(/\s+/).filter(Boolean);
  const wordCount = value.trim() ? words.length : 0;
  // Estimate ~140 words per minute => ~2.3 words/sec
  const estimatedSeconds = Math.round(wordCount / 2.3);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      onError('Please select a plain text document (.txt).');
      return;
    }

    if (file.size > 500 * 1024) {
      onError('File exceeds 500 KB limit. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onChange(content.slice(0, maxChars));
      }
    };
    reader.onerror = () => {
      onError('Unable to read selected text file.');
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadSample = () => {
    const sample = SAMPLE_TEXTS[selectedLanguage] || SAMPLE_TEXTS['hi-IN'] || SAMPLE_TEXTS['en-IN'];
    onChange(sample);
  };

  const handleAiEnhance = async (action: 'summarize' | 'grammar' | 'conversational') => {
    if (!value.trim()) {
      onError('Please type or paste some text first before applying AI enhancement.');
      return;
    }
    setEnhancing(true);
    setEnhanceAction(action);
    try {
      const res = await api.enhanceText(value, action);
      if (res?.enhancedText) {
        onChange(res.enhancedText.slice(0, maxChars));
      }
    } catch (err: any) {
      onError(err?.message || 'AI text enhancement failed.');
    } finally {
      setEnhancing(false);
      setEnhanceAction(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 transition-all">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <label htmlFor="text-input-field" className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>Input Text</span>
        </label>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="btn-load-sample-text"
            onClick={loadSample}
            className="text-xs px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg transition-colors border border-indigo-100"
            title="Load authentic sample phrase for current language"
          >
            Insert Sample Text
          </button>

          {/* Upload Text File */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt"
            className="hidden"
          />
          <button
            type="button"
            id="btn-upload-file"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
            title="Upload a .txt document"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>

          {/* Clear Text */}
          {value.length > 0 && (
            <button
              type="button"
              id="btn-clear-text"
              onClick={onClear}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors"
              title="Clear all text"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          id="text-input-field"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxChars}
          rows={6}
          placeholder="Type, paste, or upload text to synthesize natural voice output..."
          className="w-full px-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white resize-y transition-all outline-hidden leading-relaxed"
        />
      </div>

      {/* Footer Details & AI Tools */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="font-mono">
            Characters:{' '}
            <strong className={charCount > maxChars * 0.9 ? 'text-amber-600' : 'text-slate-800'}>
              {charCount}
            </strong>{' '}
            / {maxChars}
          </span>
          <span>
            Words: <strong className="text-slate-800">{wordCount}</strong>
          </span>
          {wordCount > 0 && (
            <span className="hidden md:inline">
              Estimated Duration:{' '}
              <strong className="text-indigo-700">
                {estimatedSeconds < 60
                  ? `${estimatedSeconds}s`
                  : `${Math.floor(estimatedSeconds / 60)}m ${estimatedSeconds % 60}s`}
              </strong>
            </span>
          )}
        </div>

        {/* AI Enhancement Tools */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            AI Polish:
          </span>
          <button
            type="button"
            id="btn-ai-grammar"
            onClick={() => handleAiEnhance('grammar')}
            disabled={enhancing || !value.trim()}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors disabled:opacity-40"
            title="Correct grammar and spelling automatically"
          >
            {enhancing && enhanceAction === 'grammar' ? 'Polishing...' : 'Correct Grammar'}
          </button>
          <button
            type="button"
            id="btn-ai-conversational"
            onClick={() => handleAiEnhance('conversational')}
            disabled={enhancing || !value.trim()}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors disabled:opacity-40"
            title="Make delivery conversational and smooth"
          >
            {enhancing && enhanceAction === 'conversational' ? 'Rewriting...' : 'Conversational Tone'}
          </button>
          <button
            type="button"
            id="btn-ai-summarize"
            onClick={() => handleAiEnhance('summarize')}
            disabled={enhancing || !value.trim()}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors disabled:opacity-40"
            title="Summarize key points for faster listening"
          >
            {enhancing && enhanceAction === 'summarize' ? 'Summarizing...' : 'Summarize'}
          </button>
        </div>
      </div>
    </div>
  );
};
