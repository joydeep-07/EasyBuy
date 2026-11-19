import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Link as LinkIcon, FolderTree, ArrowRight, Check } from 'lucide-react';
import type { Category } from '../../../types';

interface CategoryFormProps {
  initialData?: Category | null;
  existingCategories: Category[];
  onSubmit: (formData: Partial<Category>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData,
  existingCategories,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(Boolean(initialData?.slug));
  const [description, setDescription] = useState(initialData?.description || '');
  const [image, setImage] = useState(initialData?.image || '');
  const [parentCategory, setParentCategory] = useState<string>(
    typeof initialData?.parentCategory === 'object' && initialData?.parentCategory?._id
      ? initialData.parentCategory._id
      : typeof initialData?.parentCategory === 'string'
      ? initialData.parentCategory
      : ''
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured ?? false);
  const [isActive, setIsActive] = useState<boolean>(initialData?.isActive ?? true);
  const [displayOrder, setDisplayOrder] = useState<number>(initialData?.displayOrder ?? 0);

  const [errors, setErrors] = useState<{ name?: string; slug?: string }>({});

  // Auto-generate slug from name if not manually edited
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));

    if (!isSlugManuallyEdited) {
      const generatedSlug = newName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setSlug(e.target.value);
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: undefined }));
  };

  const validate = () => {
    const errs: { name?: string; slug?: string } = {};
    if (!name.trim()) errs.name = 'Category name is required';
    if (!slug.trim()) errs.slug = 'Category slug is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description.trim(),
      image: image.trim(),
      parentCategory: parentCategory || null,
      isFeatured,
      isActive,
      displayOrder: Number(displayOrder) || 0,
    });
  };

  // Filter out current category from parent category options to prevent circular dependency
  const availableParentCategories = existingCategories.filter(
    (c) => !initialData || c._id !== initialData._id
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs">
      {/* 1. Name & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5 text-[var(--text-main)]">
            Category Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={handleNameChange}
            placeholder="e.g. Smart Wearables"
            className={`w-full px-3.5 py-2.5 rounded-xl border bg-[var(--bg-secondary)] text-[var(--text-main)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all ${
              errors.name ? 'border-rose-500' : 'theme-border'
            }`}
          />
          {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[var(--text-main)]">
              URL Slug <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-[var(--text-secondary)] font-mono">
              /category/{slug || '...'}
            </span>
          </div>
          <input
            type="text"
            required
            value={slug}
            onChange={handleSlugChange}
            placeholder="e.g. smart-wearables"
            className={`w-full px-3.5 py-2.5 rounded-xl border bg-[var(--bg-secondary)] text-[var(--text-main)] font-mono placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all ${
              errors.slug ? 'border-rose-500' : 'theme-border'
            }`}
          />
          {errors.slug && <p className="text-[11px] text-rose-500 mt-1">{errors.slug}</p>}
        </div>
      </div>

      {/* 2. Description */}
      <div>
        <label className="block text-xs font-semibold mb-1.5 text-[var(--text-main)]">
          Description (Optional)
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description for SEO, department catalogs, and category banners..."
          className="w-full px-3.5 py-2.5 rounded-xl border theme-border bg-[var(--bg-secondary)] text-[var(--text-main)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all resize-none"
        />
      </div>

      {/* 3. Image URL & Live Preview */}
      <div>
        <label className="block text-xs font-semibold mb-1.5 text-[var(--text-main)]">
          Category Thumbnail / Banner URL
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full">
            <LinkIcon size={14} className="absolute left-3.5 text-[var(--text-secondary)] top-3 pointer-events-none" />
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border theme-border bg-[var(--bg-secondary)] text-[var(--text-main)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all text-xs"
            />
          </div>
          {/* Quick preset thumbnail previews */}
          <div className="flex items-center gap-1.5 shrink-0">
            {image ? (
              <img
                src={image}
                alt="Preview"
                className="w-10 h-10 rounded-xl object-cover border theme-border shadow-xs bg-neutral-100 dark:bg-neutral-800"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl border border-dashed theme-border flex items-center justify-center text-[var(--text-secondary)]">
                <ImageIcon size={16} />
              </div>
            )}
            {image && (
              <button
                type="button"
                onClick={() => setImage('')}
                className="text-[11px] text-rose-500 hover:underline px-1.5"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Parent Category & Display Order */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5 text-[var(--text-main)]">
            Parent Category (Optional)
          </label>
          <div className="relative">
            <select
              value={parentCategory}
              onChange={(e) => setParentCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border theme-border bg-[var(--bg-secondary)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
            >
              <option value="">None (Top-Level Department)</option>
              {availableParentCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name} ({cat.slug})
                </option>
              ))}
            </select>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] mt-1">
            Assigning a parent turns this into a nested subcategory.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 text-[var(--text-main)]">
            Display Sort Order
          </label>
          <input
            type="number"
            min={0}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
            className="w-full px-3.5 py-2.5 rounded-xl border theme-border bg-[var(--bg-secondary)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all font-mono"
          />
          <p className="text-[10px] text-[var(--text-secondary)] mt-1">
            Lower numbers appear first in storefront navigation menus.
          </p>
        </div>
      </div>

      {/* 5. Status Switches */}
      <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border theme-border flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded accent-[var(--accent-primary)] cursor-pointer"
          />
          <div>
            <span className="font-semibold text-xs text-[var(--text-main)] block">Active Status</span>
            <span className="text-[10px] text-[var(--text-secondary)]">Visible in storefront filters & catalog</span>
          </div>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 rounded accent-[var(--accent-primary)] cursor-pointer"
          />
          <div>
            <span className="font-semibold text-xs text-[var(--text-main)] block">Featured Department</span>
            <span className="text-[10px] text-[var(--text-secondary)]">Highlighted on homepage showcase</span>
          </div>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl border theme-border text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] font-medium text-xs transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:opacity-90 active:scale-95 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>{initialData ? 'Update Category' : 'Create Category'}</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
