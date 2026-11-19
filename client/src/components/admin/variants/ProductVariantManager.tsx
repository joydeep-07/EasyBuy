import React, { useState } from 'react';
import { Layers, Plus, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { VariantAttributeSelector, type AttributeDefinitionInput } from './VariantAttributeSelector';
import { VariantOptionForm, type VariantItemData } from './VariantOptionForm';
import { VariantTable } from './VariantTable';
import { toast } from 'sonner';

interface ProductVariantManagerProps {
  hasVariants: boolean;
  onHasVariantsChange: (enabled: boolean) => void;
  variants: VariantItemData[];
  onVariantsChange: (variants: VariantItemData[]) => void;
  productSlug?: string;
  basePrice: number;
}

export const ProductVariantManager: React.FC<ProductVariantManagerProps> = ({
  hasVariants,
  onHasVariantsChange,
  variants,
  onVariantsChange,
  productSlug = 'prod',
  basePrice,
}) => {
  const [attributes, setAttributes] = useState<AttributeDefinitionInput[]>([
    { name: 'Size', values: ['S', 'M', 'L', 'XL'] },
  ]);
  const [isAddingSingleOption, setIsAddingSingleOption] = useState(false);

  // Cartesian product combination generator
  const handleGenerateMatrix = () => {
    if (!attributes || attributes.length === 0) {
      toast.error('Please configure at least one attribute dimension');
      return;
    }

    const combinations: Record<string, string>[] = [];

    const generateCombinations = (index: number, currentCombo: Record<string, string>) => {
      if (index === attributes.length) {
        combinations.push({ ...currentCombo });
        return;
      }

      const attr = attributes[index];
      for (const val of attr.values) {
        currentCombo[attr.name] = val;
        generateCombinations(index + 1, currentCombo);
      }
    };

    generateCombinations(0, {});

    if (combinations.length === 0) {
      toast.error('No variant combinations could be formed');
      return;
    }

    // Preserve existing prices/stocks for combinations that already exist
    const newVariants: VariantItemData[] = combinations.map((attrs) => {
      const attrKeyValues = Object.entries(attrs);
      const existing = variants.find((v) =>
        attrKeyValues.every(([k, val]) => v.attributes?.[k] === val)
      );

      if (existing) {
        return existing;
      }

      const attrValString = Object.values(attrs).join('-').toUpperCase().replace(/[^\w-]/g, '');
      const sku = `SKU-${productSlug.toUpperCase().slice(0, 8)}-${attrValString}-${Math.floor(100 + Math.random() * 900)}`;

      return {
        sku,
        title: Object.values(attrs).join(' / '),
        attributes: attrs,
        price: basePrice || 999,
        originalPrice: basePrice || 999,
        stock: 15,
        isAvailable: true,
      };
    });

    onVariantsChange(newVariants);
    toast.success(`Generated ${newVariants.length} product variant combinations!`);
  };

  const handleAddSingleVariant = (newVariant: VariantItemData) => {
    // Check if duplicate attributes already exist
    const isDup = variants.some((v) => {
      const keys = Object.keys(newVariant.attributes);
      return keys.every((k) => v.attributes?.[k] === newVariant.attributes[k]);
    });

    if (isDup) {
      toast.error('A variant with this exact combination already exists');
      return;
    }

    onVariantsChange([...variants, newVariant]);
    setIsAddingSingleOption(false);
    toast.success('Variant option added to list');
  };

  const handleRemoveVariant = (index: number) => {
    onVariantsChange(variants.filter((_, i) => i !== index));
    toast.info('Variant removed');
  };

  const handleDuplicateVariant = (index: number) => {
    const target = variants[index];
    if (!target) return;

    const dup: VariantItemData = {
      ...target,
      _id: undefined,
      sku: `${target.sku}-COPY-${Math.floor(10 + Math.random() * 90)}`,
      title: `${target.title} (Copy)`,
    };

    const updated = [...variants];
    updated.splice(index + 1, 0, dup);
    onVariantsChange(updated);
    toast.success('Variant duplicated');
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-5">
      {/* 1. Header with Multi-Variant Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b theme-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--text-main)] tracking-tight">
              Product Variants & Sizing Matrix
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Configure available sizes, RAM/storage specs, colors, and prices
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer self-start sm:self-auto p-1.5 px-3 rounded-xl bg-[var(--bg-secondary)] border theme-border">
          <input
            type="checkbox"
            checked={hasVariants}
            onChange={(e) => onHasVariantsChange(e.target.checked)}
            className="w-4 h-4 rounded accent-[var(--accent-primary)] cursor-pointer"
          />
          <span className="font-bold text-xs text-[var(--text-main)]">
            {hasVariants ? 'Variants Enabled' : 'Enable Variants'}
          </span>
        </label>
      </div>

      {/* When Variants are Enabled */}
      {hasVariants ? (
        <div className="space-y-6">
          {/* Dimension Selector */}
          <VariantAttributeSelector
            attributes={attributes}
            onChange={setAttributes}
            onGenerateMatrix={handleGenerateMatrix}
            basePrice={basePrice}
          />

          {/* Manual Add Single Option */}
          {isAddingSingleOption ? (
            <VariantOptionForm
              attributes={attributes}
              defaultPrice={basePrice}
              onAddVariant={handleAddSingleVariant}
              onClose={() => setIsAddingSingleOption(false)}
            />
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsAddingSingleOption(true)}
                className="px-3.5 py-1.5 rounded-xl border theme-border bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] text-[var(--text-main)] font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Custom Option Manually</span>
              </button>
            </div>
          )}

          {/* Configured Variants Table */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Configured Variant List
            </label>
            <VariantTable
              variants={variants}
              onChange={onVariantsChange}
              onRemove={handleRemoveVariant}
              onDuplicate={handleDuplicateVariant}
            />
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-[var(--text-secondary)]">
          This product uses single standard pricing and inventory. Toggle "Enable Variants" above to add sizes, colors, or configurations.
        </div>
      )}
    </div>
  );
};
