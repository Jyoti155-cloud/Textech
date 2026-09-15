import React, { useState } from 'react';
import { X, Code2, Check, Copy, Play, Database, Server, ShieldCheck } from 'lucide-react';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeEndpoint, setActiveEndpoint] = useState<'tts' | 'voices' | 'health' | 'auth'>('tts');
  const [copied, setCopied] = useState<string | null>(null);
  const [liveTestResult, setLiveTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRunLiveTest = async () => {
    setTesting(true);
    setLiveTestResult(null);
    try {
      let res;
      if (activeEndpoint === 'health') {
        res = await fetch('/api/health');
      } else if (activeEndpoint === 'voices') {
        res = await fetch('/api/voices?language=hi-IN');
      } else if (activeEndpoint === 'tts') {
        res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: 'नमस्ते! वाणी टेक्स्ट टू स्पीच पोर्टल में आपका हार्दिक स्वागत है।',
            language: 'hi-IN',
            voice: 'hi-in-female-sunita',
          }),
        });
      } else {
        res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'aarav@example.com',
            password: 'demo123',
          }),
        });
      }
      const data = await res.json();
      setLiveTestResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setLiveTestResult(JSON.stringify({ error: err?.message }, null, 2));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Backend REST API Documentation</h2>
              <p className="text-xs text-slate-500">
                Node.js + Express endpoints, request contracts & live Postman/cURL examples
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Endpoint Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 overflow-x-auto">
          {[
            { id: 'tts', method: 'POST', path: '/api/tts', label: 'Convert TTS' },
            { id: 'voices', method: 'GET', path: '/api/voices', label: 'List Voices' },
            { id: 'health', method: 'GET', path: '/api/health', label: 'Health Status' },
            { id: 'auth', method: 'POST', path: '/api/auth/login', label: 'Authentication' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveEndpoint(item.id as any);
                setLiveTestResult(null);
              }}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeEndpoint === item.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span
                className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                  item.method === 'POST' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {item.method}
              </span>
              <span>{item.path}</span>
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeEndpoint === 'tts' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-800">POST /api/tts</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
                  Content-Type: application/json
                </span>
              </div>
              <p className="text-slate-600 mb-3">
                Validates input text, verifies language/voice parameters, communicates with TTS synthesis engine, generates audio file, and stores into user's speech history if authenticated.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Sample Request JSON</span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(
                            {
                              text: 'Hello, welcome to the Text-to-Speech application.',
                              language: 'en-US',
                              voice: 'en-us-female-1',
                            },
                            null,
                            2
                          ),
                          'tts-req'
                        )
                      }
                      className="text-indigo-600 hover:text-indigo-800 text-[11px] flex items-center gap-1"
                    >
                      {copied === 'tts-req' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto">
{`{
  "text": "Hello, welcome to the Text-to-Speech application.",
  "language": "en-US",
  "voice": "en-us-female-1"
}`}
                  </pre>
                </div>

                <div>
                  <div className="font-semibold text-slate-700 mb-1">Response JSON (200 OK)</div>
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
{`{
  "success": true,
  "audioUrl": "/audio/speech_7a86b9f6307156d06716b44b.mp3",
  "id": "7a86b9f6307156d06716b44b",
  "duration": 2.4,
  "characterCount": 49,
  "wordCount": 6,
  "voice": "Emma",
  "language": "en-US",
  "format": "audio/mpeg"
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeEndpoint === 'voices' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-800">GET /api/voices?language=en-US</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
                  Response: JSON
                </span>
              </div>
              <p className="text-slate-600 mb-3">
                Returns the list of available TTS voices, genders, accents, and localized sample texts.
              </p>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
{`{
  "success": true,
  "count": 2,
  "voices": [
    {
      "id": "hi-in-female-sunita",
      "name": "Female Voice",
      "language": "Hindi",
      "langCode": "hi-IN",
      "gender": "Female",
      "accent": "Standard Hindi",
      "style": "Sweet & Melodious"
    },
    {
      "id": "hi-in-male-amit",
      "name": "Male Voice",
      "language": "Hindi",
      "langCode": "hi-IN",
      "gender": "Male",
      "accent": "Standard Hindi",
      "style": "Deep & Resonant"
    }
  ]
}`}
              </pre>
            </div>
          )}

          {activeEndpoint === 'health' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-800">GET /api/health</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
                  Status: 200 OK
                </span>
              </div>
              <p className="text-slate-600 mb-3">
                Server health monitoring endpoint verifying Node.js + Express uptime and voice service status.
              </p>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
{`{
  "status": "ok",
  "service": "Text-to-Speech REST API",
  "timestamp": "2026-09-14T21:20:10.925Z",
  "version": "1.0.0",
  "voicesAvailable": 32,
  "languagesSupported": 16
}`}
              </pre>
            </div>
          )}

          {activeEndpoint === 'auth' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-800">POST /api/auth/login</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
                  Bearer Authentication
                </span>
              </div>
              <p className="text-slate-600 mb-3">
                Authenticates user credentials and returns session token for saving speech history and favorites.
              </p>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
{`{
  "success": true,
  "token": "tts_tok_ae38cb6ee6387c02804c8b136f55cf9bc748092bf205043d",
  "user": {
    "id": "usr_aarav",
    "name": "Aarav Patel",
    "email": "aarav@example.com"
  }
}`}
              </pre>
            </div>
          )}

          {/* Live Tester Runner */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-indigo-600" />
                <span>Interactive Live API Request</span>
              </span>
              <button
                type="button"
                id="btn-run-live-test"
                onClick={handleRunLiveTest}
                disabled={testing}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {testing ? 'Sending Request...' : 'Send Live Request'}
              </button>
            </div>

            {liveTestResult && (
              <div className="mt-2">
                <div className="text-[11px] font-semibold text-slate-600 mb-1">Live Server Response:</div>
                <pre className="p-3 bg-slate-950 text-emerald-400 rounded-xl font-mono text-[11px] max-h-48 overflow-y-auto">
                  {liveTestResult}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
