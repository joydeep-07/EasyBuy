import React, { useState } from 'react';
import { Trash2, Copy, Check, Layers, AlertTriangle } from 'lucide-react';
import type { VariantItemData } from './VariantOptionForm';

interface VariantTableProps {
  variants: VariantItemData[];
  onChange: (updatedVariants: VariantItemData[]) => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
}

export const VariantTable: React.FC<VariantTableProps> = ({
  variants,
  onChange,
  onRemove,
  onDuplicate,
}) => {
  const [bulkPrice, setBulkPrice] = useState<string>('');
  const [bulkStock, setBulkStock] = useState<string>('');

  const handleFieldChange = (index: number, field: keyof VariantItemData, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    // Automatically update isAvailable if stock is edited
    if (field === 'stock') {
      const numStock = Number(value) || 0;
      updated[index].isAvailable = numStock > 0;
    }
    onChange(updated);
  };

  const handleApplyBulkPrice = () => {
    const num = Number(bulkPrice);
    if (isNaN(num) || num < 0) return;
    const updated = variants.map((v) => ({ ...v, price: num }));
    onChange(updated);
    setBulkPrice('');
  };

  const handleApplyBulkStock = () => {
    const num = Number(bulkStock);
    if (isNaN(num) || num < 0) return;
    const updated = variants.map((v) => ({
      ...v,
      stock: num,
      isAvailable: num > 0,
    }));
    onChange(updated);
    setBulkStock('');
  };

  if (variants.length === 0) {
    return (
      <div className="p-8 rounded-2xl border border-dashed theme-border text-center space-y-2">
        <Layers size={24} className="mx-auto text-[var(--text-secondary)] opacity-60" />
        <p className="text-xs font-semibold text-[var(--text-main)]">No variants generated yet</p>
        <p className="text-[11px] text-[var(--text-secondary)] max-w-sm mx-auto">
          Select dimension presets above (like Clothing Sizes or Phone Storage) and click "Generate Combinations Matrix", or add variant options manually.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs">
      {/* Bulk Fill Toolbar */}
      <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border theme-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
            Total Variants: {variants.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Bulk Price */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[var(--text-secondary)]">Set All Prices:</span>
            <input
              type="number"
              min={0}
              placeholder="₹ Amount"
              value={bulkPrice}
              onChange={(e) => setBulkPrice(e.target.value)}
              className="w-24 px-2 py-1 rounded-lg border theme-border bg-[var(--bg-main)] text-[var(--text-main)] font-mono text-[11px] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleApplyBulkPrice}
              className="px-2.5 py-1 rounded-lg bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-semibold text-[11px] transition-colors cursor-pointer"
            >
              Apply
            </button>
          </div>

          {/* Bulk Stock */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[var(--text-secondary)]">Set All Stock:</span>
            <input
              type="number"
              min={0}
              placeholder="Quantity"
              value={bulkStock}
              onChange={(e) => setBulkStock(e.target.value)}
              className="w-20 px-2 py-1 rounded-lg border theme-border bg-[var(--bg-main)] text-[var(--text-main)] font-mono text-[11px] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleApplyBulkStock}
              className="px-2.5 py-1 rounded-lg bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-semibold text-[11px] transition-colors cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Variants Table */}
      <div className="rounded-2xl border theme-border overflow-hidden bg-[var(--bg-secondary)]/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b theme-border bg-[var(--bg-secondary)]/80 text-[var(--text-secondary)] font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Variant Attributes</th>
                <th className="py-2.5 px-3">SKU Code</th>
                <th className="py-2.5 px-3">Price (₹) *</th>
                <th className="py-2.5 px-3 hidden sm:table-cell">Orig. Price (₹)</th>
                <th className="py-2.5 px-3">Stock Qty *</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y theme-border">
              {variants.map((v, idx) => {
                const attrEntries = Object.entries(v.attributes || {});
                return (
                  <tr key={v._id || `${v.sku}-${idx}`} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    {/* Attributes */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {attrEntries.map(([k, val]) => (
                          <span
                            key={k}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--bg-main)] border theme-border text-[11px] font-semibold text-[var(--text-main)]"
                          >
                            <span className="text-[var(--text-secondary)] text-[10px]">{k}:</span>
                            <span>{val}</span>
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => handleFieldChange(idx, 'sku', e.target.value.toUpperCase())}
                        className="w-32 px-2 py-1 rounded-lg border theme-border bg-[var(--bg-main)] text-[var(--text-main)] font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                      />
                    </td>

                    {/* Price */}
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min={0}
                        required
                        value={v.price}
                        onChange={(e) => handleFieldChange(idx, 'price', Number(e.target.value))}
                        className="w-24 px-2 py-1 rounded-lg border theme-border bg-[var(--bg-main)] text-[var(--text-main)] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] font-semibold"
                      />
                    </td>

                    {/* Original Price */}
                    <td className="py-2.5 px-3 hidden sm:table-cell">
                      <input
                        type="number"
                        min={0}
                        value={v.originalPrice || v.price}
                        onChange={(e) => handleFieldChange(idx, 'originalPrice', Number(e.target.value))}
                        className="w-24 px-2 py-1 rounded-lg border theme-border bg-[var(--bg-main)] text-[var(--text-secondary)] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                      />
                    </td>

                    {/* Stock */}
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min={0}
                        required
                        value={v.stock}
                        onChange={(e) => handleFieldChange(idx, 'stock', Number(e.target.value))}
                        className={`w-20 px-2 py-1 rounded-lg border theme-border bg-[var(--bg-main)] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] font-bold ${
                          v.stock <= 0 ? 'text-rose-500 border-rose-500/30' : 'text-[var(--text-main)]'
                        }`}
                      />
                    </td>

                    {/* Status Pill */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleFieldChange(idx, 'isAvailable', !v.isAvailable)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          v.isAvailable && v.stock > 0
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {v.isAvailable && v.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onDuplicate(idx)}
                          className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                          title="Duplicate variant row"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemove(idx)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete variant"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
