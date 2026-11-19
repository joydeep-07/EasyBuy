import React, { useMemo } from 'react';
import { Check, AlertCircle, Sparkles } from 'lucide-react';
import type { ProductVariant } from '../../../types';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedAttributes: Record<string, string>;
  onSelectAttribute: (key: string, value: string) => void;
  currentVariant?: ProductVariant;
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  variants,
  selectedAttributes,
  onSelectAttribute,
  currentVariant,
}) => {
  // Extract all distinct attribute keys across variants
  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();
    variants.forEach((v) => {
      if (v.attributes) {
        Object.keys(v.attributes).forEach((k) => keys.add(k));
      }
    });
    return Array.from(keys);
  }, [variants]);

  // Extract all options per attribute key
  const attributeOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    attributeKeys.forEach((key) => {
      const values = new Set<string>();
      variants.forEach((v) => {
        if (v.attributes?.[key]) {
          values.add(v.attributes[key]);
        }
      });
      map[key] = Array.from(values);
    });
    return map;
  }, [variants, attributeKeys]);

  // Helper to determine if an option is available given current selections
  const isOptionAvailable = (key: string, value: string) => {
    // Check if there is any variant with this key=value that has stock > 0 and isAvailable
    return variants.some((v) => {
      if (v.attributes?.[key] !== value) return false;
      const otherKeys = attributeKeys.filter((k) => k !== key);
      const matchesOthers = otherKeys.every(
        (ok) => !selectedAttributes[ok] || v.attributes?.[ok] === selectedAttributes[ok]
      );
      return matchesOthers && v.stock > 0 && v.isAvailable !== false;
    });
  };

  if (!variants || variants.length === 0 || attributeKeys.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 py-3 border-y border-[var(--border-light)]/70">
      {attributeKeys.map((key) => {
        const options = attributeOptions[key] || [];
        const isSizeAttribute = key.toLowerCase().includes('size');
        const selectedValue = selectedAttributes[key];

        return (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--text-main)]">
                Select {key}:{' '}
                <span className="text-[var(--accent-primary)] font-bold">
                  {selectedValue || 'Choose'}
                </span>
              </span>
              {isSizeAttribute && (
                <span className="text-[11px] text-[var(--text-secondary)]">Standard Fit</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {options.map((opt) => {
                const isSelected = selectedValue === opt;
                const available = isOptionAvailable(key, opt);

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onSelectAttribute(key, opt)}
                    className={`relative rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSizeAttribute ? 'min-w-[42px] px-3.5 py-2 text-center' : 'px-4 py-2'
                    } ${
                      isSelected
                        ? 'bg-[var(--accent-primary)] text-white shadow-sm ring-2 ring-[var(--accent-primary)]/30 scale-[1.02]'
                        : available
                        ? 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]/80 text-[var(--text-main)] border theme-border hover:border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-secondary)]/50 text-[var(--text-secondary)] opacity-50 border theme-border line-through'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white text-[var(--accent-primary)] rounded-full flex items-center justify-center shadow-xs">
                        <Check size={9} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Selected Variant Stock Feedback */}
      {currentVariant && (
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-[var(--text-secondary)]">
              SKU: {currentVariant.sku}
            </span>
          </div>

          <div>
            {currentVariant.stock <= 0 || !currentVariant.isAvailable ? (
              <span className="inline-flex items-center gap-1 font-bold text-rose-500">
                <AlertCircle size={13} />
                <span>Out of Stock</span>
              </span>
            ) : currentVariant.stock <= 5 ? (
              <span className="font-bold text-amber-500">
                Only {currentVariant.stock} left in stock - order soon
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-500">
                <Check size={13} strokeWidth={2.5} />
                <span>In Stock ({currentVariant.stock} available)</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
