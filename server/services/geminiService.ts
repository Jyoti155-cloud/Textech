import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export type EnhancementAction = 'summarize' | 'grammar' | 'conversational' | 'bulletize';

export const geminiService = {
  async enhanceText(
    text: string,
    action: EnhancementAction
  ): Promise<{ enhancedText: string; note: string }> {
    const ai = getAiClient();
    if (!ai) {
      // Fallback heuristics if API key is not yet set
      if (action === 'grammar') {
        const cleaned = text.replace(/\s+/g, ' ').trim();
        return {
          enhancedText: cleaned.charAt(0).toUpperCase() + cleaned.slice(1),
          note: 'Cleaned spacing and capitalization (set GEMINI_API_KEY for deep AI grammar repair).',
        };
      }
      if (action === 'summarize') {
        const sentences = text.split(/(?<=[.?!])\s+/);
        const preview = sentences.slice(0, Math.ceil(sentences.length / 2)).join(' ');
        return {
          enhancedText: preview || text,
          note: 'Summarized using sentence reduction (configure GEMINI_API_KEY for neural summary).',
        };
      }
      return {
        enhancedText: text,
        note: 'AI enhancement requires GEMINI_API_KEY in Secrets.',
      };
    }

    let prompt = '';
    switch (action) {
      case 'summarize':
        prompt = `Summarize the following text concisely so it sounds great when spoken aloud by a Text-to-Speech voice. Keep the core message clear and natural:\n\n${text}`;
        break;
      case 'grammar':
        prompt = `Fix all grammar, spelling, punctuation, and typographical mistakes in the following text. Make it flow smoothly for spoken narration. Return only the corrected text:\n\n${text}`;
        break;
      case 'conversational':
        prompt = `Rewrite the following text into warm, natural, conversational spoken language. Use contractions and natural speech rhythms suitable for audio narration. Return only the rewritten text:\n\n${text}`;
        break;
      case 'bulletize':
        prompt = `Convert the following text into clear spoken talking points with brief intro sentences, designed for clear audio reading. Return only the spoken points:\n\n${text}`;
        break;
      default:
        prompt = `Enhance the following text for spoken clarity:\n\n${text}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert audio scriptwriter and editor preparing text for Text-to-Speech narration. Return directly the enhanced text without preamble, backticks, or quotes.',
      },
    });

    const result = response.text ? response.text.trim() : text;
    return {
      enhancedText: result,
      note: `Enhanced with Gemini 3.8 Flash (${action})`,
    };
  },
};
