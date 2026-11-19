import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus, Edit3, Sparkles } from 'lucide-react';
import { CategoryForm } from './CategoryForm';
import type { Category } from '../../../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Category | null;
  existingCategories: Category[];
  onSubmit: (formData: Partial<Category>) => Promise<void>;
  isLoading: boolean;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  initialData,
  existingCategories,
  onSubmit,
  isLoading,
}) => {
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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl p-6 sm:p-7 rounded-3xl theme-surface border theme-border shadow-2xl z-10 my-8 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b theme-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 flex items-center justify-center shrink-0">
                  {initialData ? <Edit3 size={18} /> : <FolderPlus size={18} />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--text-main)] tracking-tight">
                    {initialData ? `Edit Category: ${initialData.name}` : 'Create New Category'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {initialData
                      ? 'Update taxonomy attributes, URL slugs, and publishing status.'
                      : 'Define a new departmental category for catalog organization.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full border theme-border flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <CategoryForm
              initialData={initialData}
              existingCategories={existingCategories}
              onSubmit={onSubmit}
              onCancel={onClose}
              isLoading={isLoading}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
