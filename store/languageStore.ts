import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lang } from '@/lib/i18n';

interface LanguageStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      lang: 'es',
      setLang: (lang) => set({ lang }),
      toggle: () => set({ lang: get().lang === 'es' ? 'en' : 'es' }),
    }),
    {
      name: 'parksignal-language',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
