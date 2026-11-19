import React, { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import type { AttributeDefinitionInput } from './VariantAttributeSelector';

export interface VariantItemData {
  _id?: string;
  sku: string;
  title: string;
  attributes: Record<string, string>;
  price: number;
  originalPrice?: number;
  stock: number;
  isAvailable?: boolean;
}

interface VariantOptionFormProps {
  attributes: AttributeDefinitionInput[];
  defaultPrice: number;
  onAddVariant: (variant: VariantItemData) => void;
  onClose: () => void;
}

export const VariantOptionForm: React.FC<VariantOptionFormProps> = ({
  attributes,
  defaultPrice,
  onAddVariant,
  onClose,
}) => {
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    attributes.forEach((attr) => {
      initial[attr.name] = attr.values[0] || '';
    });
    return initial;
  });

  const [price, setPrice] = useState(defaultPrice || 999);
  const [originalPrice, setOriginalPrice] = useState(defaultPrice || 999);
  const [stock, setStock] = useState(15);
  const [customSku, setCustomSku] = useState('');

  const handleAttrChange = (name: string, value: string) => {
    setSelectedAttrs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const attrValues = Object.values(selectedAttrs).filter(Boolean);
    const sku = customSku.trim() || `SKU-${attrValues.join('-').toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const title = attrValues.join(' / ');

    onAddVariant({
      sku: sku.toUpperCase(),
      title,
      attributes: selectedAttrs,
      price: Number(price) >= 0 ? Number(price) : 0,
      originalPrice: Number(originalPrice) >= 0 ? Number(originalPrice) : Number(price),
      stock: Number(stock) >= 0 ? Number(stock) : 0,
      isAvailable: Number(stock) > 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-[var(--bg-secondary)] border theme-border space-y-3.5 text-xs">
      <div className="flex items-center justify-between pb-1 border-b theme-border">
        <h4 className="font-bold text-xs text-[var(--text-main)] flex items-center gap-1.5">
          <Tag size={13} className="text-[var(--accent-primary)]" />
          <span>Add Individual Variant Option</span>
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="text-[var(--text-secondary)] hover:text-[var(--text-main)] p-1"
        >
          <X size={14} />
        </button>
      </div>

      {/* Dynamic Attributes Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {attributes.map((attr) => (
          <div key={attr.name}>
            <label className="block text-[11px] font-semibold text-[var(--text-main)] mb-1">
              {attr.name}
            </label>
            <select
              value={selectedAttrs[attr.name] || ''}
              onChange={(e) => handleAttrChange(attr.name, e.target.value)}
              className="w-full px-3 py-2 rounded-xl border theme-border bg-[var(--bg-main)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            >
              {attr.values.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Price, Original Price, Stock, Custom SKU */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-[var(--text-main)] mb-1">
            Price (₹) *
          </label>
          <input
            type="number"
            min={0}
            required
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border theme-border bg-[var(--bg-main)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[var(--text-main)] mb-1">
            Original Price (₹)
          </label>
          <input
            type="number"
            min={0}
            value={originalPrice}
            onChange={(e) => setOriginalPrice(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border theme-border bg-[var(--bg-main)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[var(--text-main)] mb-1">
            Stock Qty *
          </label>
          <input
            type="number"
            min={0}
            required
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border theme-border bg-[var(--bg-main)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[var(--text-main)] mb-1">
            SKU Code (Optional)
          </label>
          <input
            type="text"
            placeholder="Auto-generated"
            value={customSku}
            onChange={(e) => setCustomSku(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border theme-border bg-[var(--bg-main)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] font-mono"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-xl border theme-border text-[var(--text-secondary)] hover:text-[var(--text-main)] font-medium cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white font-bold shadow-xs hover:opacity-90 cursor-pointer flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>Add Variant to List</span>
        </button>
      </div>
    </form>
  );
};
