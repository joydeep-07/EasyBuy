import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Sliders,
  Check,
  ChevronRight,
  FolderPlus,
  Sparkles,
  X,
  Tag,
  Boxes,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetCategoriesQuery,
  useGetCategoryAttributesQuery,
} from '../../redux/api/categoryApi';
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useAddCategoryAttributeMutation,
} from '../../redux/api/adminApi';
import { EmptyState } from '../../components/admin/EmptyState';
import { toast } from 'sonner';

export const AdminCategoriesPage: React.FC = () => {
  const [selectedCatId, setSelectedCatId] = useState<string>('');

  // Category creation modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');

  // Attribute creation modal
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [attrName, setAttrName] = useState('');
  const [attrType, setAttrType] = useState('text');
  const [attrUnit, setAttrUnit] = useState('');
  const [attrValuesStr, setAttrValuesStr] = useState('');
  const [attrIsRequired, setAttrIsRequired] = useState(false);
  const [attrIsVariant, setAttrIsVariant] = useState(false);

  // Queries
  const { data: categoriesData, refetch: refetchCategories } = useGetCategoriesQuery();
  const { data: attributesData, refetch: refetchAttributes } = useGetCategoryAttributesQuery(selectedCatId, {
    skip: !selectedCatId,
  });

  const [createCategory, { isLoading: isCreatingCat }] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [addAttribute, { isLoading: isAddingAttr }] = useAddCategoryAttributeMutation();

  const categories = categoriesData?.categories || [];
  const attributes = attributesData?.attributes || [];

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    try {
      await createCategory({
        name: catName,
        slug: catSlug || catName.toLowerCase().replace(/\s+/g, '-'),
        description: catDesc,
        image: catImage || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
      }).unwrap();

      toast.success('Category created successfully!');
      setIsCatModalOpen(false);
      setCatName('');
      setCatSlug('');
      setCatDesc('');
      setCatImage('');
      refetchCategories();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Delete this category and its associated dynamic attributes?')) {
      try {
        await deleteCategory(id).unwrap();
        toast.success('Category removed');
        if (selectedCatId === id) setSelectedCatId('');
        refetchCategories();
      } catch (err: any) {
        toast.error(err?.data?.message || 'Failed to delete category');
      }
    }
  };

  const handleAddAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId || !attrName) {
      toast.error('Attribute name and selected category are required');
      return;
    }

    const predefinedValues = attrValuesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await addAttribute({
        categoryId: selectedCatId,
        data: {
          name: attrName,
          type: attrType,
          unit: attrUnit,
          predefinedValues,
          isRequired: attrIsRequired,
          isVariantAttribute: attrIsVariant,
        },
      }).unwrap();

      toast.success('Dynamic attribute definition added!');
      setIsAttrModalOpen(false);
      setAttrName('');
      setAttrType('text');
      setAttrUnit('');
      setAttrValuesStr('');
      setAttrIsRequired(false);
      setAttrIsVariant(false);
      refetchAttributes();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to add attribute');
    }
  };

  const selectedCategoryObj = categories.find((c) => c._id === selectedCatId);

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
              Categories & Dynamic Attributes
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
              {categories.length} Departments
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Configure department taxonomy and specify dynamic field templates for catalog SKUs.
          </p>
        </div>

        <button
          onClick={() => setIsCatModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <FolderPlus size={16} />
          <span>New Department</span>
        </button>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column: Categories Tree (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-bold text-sm text-[var(--text-main)] tracking-tight flex items-center gap-2">
              <Layers size={16} className="text-[var(--accent-primary)]" />
              <span>Department Tree</span>
            </h3>
            <span className="text-[11px] text-[var(--text-secondary)]">Click to inspect attributes</span>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {categories.map((cat) => {
              const isSelected = selectedCatId === cat._id;
              return (
                <div
                  key={cat._id}
                  onClick={() => setSelectedCatId(cat._id)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[var(--accent-primary)] bg-[var(--bg-secondary)] shadow-xs'
                      : 'theme-border hover:border-[var(--border-focus)]/30 hover:bg-[var(--bg-secondary)]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100'}
                      alt={cat.name}
                      className="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0 border theme-border shadow-2xs"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-[var(--text-main)] truncate">{cat.name}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] font-mono truncate">/{cat.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat._id);
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete category"
                    >
                      <Trash2 size={13} />
                    </button>
                    <ChevronRight
                      size={15}
                      className={`text-[var(--text-secondary)] transition-transform ${
                        isSelected ? 'translate-x-1 text-[var(--accent-primary)] font-bold' : ''
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dynamic Attributes Builder (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b theme-border">
            <div>
              <h3 className="font-bold text-sm text-[var(--text-main)] tracking-tight">
                {selectedCategoryObj
                  ? `Dynamic Attributes for "${selectedCategoryObj.name}"`
                  : 'Department Attributes'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                These fields are automatically rendered during product creation
              </p>
            </div>

            {selectedCatId && (
              <button
                onClick={() => setIsAttrModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus size={14} />
                <span>Add Attribute</span>
              </button>
            )}
          </div>

          {!selectedCatId ? (
            <EmptyState
              icon={Sliders}
              title="Select a Department"
              description="Click on any category on the left to view and manage its custom dynamic attributes schema."
            />
          ) : attributes.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No dynamic attributes yet"
              description="Define custom specifications such as Brand, Material, Weight, or Size for products in this category."
              actionLabel="Add First Attribute"
              onAction={() => setIsAttrModalOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {attributes.map((attr) => (
                <div
                  key={attr._id}
                  className="p-4 rounded-2xl bg-[var(--bg-secondary)] border theme-border flex items-center justify-between text-xs hover:border-[var(--accent-primary)]/30 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--text-main)] text-xs">{attr.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-200 dark:bg-neutral-800 text-[var(--text-main)]">
                        {attr.type}
                      </span>
                      {attr.isRequired && (
                        <span className="text-[10px] font-bold text-rose-500">Required</span>
                      )}
                      {attr.isVariantAttribute && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          Variant Option
                        </span>
                      )}
                    </div>
                    {attr.predefinedValues && attr.predefinedValues.length > 0 && (
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        Options: {attr.predefinedValues.join(', ')}
                      </p>
                    )}
                  </div>
                  {attr.unit && <span className="font-mono text-gray-400 text-[11px]">{attr.unit}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Department */}
      <AnimatePresence>
        {isCatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCatModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md p-6 rounded-3xl theme-surface border theme-border shadow-2xl space-y-4 z-10 text-xs"
            >
              <div className="flex justify-between items-center pb-2 border-b theme-border">
                <h3 className="font-bold text-sm text-[var(--text-main)]">Add New Department</h3>
                <button
                  onClick={() => setIsCatModalOpen(false)}
                  className="w-7 h-7 rounded-full border theme-border flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-3.5">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g. Gaming & Consoles"
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Slug Key (URL)
                  </label>
                  <input
                    type="text"
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    placeholder="e.g. gaming-consoles"
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Description
                  </label>
                  <input
                    type="text"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Brief description"
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Banner Image URL
                  </label>
                  <input
                    type="text"
                    value={catImage}
                    onChange={(e) => setCatImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card focus:outline-none"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCatModalOpen(false)}
                    className="flex-1 py-2 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingCat}
                    className="flex-1 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-bold hover:opacity-90 shadow-sm"
                  >
                    {isCreatingCat ? 'Creating...' : 'Create Department'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: New Attribute */}
      <AnimatePresence>
        {isAttrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAttrModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md p-6 rounded-3xl theme-surface border theme-border shadow-2xl space-y-4 z-10 text-xs"
            >
              <div className="flex justify-between items-center pb-2 border-b theme-border">
                <h3 className="font-bold text-sm text-[var(--text-main)]">
                  Add Dynamic Attribute
                </h3>
                <button
                  onClick={() => setIsAttrModalOpen(false)}
                  className="w-7 h-7 rounded-full border theme-border flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleAddAttribute} className="space-y-3.5">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Attribute Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={attrName}
                    onChange={(e) => setAttrName(e.target.value)}
                    placeholder="e.g. Storage Capacity, Shoe Size"
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      Input Type
                    </label>
                    <select
                      value={attrType}
                      onChange={(e) => setAttrType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-semibold focus:outline-none"
                    >
                      <option value="text">Single Text</option>
                      <option value="dropdown">Dropdown Select</option>
                      <option value="multi-select">Multi-Select</option>
                      <option value="number">Numeric</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      Unit (Optional)
                    </label>
                    <input
                      type="text"
                      value={attrUnit}
                      onChange={(e) => setAttrUnit(e.target.value)}
                      placeholder="e.g. GB, kg, UK"
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Predefined Options (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={attrValuesStr}
                    onChange={(e) => setAttrValuesStr(e.target.value)}
                    placeholder="128GB, 256GB, 512GB, 1TB"
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={attrIsRequired}
                      onChange={(e) => setAttrIsRequired(e.target.checked)}
                      className="rounded accent-[var(--accent-primary)]"
                    />
                    <span>Required Field</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={attrIsVariant}
                      onChange={(e) => setAttrIsVariant(e.target.checked)}
                      className="rounded accent-[var(--accent-primary)]"
                    />
                    <span>Variant Attribute</span>
                  </label>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAttrModalOpen(false)}
                    className="flex-1 py-2 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingAttr}
                    className="flex-1 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-bold hover:opacity-90 shadow-sm"
                  >
                    {isAddingAttr ? 'Saving...' : 'Add Attribute'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategoriesPage;
