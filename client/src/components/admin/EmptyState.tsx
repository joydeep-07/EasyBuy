import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`py-16 px-6 text-center max-w-sm mx-auto flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] border theme-border flex items-center justify-center text-[var(--text-secondary)] mb-4 shadow-sm">
        <Icon size={26} strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold text-[var(--text-main)] tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};
