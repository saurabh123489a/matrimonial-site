'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ColorTheme = 'pink' | 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'teal' | 'indigo' | 'cyan' | 'rose' | 'violet' | 'emerald' | 'lime' | 'fuchsia' | 'sky' | 'orange' | 'yellow' | 'slate' | 'stone';

interface ThemeContextType {
  theme: Theme;
  colorTheme: ColorTheme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('pink');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      const savedColorTheme = localStorage.getItem('colorTheme') as ColorTheme | null;
      
      // Initialize theme from localStorage
      if (savedTheme) {
        setThemeState(savedTheme);
      }
      if (savedColorTheme) {
        setColorThemeState(savedColorTheme);
      }
      
      // Initialize resolvedTheme based on saved theme or system preference
      const getSystemTheme = (): 'light' | 'dark' => {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      };
      
      const themeToUse = savedTheme || 'system';
      const resolved = themeToUse === 'system' ? getSystemTheme() : themeToUse;
      setResolvedTheme(resolved);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const getSystemTheme = (): 'light' | 'dark' => {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    };

    const resolved = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(resolved);

    try {
      const root = document.documentElement;
      root.classList.remove('dark-pink', 'dark-blue', 'dark-green', 'dark-purple', 'dark-amber', 'dark-red', 'dark-teal', 'dark-indigo', 'dark-cyan', 'dark-rose', 'dark-violet', 'dark-emerald', 'dark-lime', 'dark-fuchsia', 'dark-sky', 'dark-orange', 'dark-yellow', 'dark-slate', 'dark-stone');
      
      if (resolved === 'dark') {
        root.classList.add('dark');
        if (colorTheme !== 'pink') {
          root.classList.add(`dark-${colorTheme}`);
        }
      } else {
        root.classList.remove('dark');
      }
    } catch (e) {
      console.error('Error applying theme:', e);
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('theme', theme);
        localStorage.setItem('colorTheme', colorTheme);
      } catch (e) {
        console.error('Error saving theme:', e);
      }
    }
  }, [theme, colorTheme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (theme === 'system') {
          const resolved = mediaQuery.matches ? 'dark' : 'light';
          setResolvedTheme(resolved);
          try {
            const root = document.documentElement;
            root.classList.remove('dark-pink', 'dark-blue', 'dark-green', 'dark-purple', 'dark-amber', 'dark-red', 'dark-teal', 'dark-indigo', 'dark-cyan', 'dark-rose', 'dark-violet', 'dark-emerald', 'dark-lime', 'dark-fuchsia', 'dark-sky', 'dark-orange', 'dark-yellow', 'dark-slate', 'dark-stone');
            
            if (resolved === 'dark') {
              root.classList.add('dark');
              if (colorTheme !== 'pink') {
                root.classList.add(`dark-${colorTheme}`);
              }
            } else {
              root.classList.remove('dark');
            }
          } catch (e) {
            console.error('Error applying theme change:', e);
          }
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (e) {
      console.error('Error setting up theme listener:', e);
    }
  }, [theme, colorTheme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setColorTheme = (newColorTheme: ColorTheme) => {
    setColorThemeState(newColorTheme);
  };

  const toggleTheme = () => {
    setThemeState((current) => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'system';
      return 'light';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, colorTheme, resolvedTheme, setTheme, setColorTheme, toggleTheme }}>
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

