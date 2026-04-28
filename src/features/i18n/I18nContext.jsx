import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { messages } from './messages';

const STORAGE_KEY = 'connectra_language';
const SUPPORTED_LANGUAGES = ['pt', 'en'];

function normalizeLanguage(value) {
  if (SUPPORTED_LANGUAGES.includes(value)) {
    return value;
  }

  return 'en';
}

function getMessageByKey(language, key) {
  const scopedMessages = messages[language] ?? messages.en;
  const segments = key.split('.');

  let current = scopedMessages;

  for (const segment of segments) {
    if (!current || typeof current !== 'object' || !(segment in current)) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
}

function interpolate(template, params) {
  if (typeof template !== 'string') {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, token) => {
    if (token in params) {
      return String(params[token]);
    }

    return `{${token}}`;
  });
}

function detectInitialLanguage() {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const savedLanguage = window.localStorage.getItem(STORAGE_KEY);

  if (savedLanguage) {
    return normalizeLanguage(savedLanguage);
  }

  const browserLanguage = window.navigator.language?.toLowerCase() ?? 'en';
  return browserLanguage.startsWith('pt') ? 'pt' : 'en';
}

export const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(detectInitialLanguage);

  const setLanguage = useCallback((nextLanguage) => {
    setLanguageState(normalizeLanguage(nextLanguage));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, language);
    }

    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = useCallback(
    (key, params = {}) => {
      const message = getMessageByKey(language, key) ?? getMessageByKey('en', key) ?? key;

      if (Array.isArray(message)) {
        return message;
      }

      return interpolate(message, params);
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      isPortuguese: language === 'pt',
      isEnglish: language === 'en',
      locale: language === 'pt' ? 'pt-PT' : 'en-US',
    }),
    [language, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
