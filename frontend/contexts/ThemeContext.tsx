'use client';

import { createContext, useContext, ReactNode } from 'react';

type ColorTheme = 'pink' | 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'teal' | 'indigo' | 'cyan' | 'rose' | 'violet' | 'emerald' | 'lime' | 'fuchsia' | 'sky' | 'orange' | 'yellow' | 'slate' | 'stone';

interface ThemeContextType {
  theme: 'light';
  colorTheme: ColorTheme;
  resolvedTheme: 'light';
  setTheme: (theme: 'light') => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value: ThemeContextType = {
    theme: 'light',
    colorTheme: 'pink',
    resolvedTheme: 'light',
    setTheme: () => {}, // No-op
    setColorTheme: () => {}, // No-op - theme switching disabled
    toggleTheme: () => {}, // No-op
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
