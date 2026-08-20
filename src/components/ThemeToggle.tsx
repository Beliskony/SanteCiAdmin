// src/components/ThemeToggle.tsx
import { useTheme } from '../context/ThemeContext';
import {Sun, Moon} from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Changer de thème"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary transition hover:bg-surface-hover"
    >
      {theme === 'dark' ? <Sun className="bg-yellow-400" /> : <Moon className="bg-gray-400" />}
    </button>
  );
}