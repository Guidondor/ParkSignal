import { useLanguageStore } from '@/store/languageStore';
import { translations, TranslationKey } from '@/lib/i18n';

export function useTranslation() {
  const lang = useLanguageStore((s) => s.lang);

  const t = (key: TranslationKey, vars?: Record<string, string | number>): string => {
    let str = (translations[lang][key] ?? translations['es'][key] ?? key) as string;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  };

  return { t, lang };
}
