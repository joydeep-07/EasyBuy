import React from 'react';
import { Tag, Check } from 'lucide-react';

interface SelectedVariantSummaryProps {
  variantTitle?: string;
  selectedAttributes?: Record<string, string>;
  sku?: string;
  className?: string;
  size?: 'xs' | 'sm';
}

export const SelectedVariantSummary: React.FC<SelectedVariantSummaryProps> = ({
  variantTitle,
  selectedAttributes,
  sku,
  className = '',
  size = 'xs',
}) => {
  const attrEntries = selectedAttributes ? Object.entries(selectedAttributes) : [];

  if (!variantTitle && attrEntries.length === 0) {
    return null;
  }

  const isXs = size === 'xs';

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {variantTitle && (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-md bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 ${
            isXs ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Tag size={isXs ? 10 : 12} />
          <span>{variantTitle}</span>
        </span>
      )}

      {!variantTitle &&
        attrEntries.map(([key, val]) => (
          <span
            key={key}
            className={`inline-flex items-center gap-1 font-medium rounded-md bg-[var(--bg-secondary)] border theme-border text-[var(--text-main)] ${
              isXs ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
            }`}
          >
            <span className="text-[var(--text-secondary)]">{key}:</span>
            <strong className="font-bold">{val}</strong>
          </span>
        ))}

      {sku && (
        <span className="text-[10px] font-mono text-[var(--text-secondary)] hidden sm:inline">
          ({sku})
        </span>
      )}
    </div>
  );
};
