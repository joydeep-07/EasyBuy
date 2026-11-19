import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, Sliders, Shirt, Smartphone, Laptop, Footprints, Palette } from 'lucide-react';

export interface AttributeDefinitionInput {
  name: string;
  values: string[];
}

interface VariantAttributeSelectorProps {
  attributes: AttributeDefinitionInput[];
  onChange: (attrs: AttributeDefinitionInput[]) => void;
  onGenerateMatrix: () => void;
  basePrice: number;
}

export const VariantAttributeSelector: React.FC<VariantAttributeSelectorProps> = ({
  attributes,
  onChange,
  onGenerateMatrix,
  basePrice,
}) => {
  const [customAttrName, setCustomAttrName] = useState('');
  const [customAttrValues, setCustomAttrValues] = useState('');

  // Presets definition
  const presets = [
    {
      id: 'fashion-sizes',
      label: 'Clothing Sizes',
      icon: Shirt,
      attributes: [{ name: 'Size', values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] }],
    },
    {
      id: 'shoe-sizes',
      label: 'Footwear (UK)',
      icon: Footprints,
      attributes: [{ name: 'Size', values: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'] }],
    },
    {
      id: 'phone-config',
      label: 'Smartphone (RAM / Storage)',
      icon: Smartphone,
      attributes: [
        { name: 'RAM', values: ['6GB', '8GB', '12GB'] },
        { name: 'Storage', values: ['128GB', '256GB', '512GB'] },
      ],
    },
    {
      id: 'laptop-config',
      label: 'Laptop (RAM / SSD)',
      icon: Laptop,
      attributes: [
        { name: 'RAM', values: ['8GB', '16GB', '32GB'] },
        { name: 'Storage', values: ['256GB SSD', '512GB SSD', '1TB SSD'] },
      ],
    },
    {
      id: 'colors',
      label: 'Color Palette',
      icon: Palette,
      attributes: [{ name: 'Color', values: ['Black', 'Silver', 'Blue', 'White', 'Space Gray'] }],
    },
  ];

  const applyPreset = (presetAttrs: AttributeDefinitionInput[]) => {
    // Merge or replace
    const existingNames = new Set(attributes.map((a) => a.name.toLowerCase()));
    const newAttrs = [...attributes];
    presetAttrs.forEach((p) => {
      const idx = newAttrs.findIndex((a) => a.name.toLowerCase() === p.name.toLowerCase());
      if (idx > -1) {
        // Union of values
        const merged = Array.from(new Set([...newAttrs[idx].values, ...p.values]));
        newAttrs[idx] = { ...newAttrs[idx], values: merged };
      } else {
        newAttrs.push({ ...p });
      }
    });
    onChange(newAttrs);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAttrName.trim() || !customAttrValues.trim()) return;

    const values = customAttrValues
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    if (values.length === 0) return;

    const existingIndex = attributes.findIndex(
      (a) => a.name.toLowerCase() === customAttrName.trim().toLowerCase()
    );

    if (existingIndex > -1) {
      const merged = Array.from(new Set([...attributes[existingIndex].values, ...values]));
      const updated = [...attributes];
      updated[existingIndex] = { ...updated[existingIndex], values: merged };
      onChange(updated);
    } else {
      onChange([...attributes, { name: customAttrName.trim(), values }]);
    }

    setCustomAttrName('');
    setCustomAttrValues('');
  };

  const handleRemoveAttribute = (index: number) => {
    const updated = attributes.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleRemoveValue = (attrIndex: number, valueToRemove: string) => {
    const updated = [...attributes];
    updated[attrIndex] = {
      ...updated[attrIndex],
      values: updated[attrIndex].values.filter((v) => v !== valueToRemove),
    };
    if (updated[attrIndex].values.length === 0) {
      onChange(updated.filter((_, i) => i !== attrIndex));
    } else {
      onChange(updated);
    }
  };

  const handleAddValueToAttr = (attrIndex: number, valueToAdd: string) => {
    if (!valueToAdd.trim()) return;
    const trimmed = valueToAdd.trim();
    const updated = [...attributes];
    if (!updated[attrIndex].values.includes(trimmed)) {
      updated[attrIndex] = {
        ...updated[attrIndex],
        values: [...updated[attrIndex].values, trimmed],
      };
      onChange(updated);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Quick Presets Bar */}
      <div>
        <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
          Quick Dimension Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.attributes)}
                className="px-3 py-1.5 rounded-xl border theme-border bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 text-[var(--text-main)] text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Icon size={14} className="text-[var(--accent-primary)]" />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Active Defined Attributes Chips */}
      {attributes.length > 0 && (
        <div className="space-y-3 pt-2">
          <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            Configured Attributes ({attributes.length})
          </label>
          <div className="space-y-2.5">
            {attributes.map((attr, attrIdx) => (
              <div
                key={attr.name}
                className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wide">
                      {attr.name}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      ({attr.values.length} options)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {attr.values.map((val) => (
                      <span
                        key={val}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border theme-border text-[11px] font-medium text-[var(--text-main)] shadow-2xs"
                      >
                        <span>{val}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveValue(attrIdx, val)}
                          className="text-[var(--text-secondary)] hover:text-rose-500 transition-colors ml-0.5"
                          title="Remove option"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRemoveAttribute(attrIdx)}
                    className="p-1.5 rounded-lg border theme-border text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove entire attribute dimension"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onGenerateMatrix}
              className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] hover:opacity-90 active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Generate Combinations Matrix</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Add Custom Attribute / Options Form */}
      <div className="pt-2 border-t theme-border">
        <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
          Add Custom Attribute Dimension
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-4">
            <input
              type="text"
              value={customAttrName}
              onChange={(e) => setCustomAttrName(e.target.value)}
              placeholder="e.g. Size, Material, Flavor"
              className="w-full px-3 py-2 rounded-xl border theme-border bg-[var(--bg-secondary)] text-[var(--text-main)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-xs"
            />
          </div>
          <div className="sm:col-span-6">
            <input
              type="text"
              value={customAttrValues}
              onChange={(e) => setCustomAttrValues(e.target.value)}
              placeholder="Comma-separated (e.g. S, M, L, XL)"
              className="w-full px-3 py-2 rounded-xl border theme-border bg-[var(--bg-secondary)] text-[var(--text-main)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={handleAddCustom}
              className="w-full py-2 rounded-xl border theme-border bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
