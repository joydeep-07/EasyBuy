import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { toggleTheme } from '../../redux/slices/themeSlice';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      aria-label="Toggle Dark and Light Mode"
      className={`relative p-2 rounded-full border theme-border hover:bg-[var(--bg-secondary)] transition-colors ${className}`}
    >
      <motion.div
        key={theme}
        initial={{ y: -10, opacity: 0, rotate: -45 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        exit={{ y: 10, opacity: 0, rotate: 45 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center text-[var(--accent-primary)]"
      >
        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </motion.div>
    </button>
  );
};
