import { Language, Translations } from './types';
import { en } from './en';
import { zh } from './zh';

const translations: Record<Language, Translations> = {
  en,
  zh,
};

export const getTranslations = (language: Language): Translations => {
  return translations[language] || translations.en;
};

export * from './types';
export { en, zh };

