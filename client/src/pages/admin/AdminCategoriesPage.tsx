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
} from 'lucide-react';
import {
  useGetCategoriesQuery,
  useGetCategoryAttributesQuery,
} from '../../redux/api/categoryApi';
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useAddCategoryAttributeMutation,
} from '../../redux/api/adminApi';
import { toast } from 'sonner';

export const AdminCategoriesPage: React.FC = () => {
  const [selectedCatId, setSelectedCatId] = useState<string>('');

  // Category creation modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catParent, setCatParent] = useState('');

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
        image: catImage,
        parentCategory: catParent || null,
      }).unwrap();

      toast.success('Category created successfully!');
      setIsCatModalOpen(false);
      setCatName('');
      setCatSlug('');
      setCatDesc('');
      setCatImage('');
      setCatParent('');
      refetchCategories();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Delete this category and its associated attributes?')) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-main)]">Departments & Dynamic Attributes</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Configure product category taxonomies and specify dynamic field templates
          </p>
        </div>

        <button
          onClick={() => setIsCatModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:opacity-90 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <FolderPlus size={16} />
          <span>New Department</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Categories List (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[var(--text-main)]">Categories Tree</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {categories.map((cat) => {
              const isSelected = selectedCatId === cat._id;
              return (
                <div
                  key={cat._id}
                  onClick={() => setSelectedCatId(cat._id)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[var(--accent-primary)] bg-[var(--bg-secondary)] shadow-sm'
                      : 'theme-border hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100'}
                      alt={cat.name}
                      className="w-10 h-10 rounded-xl object-cover bg-gray-100"
                    />
                    <div>
                      <p className="font-bold text-xs text-[var(--text-main)]">{cat.name}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] font-mono">slug: {cat.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat._id);
                      }}
                      className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg"
                      title="Delete category"
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight
                      size={16}
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

        {/* Right Column: Category Dynamic Attributes Builder (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[var(--text-main)]">
                {selectedCategoryObj
                  ? `Dynamic Attributes for "${selectedCategoryObj.name}"`
                  : 'Select a Department'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                These fields are automatically rendered during product creation
              </p>
            </div>

            {selectedCatId && (
              <button
                onClick={() => setIsAttrModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Attribute
              </button>
            )}
          </div>

          {!selectedCatId ? (
            <div className="py-16 text-center text-xs text-[var(--text-secondary)] space-y-2">
              <Sliders size={32} className="mx-auto text-gray-400" />
              <p>Click on any Category on the left to inspect and configure its dynamic attributes.</p>
            </div>
          ) : attributes.length === 0 ? (
            <div className="py-16 text-center text-xs text-[var(--text-secondary)] space-y-2">
              <Sparkles size={32} className="mx-auto text-[var(--accent-primary)]" />
              <p>No custom dynamic attributes defined for this department yet.</p>
              <button
                onClick={() => setIsAttrModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-bold"
              >
                Create First Attribute
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {attributes.map((attr) => (
                <div
                  key={attr._id}
                  className="p-4 rounded-2xl bg-[var(--bg-secondary)] border theme-border flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text-main)]">{attr.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-200 dark:bg-gray-800">
                        {attr.type}
                      </span>
                      {attr.isRequired && (
                        <span className="text-[10px] font-bold text-red-500">Required</span>
                      )}
                      {attr.isVariantAttribute && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
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
                  {attr.unit && <span className="font-mono text-gray-400">{attr.unit}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Category */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl theme-surface border theme-border shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-[var(--text-main)]">Add Department</h3>
              <button onClick={() => setIsCatModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Gaming & Consoles"
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Slug</label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="e.g. gaming-consoles"
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Category description"
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Image URL</label>
                <input
                  type="text"
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingCat}
                className="w-full py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-bold"
              >
                {isCreatingCat ? 'Creating...' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Attribute Definition */}
      {isAttrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl theme-surface border theme-border shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-[var(--text-main)]">Add Dynamic Attribute</h3>
              <button onClick={() => setIsAttrModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddAttribute} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Attribute Name *</label>
                <input
                  type="text"
                  required
                  value={attrName}
                  onChange={(e) => setAttrName(e.target.value)}
                  placeholder="e.g. Storage Capacity, Shoe Size, Fabric"
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Input Type</label>
                  <select
                    value={attrType}
                    onChange={(e) => setAttrType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="multi-select">Multi-Select</option>
                    <option value="boolean">Boolean (Yes/No)</option>
                    <option value="measurement">Measurement</option>
                    <option value="date">Date</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Unit (optional)</label>
                  <input
                    type="text"
                    value={attrUnit}
                    onChange={(e) => setAttrUnit(e.target.value)}
                    placeholder="e.g. GB, kg, inch"
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Predefined Values (Comma Separated)</label>
                <input
                  type="text"
                  value={attrValuesStr}
                  onChange={(e) => setAttrValuesStr(e.target.value)}
                  placeholder="e.g. 128GB, 256GB, 512GB, 1TB"
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                />
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attrIsRequired}
                    onChange={(e) => setAttrIsRequired(e.target.checked)}
                    className="rounded text-[var(--accent-primary)]"
                  />
                  <span className="font-semibold">Required field</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attrIsVariant}
                    onChange={(e) => setAttrIsVariant(e.target.checked)}
                    className="rounded text-purple-600"
                  />
                  <span className="font-semibold text-purple-600 dark:text-purple-400">Variant Option</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isAddingAttr}
                className="w-full py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-bold"
              >
                {isAddingAttr ? 'Adding...' : 'Save Attribute Definition'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
