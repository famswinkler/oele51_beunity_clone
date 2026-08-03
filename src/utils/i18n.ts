import de from '../i18n/de-CH.json';

type TranslationKey = string;

export const t = (key: TranslationKey, defaultValue?: string): string => {
  const keys = key.split('.');
  let value: any = de;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return defaultValue || key;
    }
  }

  return typeof value === 'string' ? value : key;
};
