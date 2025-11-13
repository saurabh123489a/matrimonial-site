'use client';

import { useTheme } from '@/contexts/ThemeContext';

type ColorTheme = 'pink' | 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'teal' | 'indigo' | 'cyan' | 'rose' | 'violet' | 'emerald' | 'lime' | 'fuchsia' | 'sky' | 'orange' | 'yellow' | 'slate' | 'stone';

interface ThemeOption {
  id: ColorTheme;
  name: string;
  emoji: string;
  colors: {
    primary: string;
    background: string;
  };
}

const themeOptions: ThemeOption[] = [
  {
    id: 'pink',
    name: 'Pink',
    emoji: '🌸',
    colors: {
      primary: '#ff6584',
      background: '#0f1117',
    },
  },
  {
    id: 'blue',
    name: 'Blue',
    emoji: '💙',
    colors: {
      primary: '#60a5fa',
      background: '#0a1628',
    },
  },
  {
    id: 'green',
    name: 'Green',
    emoji: '💚',
    colors: {
      primary: '#4ade80',
      background: '#0d1f0d',
    },
  },
  {
    id: 'purple',
    name: 'Purple',
    emoji: '💜',
    colors: {
      primary: '#a78bfa',
      background: '#1a0d2e',
    },
  },
  {
    id: 'amber',
    name: 'Amber',
    emoji: '🧡',
    colors: {
      primary: '#fbbf24',
      background: '#1f1300',
    },
  },
  {
    id: 'red',
    name: 'Red',
    emoji: '❤️',
    colors: {
      primary: '#f87171',
      background: '#1f0a0a',
    },
  },
  {
    id: 'teal',
    name: 'Teal',
    emoji: '💠',
    colors: {
      primary: '#5eead4',
      background: '#0a1f1f',
    },
  },
  {
    id: 'indigo',
    name: 'Indigo',
    emoji: '💙',
    colors: {
      primary: '#818cf8',
      background: '#0f0d1f',
    },
  },
  {
    id: 'cyan',
    name: 'Cyan',
    emoji: '🌊',
    colors: {
      primary: '#22d3ee',
      background: '#0a1a1f',
    },
  },
  {
    id: 'rose',
    name: 'Rose',
    emoji: '🌹',
    colors: {
      primary: '#fb7185',
      background: '#1f0f14',
    },
  },
  {
    id: 'violet',
    name: 'Violet',
    emoji: '🔮',
    colors: {
      primary: '#a855f7',
      background: '#1a0d26',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald',
    emoji: '💎',
    colors: {
      primary: '#34d399',
      background: '#0d1f14',
    },
  },
  {
    id: 'lime',
    name: 'Lime',
    emoji: '🍋',
    colors: {
      primary: '#84cc16',
      background: '#1a1f0d',
    },
  },
  {
    id: 'fuchsia',
    name: 'Fuchsia',
    emoji: '🌺',
    colors: {
      primary: '#e879f9',
      background: '#1f0d1f',
    },
  },
  {
    id: 'sky',
    name: 'Sky',
    emoji: '☁️',
    colors: {
      primary: '#38bdf8',
      background: '#0a1620',
    },
  },
  {
    id: 'orange',
    name: 'Orange',
    emoji: '🍊',
    colors: {
      primary: '#fb923c',
      background: '#1f140a',
    },
  },
  {
    id: 'yellow',
    name: 'Yellow',
    emoji: '⭐',
    colors: {
      primary: '#facc15',
      background: '#1f1a0a',
    },
  },
  {
    id: 'slate',
    name: 'Slate',
    emoji: '🪨',
    colors: {
      primary: '#94a3b8',
      background: '#0f1419',
    },
  },
  {
    id: 'stone',
    name: 'Stone',
    emoji: '⚪',
    colors: {
      primary: '#a8a29e',
      background: '#141414',
    },
  },
];

export default function ThemeSelector() {
  const { colorTheme, setColorTheme, resolvedTheme } = useTheme();

  if (resolvedTheme === 'light') {
    return (
      <div className="text-sm text-gray-600 dark:text-pink-400">
        Color themes are available in dark mode only
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {themeOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setColorTheme(option.id)}
            className={`
              relative p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer
              hover:scale-105 active:scale-95
              ${
                colorTheme === option.id
                  ? 'border-pink-500 dark:border-pink-400 shadow-lg scale-105 ring-2 ring-pink-500/50'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }
            `}
            style={{
              backgroundColor: option.colors.background,
            }}
            aria-label={`Select ${option.name} theme`}
            title={option.name}
          >
            <div className="text-center">
              <div className="text-xl sm:text-2xl mb-1">{option.emoji}</div>
              <div
                className="text-xs font-medium truncate"
                style={{
                  color: option.colors.primary,
                }}
              >
                {option.name}
              </div>
            </div>
            {colorTheme === option.id && (
              <div className="absolute top-1 right-1">
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  style={{ color: option.colors.primary }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

