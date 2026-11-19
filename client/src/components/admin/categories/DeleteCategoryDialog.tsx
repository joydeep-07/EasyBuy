import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, ArrowRight, ShieldAlert, Package, Shuffle } from 'lucide-react';
import type { Category } from '../../../types';

interface DeleteCategoryDialogProps {
  isOpen: boolean;
  category: Category | null;
  allCategories: Category[];
  onClose: () => void;
  onConfirmDelete: (categoryId: string, reassignTo?: string) => Promise<void>;
  isLoading: boolean;
}

export const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  isOpen,
  category,
  allCategories,
  onClose,
  onConfirmDelete,
  isLoading,
}) => {
  const [reassignTo, setReassignTo] = useState<string>('');

  if (!category) return null;

  const productCount = category.productCount || 0;
  const hasProducts = productCount > 0;

  // Filter out the category being deleted from reassignment target candidates
  const eligibleReassignmentTargets = allCategories.filter((c) => c._id !== category._id);

  const handleDelete = async () => {
    if (hasProducts && !reassignTo) {
      return; // Cannot proceed without selecting a reassignment target when products exist
    }
    await onConfirmDelete(category._id, reassignTo || undefined);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md p-6 sm:p-7 rounded-3xl theme-surface border theme-border shadow-2xl z-10 my-8 overflow-hidden text-xs"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b theme-border">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  hasProducts
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}>
                  {hasProducts ? <AlertTriangle size={20} /> : <Trash2 size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-main)] tracking-tight">
                    {hasProducts ? 'Category Has Linked Products' : 'Confirm Category Removal'}
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Irreversible administrative deletion action
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full border theme-border flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Target Category Info Pill */}
            <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border theme-border flex items-center gap-3 mb-4">
              <img
                src={category.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100'}
                alt={category.name}
                className="w-10 h-10 rounded-xl object-cover border theme-border shrink-0 bg-neutral-200 dark:bg-neutral-800"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-[var(--text-main)] truncate">{category.name}</p>
                <p className="text-[10px] text-[var(--text-secondary)] font-mono">slug: {category.slug}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] block">Associated</span>
                <span className={`text-xs font-bold ${hasProducts ? 'text-amber-500' : 'text-[var(--text-secondary)]'}`}>
                  {productCount} {productCount === 1 ? 'Product' : 'Products'}
                </span>
              </div>
            </div>

            {/* Warning or Reassignment Section */}
            {hasProducts ? (
              <div className="space-y-4 mb-6">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <ShieldAlert size={15} className="shrink-0" />
                    <span>Safety Protection Active</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    This category contains <strong>{productCount}</strong> active product(s). To maintain catalog integrity without creating orphaned items, you must choose another category to receive these products.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[var(--text-main)] flex items-center gap-1.5">
                    <Shuffle size={13} className="text-[var(--accent-primary)]" />
                    <span>Reassign Products To <span className="text-rose-500">*</span></span>
                  </label>
                  <select
                    value={reassignTo}
                    onChange={(e) => setReassignTo(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border bg-[var(--bg-secondary)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] font-medium text-xs transition-all"
                  >
                    <option value="">-- Select Destination Category --</option>
                    {eligibleReassignmentTargets.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.slug})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">
                Are you sure you want to permanently delete the category{' '}
                <strong className="text-[var(--text-main)]">"{category.name}"</strong>? This will remove its taxonomy record and associated attribute definitions.
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t theme-border">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl border theme-border text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading || (hasProducts && !reassignTo)}
                className={`px-4 py-2.5 rounded-xl text-white font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  hasProducts
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : hasProducts ? (
                  <>
                    <Shuffle size={14} />
                    <span>Reassign & Delete</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Delete Category</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
