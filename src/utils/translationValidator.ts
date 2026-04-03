/**
 * V3BMusic.AI - Translation Quality Validator
 * Ensures all translations are complete, consistent, and culturally appropriate
 */

export interface ValidationResult {
  language: string;
  isValid: boolean;
  completeness: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  key: string;
  type: 'missing' | 'empty' | 'invalid_format' | 'placeholder_not_translated';
  message: string;
}

export interface ValidationWarning {
  key: string;
  type: 'length_mismatch' | 'special_chars' | 'inconsistent_terminology' | 'cultural_concern';
  message: string;
}

export interface TranslationMetadata {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  pluralRules: string;
  dateFormat: string;
  numberFormat: string;
  currencySymbol: string;
  culturalNotes: string[];
}

/**
 * Language metadata with cultural information
 */
export const languageMetadata: Record<string, TranslationMetadata> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    pluralRules: 'en-US',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US',
    currencySymbol: '£',
    culturalNotes: ['Use formal tone for business', 'Avoid slang unless contextually appropriate']
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    pluralRules: 'ar-SA',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'ar-SA',
    currencySymbol: 'ر.س',
    culturalNotes: [
      'Use formal Arabic (MSA) for platform text',
      'Right-to-left layout required',
      'Respectful tone is paramount',
      'Consider religious sensitivities in content'
    ]
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr',
    pluralRules: 'zh-CN',
    dateFormat: 'YYYY/MM/DD',
    numberFormat: 'zh-CN',
    currencySymbol: '¥',
    culturalNotes: [
      'Use Simplified Chinese for mainland China',
      'Numbers 4 and 8 have cultural significance',
      'Formal tone for business contexts',
      'Avoid direct translations of idioms'
    ]
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    pluralRules: 'ja-JP',
    dateFormat: 'YYYY/MM/DD',
    numberFormat: 'ja-JP',
    currencySymbol: '¥',
    culturalNotes: [
      'Use polite/formal forms (です/ます)',
      'Respect hierarchical relationships',
      'Avoid overly casual language',
      'Consider katakana for foreign terms'
    ]
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr',
    pluralRules: 'hi-IN',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-IN',
    currencySymbol: '₹',
    culturalNotes: [
      'Use respectful forms of address',
      'Mix of Hindi and English (Hinglish) acceptable for tech terms',
      'Consider regional variations',
      'Formal tone for business'
    ]
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    pluralRules: 'es-ES',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'es-ES',
    currencySymbol: '€',
    culturalNotes: [
      'Use neutral Spanish when possible',
      'Consider regional variations (Spain vs Latin America)',
      'Formal vs informal "you" (usted vs tú)',
      'Gender-neutral language when appropriate'
    ]
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    pluralRules: 'fr-FR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'fr-FR',
    currencySymbol: '€',
    culturalNotes: [
      'Use formal "vous" for business contexts',
      'Respect gendered nouns and agreements',
      'Avoid anglicisms when French equivalents exist',
      'Maintain elegance in phrasing'
    ]
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    direction: 'ltr',
    pluralRules: 'pt-BR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'pt-BR',
    currencySymbol: 'R$',
    culturalNotes: [
      'Brazilian Portuguese as default',
      'Use "você" (informal) or "senhor/senhora" (formal)',
      'Consider European Portuguese variations',
      'Friendly yet professional tone'
    ]
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    pluralRules: 'de-DE',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'de-DE',
    currencySymbol: '€',
    culturalNotes: [
      'Use formal "Sie" for business contexts',
      'Compound words are common',
      'Precision and clarity valued',
      'Respect title usage (Herr/Frau)'
    ]
  },
  yo: {
    code: 'yo',
    name: 'Yoruba',
    nativeName: 'Yorùbá',
    direction: 'ltr',
    pluralRules: 'yo-NG',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-NG',
    currencySymbol: '₦',
    culturalNotes: [
      'Use respectful greetings and honorifics',
      'Tonal marks are important',
      'Mix with English for technical terms acceptable',
      'Respect age and hierarchy in language'
    ]
  },
  ig: {
    code: 'ig',
    name: 'Igbo',
    nativeName: 'Igbo',
    direction: 'ltr',
    pluralRules: 'ig-NG',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-NG',
    currencySymbol: '₦',
    culturalNotes: [
      'Use appropriate honorifics',
      'Mix with English for modern terms',
      'Respect community values',
      'Formal tone for business'
    ]
  },
  ha: {
    code: 'ha',
    name: 'Hausa',
    nativeName: 'Hausa',
    direction: 'ltr',
    pluralRules: 'ha-NG',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-NG',
    currencySymbol: '₦',
    culturalNotes: [
      'Islamic cultural context important',
      'Use respectful greetings',
      'Mix with English for technical terms',
      'Consider religious sensitivities'
    ]
  },
  sw: {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    direction: 'ltr',
    pluralRules: 'sw-KE',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-KE',
    currencySymbol: 'KSh',
    culturalNotes: [
      'Use standard Swahili (not coastal dialects)',
      'Respectful tone valued',
      'Mix with English acceptable for tech terms',
      'Consider pan-African audience'
    ]
  },
  am: {
    code: 'am',
    name: 'Amharic',
    nativeName: 'አማርኛ',
    direction: 'ltr',
    pluralRules: 'am-ET',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'am-ET',
    currencySymbol: 'ብር',
    culturalNotes: [
      'Respectful and formal tone',
      'Religious context important',
      'Use appropriate honorifics',
      'Consider Ethiopian cultural values'
    ]
  }
};

/**
 * Validates translation completeness and quality
 */
export class TranslationValidator {
  private baseLanguage: any;
  private translations: Map<string, any> = new Map();

  constructor(baseLanguage: any) {
    this.baseLanguage = baseLanguage;
  }

  /**
   * Load a translation for validation
   */
  loadTranslation(languageCode: string, translation: any): void {
    this.translations.set(languageCode, translation);
  }

  /**
   * Validate a specific translation
   */
  validate(languageCode: string): ValidationResult {
    const translation = this.translations.get(languageCode);

    if (!translation) {
      return {
        language: languageCode,
        isValid: false,
        completeness: 0,
        errors: [{ key: 'root', type: 'missing', message: 'Translation file not found' }],
        warnings: []
      };
    }

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const allKeys = this.getAllKeys(this.baseLanguage);
    const translatedKeys = this.getAllKeys(translation);

    let validKeys = 0;
    const totalKeys = allKeys.length;

    allKeys.forEach(key => {
      const baseValue = this.getValueByPath(this.baseLanguage, key);
      const translatedValue = this.getValueByPath(translation, key);

      if (translatedValue === undefined) {
        errors.push({
          key,
          type: 'missing',
          message: `Missing translation for key: ${key}`
        });
      } else if (translatedValue === '') {
        errors.push({
          key,
          type: 'empty',
          message: `Empty translation for key: ${key}`
        });
      } else if (translatedValue === baseValue && languageCode !== 'en') {
        warnings.push({
          key,
          type: 'placeholder_not_translated',
          message: `Translation identical to English: ${key}`
        });
        validKeys++;
      } else {
        validKeys++;

        if (typeof baseValue === 'string' && typeof translatedValue === 'string') {
          const baseLength = baseValue.length;
          const translatedLength = translatedValue.length;
          const lengthDiff = Math.abs(baseLength - translatedLength) / baseLength;

          if (lengthDiff > 0.5 && baseLength > 20) {
            warnings.push({
              key,
              type: 'length_mismatch',
              message: `Significant length difference in: ${key} (${Math.round(lengthDiff * 100)}%)`
            });
          }

          const baseVariables = baseValue.match(/\{\{.*?\}\}/g) || [];
          const translatedVariables = translatedValue.match(/\{\{.*?\}\}/g) || [];

          if (baseVariables.length !== translatedVariables.length) {
            errors.push({
              key,
              type: 'invalid_format',
              message: `Variable mismatch in: ${key}`
            });
          }
        }
      }
    });

    const completeness = (validKeys / totalKeys) * 100;
    const isValid = errors.length === 0 && completeness === 100;

    return {
      language: languageCode,
      isValid,
      completeness: Math.round(completeness * 100) / 100,
      errors,
      warnings
    };
  }

  /**
   * Validate all loaded translations
   */
  validateAll(): Map<string, ValidationResult> {
    const results = new Map<string, ValidationResult>();

    this.translations.forEach((_, languageCode) => {
      results.set(languageCode, this.validate(languageCode));
    });

    return results;
  }

  /**
   * Generate validation report
   */
  generateReport(): string {
    const results = this.validateAll();
    let report = '# Translation Quality Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    const summary = {
      total: results.size,
      valid: 0,
      invalid: 0,
      avgCompleteness: 0
    };

    results.forEach(result => {
      if (result.isValid) summary.valid++;
      else summary.invalid++;
      summary.avgCompleteness += result.completeness;
    });

    summary.avgCompleteness = summary.avgCompleteness / summary.total;

    report += `## Summary\n\n`;
    report += `- Total Languages: ${summary.total}\n`;
    report += `- Valid: ${summary.valid}\n`;
    report += `- Invalid: ${summary.invalid}\n`;
    report += `- Average Completeness: ${summary.avgCompleteness.toFixed(2)}%\n\n`;

    report += `## Detailed Results\n\n`;

    results.forEach((result, lang) => {
      const status = result.isValid ? '✅' : '❌';
      report += `### ${status} ${lang} - ${result.completeness}%\n\n`;

      if (result.errors.length > 0) {
        report += `**Errors (${result.errors.length}):**\n`;
        result.errors.slice(0, 10).forEach(error => {
          report += `- ${error.type}: ${error.message}\n`;
        });
        if (result.errors.length > 10) {
          report += `- ... and ${result.errors.length - 10} more\n`;
        }
        report += '\n';
      }

      if (result.warnings.length > 0) {
        report += `**Warnings (${result.warnings.length}):**\n`;
        result.warnings.slice(0, 5).forEach(warning => {
          report += `- ${warning.type}: ${warning.message}\n`;
        });
        if (result.warnings.length > 5) {
          report += `- ... and ${result.warnings.length - 5} more\n`;
        }
        report += '\n';
      }
    });

    return report;
  }

  private getAllKeys(obj: any, prefix = ''): string[] {
    let keys: string[] = [];

    Object.keys(obj).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys = keys.concat(this.getAllKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    });

    return keys;
  }

  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

/**
 * RTL Language Support
 */
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export function isRTL(languageCode: string): boolean {
  return RTL_LANGUAGES.includes(languageCode);
}

export function getTextDirection(languageCode: string): 'ltr' | 'rtl' {
  return isRTL(languageCode) ? 'rtl' : 'ltr';
}

/**
 * Currency formatting by language
 */
export function formatCurrency(amount: number, languageCode: string): string {
  const metadata = languageMetadata[languageCode];

  if (!metadata) {
    return `£${amount.toFixed(2)}`;
  }

  try {
    return new Intl.NumberFormat(metadata.numberFormat, {
      style: 'currency',
      currency: getCurrencyCode(languageCode)
    }).format(amount);
  } catch {
    return `${metadata.currencySymbol}${amount.toFixed(2)}`;
  }
}

/**
 * Get currency code by language
 */
function getCurrencyCode(languageCode: string): string {
  const currencyMap: Record<string, string> = {
    en: 'GBP',
    es: 'EUR',
    fr: 'EUR',
    de: 'EUR',
    pt: 'BRL',
    it: 'EUR',
    ja: 'JPY',
    zh: 'CNY',
    ko: 'KRW',
    ar: 'SAR',
    hi: 'INR',
    yo: 'NGN',
    ig: 'NGN',
    ha: 'NGN',
    ibb: 'NGN',
    sw: 'KES',
    am: 'ETB'
  };

  return currencyMap[languageCode] || 'GBP';
}

/**
 * Date formatting by language
 */
export function formatDate(date: Date, languageCode: string): string {
  const metadata = languageMetadata[languageCode];

  if (!metadata) {
    return date.toLocaleDateString('en-GB');
  }

  try {
    return date.toLocaleDateString(metadata.pluralRules);
  } catch {
    return date.toLocaleDateString('en-GB');
  }
}
