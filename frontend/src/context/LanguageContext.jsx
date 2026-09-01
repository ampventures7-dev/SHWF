import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('shwf_lang');
      return saved === 'hi' ? 'hi' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang) => {
    const validLang = lang === 'hi' ? 'hi' : 'en';
    setLanguageState(validLang);
    try {
      localStorage.setItem('shwf_lang', validLang);
    } catch (e) {
      console.warn('Could not save language to localStorage:', e);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  // Translation helper function
  const t = (path, fallback = '') => {
    if (!path) return fallback;
    const keys = path.split('.');
    
    // 1. Try current language
    let current = translations[language];
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        current = null;
        break;
      }
    }
    if (current !== null && current !== undefined && typeof current === 'string') {
      return current;
    }

    // 2. Fallback to English
    let fallbackObj = translations.en;
    for (const key of keys) {
      if (fallbackObj && typeof fallbackObj === 'object' && key in fallbackObj) {
        fallbackObj = fallbackObj[key];
      } else {
        fallbackObj = null;
        break;
      }
    }
    if (fallbackObj !== null && fallbackObj !== undefined && typeof fallbackObj === 'string') {
      return fallbackObj;
    }

    return fallback || path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
