import { Router, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { db } from '../services/dbService.js';
import { ttsService, VOICES, LANGUAGES } from '../services/ttsService.js';
import { geminiService, EnhancementAction } from '../services/geminiService.js';
import { optionalAuth, requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();
const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');

// 1. Health Check (Section 8 & 17)
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Text-to-Speech REST API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    voicesAvailable: VOICES.length,
    languagesSupported: LANGUAGES.length,
  });
});

// 2. Available Voices (Section 8)
router.get('/voices', (req, res) => {
  const language = req.query.language as string | undefined;
  const voices = ttsService.getVoices(language);
  res.status(200).json({
    success: true,
    count: voices.length,
    voices,
  });
});

// 2b. Voice Sample Preview Endpoint
router.get('/voices/:id/sample', async (req, res) => {
  try {
    const voiceId = req.params.id;
    const accent = typeof req.query.accent === 'string' ? req.query.accent : undefined;
    const tone = typeof req.query.tone === 'string' ? req.query.tone : undefined;

    const voice = ttsService.findVoiceById(voiceId);
    if (!voice) {
      return res.status(404).json({ success: false, message: 'Voice not found' });
    }

    const sampleUrl = await ttsService.getOrCreateVoiceSample(voiceId, accent, tone);
    const sampleFilePath = path.join(process.cwd(), 'public', sampleUrl);

    if (fs.existsSync(sampleFilePath)) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return res.sendFile(sampleFilePath);
    } else {
      return res.redirect(sampleUrl);
    }
  } catch (err: any) {
    console.error('Error serving voice sample:', err);
    res.status(500).json({
      success: false,
      message: err?.message || 'Failed to serve voice sample',
    });
  }
});

// 3. Available Languages
router.get('/languages', (req, res) => {
  res.status(200).json({
    success: true,
    count: LANGUAGES.length,
    languages: LANGUAGES,
  });
});

// 4. Convert Text to Speech (POST /api/tts - Section 8 & 13)
router.post('/tts', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { text, language, voice: voiceId, speed, pitch, accent, tone } = req.body;

    // Validation (Section 13)
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: Text field is required and must not be empty.',
      });
    }

    if (text.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: `Validation error: Text length (${text.trim().length}) exceeds maximum limit of 2000 characters.`,
      });
    }

    const selectedLanguage = language || 'en';
    const langExists = LANGUAGES.some((l) => l.code === selectedLanguage);
    if (!langExists && !voiceId) {
      return res.status(400).json({
        success: false,
        message: `Validation error: Unsupported language code '${selectedLanguage}'.`,
      });
    }

    if (voiceId) {
      const voiceExists = ttsService.findVoiceById(voiceId);
      if (!voiceExists) {
        return res.status(400).json({
          success: false,
          message: `Validation error: Voice '${voiceId}' not recognized.`,
        });
      }
    }

    // Synthesize speech via TTS service with distinct voice profile, speed, pitch, accent, and tone
    const synthResult = await ttsService.synthesizeSpeech({
      text,
      language: selectedLanguage,
      voiceId,
      speed: typeof speed === 'number' ? speed : 1.0,
      pitch: typeof pitch === 'number' ? pitch : 1.0,
      accent: typeof accent === 'string' ? accent : undefined,
      tone: typeof tone === 'string' ? tone : undefined,
    });

    const voice = voiceId ? ttsService.findVoiceById(voiceId) : null;
    const voiceName = voice ? voice.name : 'Standard';

    // If user is logged in, automatically record in their speech history!
    let historyRecord = null;
    if (req.user) {
      historyRecord = db.addHistory({
        userId: req.user.id,
        text: text.trim(),
        language: selectedLanguage,
        voice: voiceId || 'en-us-female-1',
        audioUrl: synthResult.audioUrl,
        characterCount: synthResult.charCount,
        wordCount: synthResult.wordCount,
        duration: synthResult.durationEstimate,
        isFavorite: false,
      });
    }

    // Response matching Section 8
    res.status(200).json({
      success: true,
      audioUrl: synthResult.audioUrl,
      id: synthResult.id,
      duration: synthResult.durationEstimate,
      characterCount: synthResult.charCount,
      wordCount: synthResult.wordCount,
      voice: voiceName,
      language: selectedLanguage,
      format: synthResult.audioUrl.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg',
      historyId: historyRecord ? historyRecord.id : undefined,
    });
  } catch (error: any) {
    console.error('Error in /api/tts:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Internal server error while synthesizing speech.',
    });
  }
});

// 5. User Authentication Routes
router.post('/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const user = db.createUser(name.trim(), email.trim(), password);
    const token = db.createSession(user.id);

    res.status(201).json({
      success: true,
      token,
      user,
      message: 'Account created successfully.',
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || 'Registration failed.',
    });
  }
});

router.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = db.verifyCredentials(email.trim(), password);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = db.createSession(user.id);
    res.status(200).json({
      success: true,
      token,
      user,
      message: 'Logged in successfully.',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
});

router.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

router.put('/auth/preferences', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const updatedUser = db.updatePreferences(req.user.id, req.body);
  res.status(200).json({
    success: true,
    user: updatedUser,
  });
});

// 6. Speech History Routes (User specific - Section 16)
router.get('/history', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const history = db.getHistory(req.user.id);
  res.status(200).json({
    success: true,
    history,
  });
});

router.delete('/history/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const deleted = db.deleteHistory(req.params.id, req.user.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'History item not found' });
  }
  res.status(200).json({ success: true, message: 'History item deleted' });
});

router.post('/history/:id/favorite', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const item = db.toggleFavorite(req.params.id, req.user.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'History item not found' });
  }
  res.status(200).json({ success: true, item });
});

// 7. AI Text Enhancement Route (Section 16)
router.post('/enhance-text', async (req, res) => {
  try {
    const { text, action } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Text is required for AI enhancement.' });
    }

    const validActions: EnhancementAction[] = ['summarize', 'grammar', 'conversational', 'bulletize'];
    const chosenAction = validActions.includes(action) ? action : 'grammar';

    const result = await geminiService.enhanceText(text, chosenAction);
    res.status(200).json({
      success: true,
      enhancedText: result.enhancedText,
      note: result.note,
      action: chosenAction,
    });
  } catch (err: any) {
    console.error('Enhancement error:', err);
    res.status(500).json({
      success: false,
      message: err?.message || 'Failed to enhance text with AI.',
    });
  }
});

// 8. Serve Audio with Download support
router.get('/audio/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(AUDIO_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Audio file not found' });
  }

  const isDownload = req.query.download === '1' || req.query.download === 'true';
  const ext = path.extname(filename).toLowerCase();
  const contentType = ext === '.wav' ? 'audio/wav' : 'audio/mpeg';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Accept-Ranges', 'bytes');

  if (isDownload) {
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  }

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

export default router;
