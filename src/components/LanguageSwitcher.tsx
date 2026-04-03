import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import FlagIcon from './FlagIcon';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    try {
      i18n.changeLanguage(languageCode);
      setIsOpen(false);
    } catch (error) {
      console.error('Language change failed:', error);
      setIsOpen(false);
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="group flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-white/15 to-white/10 hover:from-white/25 hover:to-white/20 backdrop-blur-lg border border-white/30 hover:border-cyan-400/60 rounded-lg text-white transition-all duration-300 hover:scale-105 shadow-md hover:shadow-cyan-500/40"
        aria-label={t('language.selectLanguage') || 'Select Language'}
        type="button"
      >
        <FlagIcon code={currentLanguage.code} className="w-7 h-5 rounded shadow-sm" />
        <span className="hidden sm:inline text-sm font-medium group-hover:text-cyan-300 transition-colors">{currentLanguage.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-400 px-3 py-2 border-b border-white/10 mb-2">
                {t('language.selectLanguage') || 'Select Language'}
              </div>
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  type="button"
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    i18n.language === language.code
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <FlagIcon code={language.code} className="w-7 h-5 rounded shadow-sm flex-shrink-0" />
                  <span className="font-medium">{language.name}</span>
                  {i18n.language === language.code && (
                    <div className="ml-auto w-2 h-2 bg-cyan-400 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
