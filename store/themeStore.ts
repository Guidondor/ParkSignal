import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorSchemeName } from 'react-native';

interface ThemeState {
  mode: 'system' | 'light' | 'dark';
  setMode: (mode: 'system' | 'light' | 'dark') => void;
  toggle: (systemScheme: ColorSchemeName) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
      toggle: (systemScheme) => {
        const { mode } = get();
        const currentlyDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
        set({ mode: currentlyDark ? 'light' : 'dark' });
      },
    }),
    {
      name: 'parksignal-theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);
