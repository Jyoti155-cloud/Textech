export interface AccentOption {
  code: string;
  label: string;
  shortLabel: string;
  flag: string;
}

export interface MaleToneOption {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export const LANGUAGE_ACCENTS: Record<string, AccentOption[]> = {
  en: [
    { code: 'en-US', label: 'American (US)', shortLabel: 'American', flag: '🇺🇸' },
    { code: 'en-GB', label: 'British (UK)', shortLabel: 'British', flag: '🇬🇧' },
    { code: 'en-IN', label: 'Indian English', shortLabel: 'Indian', flag: '🇮🇳' },
    { code: 'en-AU', label: 'Australian', shortLabel: 'Australian', flag: '🇦🇺' },
    { code: 'en-CA', label: 'Canadian', shortLabel: 'Canadian', flag: '🇨🇦' },
  ],
  'es-ES': [
    { code: 'es-ES', label: 'Spain (Castilian)', shortLabel: 'Spain', flag: '🇪🇸' },
    { code: 'es-US', label: 'Latin American', shortLabel: 'Latin Am.', flag: '🇲🇽' },
  ],
  'fr-FR': [
    { code: 'fr-FR', label: 'France (Parisian)', shortLabel: 'France', flag: '🇫🇷' },
    { code: 'fr-CA', label: 'Canadian French', shortLabel: 'Canada', flag: '🇨🇦' },
  ],
  'hi-IN': [
    { code: 'hi-IN', label: 'Standard Hindi', shortLabel: 'Standard', flag: '🇮🇳' },
  ],
};

export const MALE_TONE_OPTIONS: MaleToneOption[] = [
  {
    id: 'warm',
    label: 'Warm Baritone',
    description: 'Smooth, natural & conversational',
    icon: '🎙️',
  },
  {
    id: 'deep',
    label: 'Deep Resonant',
    description: 'Rich, bold & broadcast style',
    icon: '🔊',
  },
  {
    id: 'crisp',
    label: 'Crisp & Clear',
    description: 'Sharp, articulate & authoritative',
    icon: '⚡',
  },
];

export function getAccentsForLanguage(langCode: string): AccentOption[] {
  const code = langCode || 'en';
  if (code === 'en' || code.startsWith('en-')) {
    return LANGUAGE_ACCENTS.en;
  }
  if (LANGUAGE_ACCENTS[code]) {
    return LANGUAGE_ACCENTS[code];
  }
  const prefix = code.split('-')[0];
  if (prefix === 'es') return LANGUAGE_ACCENTS['es-ES'];
  if (prefix === 'fr') return LANGUAGE_ACCENTS['fr-FR'];
  if (prefix === 'hi') return LANGUAGE_ACCENTS['hi-IN'];

  return [
    {
      code: langCode,
      label: 'Standard Accent',
      shortLabel: 'Standard',
      flag: '🌐',
    },
  ];
}
