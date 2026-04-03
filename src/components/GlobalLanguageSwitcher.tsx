import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import FlagIcon from './FlagIcon';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
  continent: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', region: 'Global', continent: 'Global' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', region: 'Spain/Latin America', continent: 'Europe/Americas' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'France/Africa', continent: 'Europe/Africa' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', region: 'Germany', continent: 'Europe' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', region: 'Brazil/Portugal', continent: 'Americas/Europe' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', region: 'Italy', continent: 'Europe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', region: 'Netherlands', continent: 'Europe' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', region: 'Poland', continent: 'Europe' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', region: 'Russia', continent: 'Europe/Asia' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', region: 'Ukraine', continent: 'Europe' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', region: 'Turkey', continent: 'Asia/Europe' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', region: 'Middle East/North Africa', continent: 'Asia/Africa' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'India', continent: 'Asia' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: 'Japan', continent: 'Asia' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', region: 'China', continent: 'Asia' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', region: 'South Korea', continent: 'Asia' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', region: 'Indonesia', continent: 'Asia' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', region: 'Vietnam', continent: 'Asia' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', region: 'Thailand', continent: 'Asia' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', region: 'East Africa', continent: 'Africa' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', region: 'Ethiopia', continent: 'Africa' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬', region: 'Nigeria', continent: 'Africa' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', flag: '🇳🇬', region: 'Nigeria', continent: 'Africa' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬', region: 'West Africa', continent: 'Africa' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', region: 'Norway', continent: 'Europe' },
  { code: 'ibb', name: 'Ibibio', nativeName: 'Ibibio', flag: '🇳🇬', region: 'Nigeria', continent: 'Africa' },
];

const continents = ['Global', 'Europe', 'Americas', 'Asia', 'Africa'];

export default function GlobalLanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('Global');
  const [detectedRegion, setDetectedRegion] = useState<string>('');

  useEffect(() => {
    detectUserRegion();
  }, []);

  const detectUserRegion = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
      const data = await response.json();
      setDetectedRegion(`${data.city}, ${data.country_name}`);

      const countryLanguageMap: Record<string, string> = {
        ES: 'es', FR: 'fr', DE: 'de', IT: 'it', PT: 'pt', BR: 'pt',
        NL: 'nl', PL: 'pl', RU: 'ru', UA: 'uk', TR: 'tr',
        SA: 'ar', AE: 'ar', EG: 'ar', MA: 'ar', DZ: 'ar',
        IN: 'hi', JP: 'ja', CN: 'zh', KR: 'ko', ID: 'id',
        VN: 'vi', TH: 'th', KE: 'sw', TZ: 'sw', ET: 'am',
        NG: 'yo',
      };

      const detectedLang = countryLanguageMap[data.country_code];
      if (detectedLang && !localStorage.getItem('i18nextLng')) {
        i18n.changeLanguage(detectedLang);
      }
    } catch (error) {
      console.error('Region detection failed:', error);
    }
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const filteredLanguages = languages.filter(lang => {
    const matchesSearch = lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lang.region.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesContinent = selectedContinent === 'Global' ||
                            lang.continent.includes(selectedContinent);

    return matchesSearch && matchesContinent;
  });

  const handleLanguageChange = (langCode: string) => {
    try {
      localStorage.removeItem('i18nextLng');
      localStorage.setItem('i18nextLng', langCode);

      document.cookie = `i18next=${langCode}; path=/; max-age=31536000`;

      setIsOpen(false);
      setSearchTerm('');

      setTimeout(() => {
        window.location.href = window.location.pathname + window.location.search;
      }, 100);
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
        type="button"
        className="group flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-white/15 to-white/10 hover:from-white/25 hover:to-white/20 rounded-lg transition-all duration-300 hover:scale-105 border border-white/30 hover:border-cyan-400/60 backdrop-blur-md shadow-md hover:shadow-cyan-500/40"
        aria-label="Select Language"
      >
        <FlagIcon code={currentLanguage.code} className="w-7 h-5 rounded shadow-sm" />
        <span className="text-white font-medium hidden sm:inline text-sm group-hover:text-cyan-300 transition-colors">
          {currentLanguage.nativeName}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-gray-900 border border-white/20 rounded-xl shadow-2xl z-50 max-h-[600px] overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-3 mb-3">
                <Globe className="h-6 w-6 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {t('language.selectLanguage') || 'Select Language'}
                  </h3>
                  {detectedRegion && (
                    <p className="text-xs text-gray-400">
                      {t('language.detectedRegion') || 'Detected'}: {detectedRegion}
                    </p>
                  )}
                </div>
              </div>

              <input
                type="text"
                placeholder={t('language.searchLanguages') || 'Search languages...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />

              <div className="flex flex-wrap gap-2 mt-3">
                {continents.map(continent => (
                  <button
                    key={continent}
                    type="button"
                    onClick={() => setSelectedContinent(continent)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedContinent === continent
                        ? 'bg-cyan-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {continent}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto max-h-[400px]">
              {filteredLanguages.map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-all duration-200 ${
                    i18n.language === lang.code ? 'bg-cyan-500/20 border-l-4 border-cyan-400' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <FlagIcon code={lang.code} className="w-8 h-6 rounded shadow-sm flex-shrink-0" />
                    <div className="text-left">
                      <div className="text-white font-medium">{lang.nativeName}</div>
                      <div className="text-xs text-gray-400">{lang.name} • {lang.region}</div>
                    </div>
                  </div>
                  {i18n.language === lang.code && (
                    <Check className="h-5 w-5 text-green-400" />
                  )}
                </button>
              ))}

              {filteredLanguages.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  {t('language.noLanguagesFound') || 'No languages found'}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-white/10 bg-white/5">
              <p className="text-xs text-gray-400 text-center">
                {languages.length} {t('language.languages') || 'languages'} available
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
