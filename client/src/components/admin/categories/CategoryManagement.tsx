import React, { useState } from "react";
import {
  Layers,
  Plus,
  FolderPlus,
  Sliders,
  Sparkles,
  Package,
  CheckCircle2,
  X,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryTable } from "./CategoryTable";
import { CategoryModal } from "./CategoryModal";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";
import { EmptyState } from "../EmptyState";
import {
  useGetCategoriesQuery,
  useGetCategoryAttributesQuery,
} from "../../../redux/api/categoryApi";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useAddCategoryAttributeMutation,
} from "../../../redux/api/adminApi";
import { toast } from "sonner";
import type { Category } from "../../../types";

export const CategoryManagement: React.FC = () => {
  // View mode state: defaults to 'card'
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );

  // Dynamic attributes drawer / modal state
  const [selectedCatForAttrs, setSelectedCatForAttrs] =
    useState<Category | null>(null);
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [attrName, setAttrName] = useState("");
  const [attrType, setAttrType] = useState("text");
  const [attrUnit, setAttrUnit] = useState("");
  const [attrValuesStr, setAttrValuesStr] = useState("");
  const [attrIsRequired, setAttrIsRequired] = useState(false);
  const [attrIsVariant, setAttrIsVariant] = useState(false);

  // Queries & Mutations
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useGetCategoriesQuery({ all: true });
  const {
    data: attributesData,
    isLoading: isLoadingAttrs,
    refetch: refetchAttributes,
  } = useGetCategoryAttributesQuery(selectedCatForAttrs?._id || "", {
    skip: !selectedCatForAttrs?._id,
  });

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();
  const [addAttribute, { isLoading: isAddingAttr }] =
    useAddCategoryAttributeMutation();

  const categories = categoriesData?.categories || [];
  const attributes = attributesData?.attributes || [];

  // Summary Metrics
  const totalCategories = categories.length;
  const activeCategories = categories.filter(
    (c) => c.isActive !== false,
  ).length;
  const featuredCategories = categories.filter((c) => c.isFeatured).length;
  const totalLinkedProducts = categories.reduce(
    (sum, c) => sum + (c.productCount || 0),
    0,
  );

  // Create or Update Submission
  const handleFormSubmit = async (formData: Partial<Category>) => {
    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory._id,
          data: formData,
        }).unwrap();
        toast.success(`Category "${formData.name}" updated successfully!`);
      } else {
        await createCategory(formData).unwrap();
        toast.success(`Category "${formData.name}" created successfully!`);
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      refetchCategories();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save category");
    }
  };

  // Safe Deletion Submission
  const handleConfirmDelete = async (
    categoryId: string,
    reassignTo?: string,
  ) => {
    try {
      const res = await deleteCategory({ id: categoryId, reassignTo }).unwrap();
      toast.success(res.message || "Category removed successfully");
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
      if (selectedCatForAttrs?._id === categoryId) {
        setSelectedCatForAttrs(null);
      }
      refetchCategories();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete category");
    }
  };

  // Add Dynamic Attribute to Selected Category
  const handleAddAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatForAttrs || !attrName.trim()) {
      toast.error("Attribute name is required");
      return;
    }

    const predefinedValues = attrValuesStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await addAttribute({
        categoryId: selectedCatForAttrs._id,
        data: {
          name: attrName.trim(),
          type: attrType,
          unit: attrUnit.trim(),
          predefinedValues,
          isRequired: attrIsRequired,
          isVariantAttribute: attrIsVariant,
        },
      }).unwrap();

      toast.success(
        `Attribute "${attrName.trim()}" added to ${selectedCatForAttrs.name}`,
      );
      setIsAttrModalOpen(false);
      setAttrName("");
      setAttrType("text");
      setAttrUnit("");
      setAttrValuesStr("");
      setAttrIsRequired(false);
      setAttrIsVariant(false);
      refetchAttributes();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add attribute");
    }
  };

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* 1. Page Header with Title, Stats & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
              Category Management
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
              {totalCategories} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Create, manage, and configure department taxonomy, URL slugs, and
            catalog specifications.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:brightness-105 active:scale-95 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <FolderPlus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* 2. Apple-Style KPI Metric Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl theme-surface border theme-border shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[var(--text-secondary)]">
              Total Categories
            </p>
            <h3 className="text-xl font-bold text-[var(--text-main)] tracking-tight">
              {totalCategories}
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl theme-surface border theme-border shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[var(--text-secondary)]">
              Active & Visible
            </p>
            <h3 className="text-xl font-bold text-[var(--text-main)] tracking-tight">
              {activeCategories}
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl theme-surface border theme-border shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[var(--text-secondary)]">
              Featured Departments
            </p>
            <h3 className="text-xl font-bold text-[var(--text-main)] tracking-tight">
              {featuredCategories}
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl theme-surface border theme-border shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Package size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[var(--text-secondary)]">
              Catalog SKUs
            </p>
            <h3 className="text-xl font-bold text-[var(--text-main)] tracking-tight">
              {totalLinkedProducts}
            </h3>
          </div>
        </div>
      </div>

      {/* 3. Main Category Management Directory (Card & List Toggle) */}
      <div className="p-5 sm:p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b theme-border">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-main)] tracking-tight flex items-center gap-2">
              <Layers size={16} className="text-[var(--accent-primary)]" />
              <span>Catalog Categories Directory</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Live database records with product count telemetry and instant
              editing
            </p>
          </div>

          {/* Apple-Style Segmented View Toggle */}
          <div
            role="group"
            aria-label="Category view switcher"
            className="inline-flex items-center p-1 rounded-xl bg-[var(--bg-secondary)] border theme-border self-start sm:self-auto"
          >
            <button
              type="button"
              onClick={() => setViewMode("card")}
              aria-pressed={viewMode === "card"}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "card"
                  ? "bg-[var(--bg-primary)] text-[var(--text-main)] shadow-xs border theme-border"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-transparent"
              }`}
            >
              <LayoutGrid size={14} />
              <span>Card View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-pressed={viewMode === "list"}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-[var(--bg-primary)] text-[var(--text-main)] shadow-xs border theme-border"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-transparent"
              }`}
            >
              <List size={14} />
              <span>List View</span>
            </button>
          </div>
        </div>

        {viewMode === "list" ? (
          <CategoryTable
            categories={categories}
            isLoading={isLoadingCategories}
            onEdit={(cat) => {
              setEditingCategory(cat);
              setIsModalOpen(true);
            }}
            onDelete={(cat) => {
              setCategoryToDelete(cat);
              setIsDeleteDialogOpen(true);
            }}
            onSelectCategoryForAttributes={(cat) => {
              setSelectedCatForAttrs(cat);
            }}
          />
        ) : isLoadingCategories ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border theme-border bg-[var(--bg-secondary)] p-4 space-y-3 animate-pulse"
              >
                <div className="w-full h-36 rounded-xl bg-black/[0.06] dark:bg-white/[0.06]" />
                <div className="h-4 w-2/3 rounded bg-black/[0.06] dark:bg-white/[0.06]" />
                <div className="h-3 w-1/2 rounded bg-black/[0.06] dark:bg-white/[0.06]" />
                <div className="pt-2 flex gap-2">
                  <div className="h-8 flex-1 rounded-xl bg-black/[0.06] dark:bg-white/[0.06]" />
                  <div className="h-8 w-8 rounded-xl bg-black/[0.06] dark:bg-white/[0.06]" />
                  <div className="h-8 w-8 rounded-xl bg-black/[0.06] dark:bg-white/[0.06]" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No categories created yet"
            description="Create your first department to organize products and configure custom catalog attributes."
            actionLabel="Add New Category"
            onAction={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const isActive = cat.isActive !== false;
              const isSelectedForAttrs = selectedCatForAttrs?._id === cat._id;

              return (
                <div
                  key={cat._id}
                  className={`group rounded-2xl bg-[var(--bg-secondary)] border transition-all duration-200 overflow-hidden flex flex-col justify-between hover:shadow-md ${
                    isSelectedForAttrs
                      ? "border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]/30"
                      : "theme-border hover:border-[var(--accent-primary)]/40"
                  }`}
                >
                  <div>
                    {/* Category Thumbnail / Banner */}
                    <div className="relative h-36 w-full bg-black/[0.04] dark:bg-white/[0.04] overflow-hidden border-b theme-border">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-secondary)]/60 gap-1.5">
                          <Layers size={24} strokeWidth={1.6} />
                          <span className="text-[11px] font-medium">
                            No Cover Image
                          </span>
                        </div>
                      )}

                      {/* Status & Featured Pills */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md border ${
                            isActive
                              ? "bg-emerald-500/90 text-white border-emerald-400/40"
                              : "bg-zinc-800/85 text-zinc-200 border-white/15"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-white" : "bg-zinc-400"
                            }`}
                          />
                          {isActive ? "Active" : "Hidden"}
                        </span>

                        {cat.isFeatured && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-white backdrop-blur-md border border-amber-300/40">
                            <Sparkles size={10} />
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-[var(--text-main)] truncate tracking-tight">
                            {cat.name}
                          </h3>
                          <p className="text-[11px] font-mono text-[var(--text-secondary)] truncate mt-0.5">
                            /{cat.slug}
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--bg-primary)] border theme-border text-[11px] font-bold text-[var(--text-main)] shrink-0">
                          <Package
                            size={12}
                            className="text-[var(--accent-primary)]"
                          />
                          {cat.productCount || 0}
                        </span>
                      </div>

                      {cat.description ? (
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                          {cat.description}
                        </p>
                      ) : (
                        <p className="text-xs text-[var(--text-secondary)]/60 italic">
                          No description provided
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-4 pb-4 pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCatForAttrs(cat)}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelectedForAttrs
                          ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]"
                          : "bg-[var(--bg-primary)] text-[var(--text-main)] theme-border hover:border-[var(--accent-primary)]/50 hover:text-[var(--accent-primary)]"
                      }`}
                    >
                      <Sliders size={13} />
                      <span>Attributes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsModalOpen(true);
                      }}
                      title="Edit Category"
                      aria-label={`Edit ${cat.name}`}
                      className="p-2 rounded-xl bg-[var(--bg-primary)] border theme-border text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:border-[var(--accent-primary)]/50 transition-colors cursor-pointer"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCategoryToDelete(cat);
                        setIsDeleteDialogOpen(true);
                      }}
                      title="Delete Category"
                      aria-label={`Delete ${cat.name}`}
                      className="p-2 rounded-xl bg-[var(--bg-primary)] border theme-border text-[var(--text-secondary)] hover:text-rose-500 hover:border-rose-500/40 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Slide-Out / Drawer for Category Dynamic Attributes */}
      <AnimatePresence>
        {selectedCatForAttrs && (
          <div className="p-5 sm:p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b theme-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center shrink-0">
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-main)] tracking-tight">
                    Dynamic Attributes for "{selectedCatForAttrs.name}"
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Specification fields automatically rendered in product
                    creation for this department
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsAttrModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Attribute Field</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCatForAttrs(null)}
                  className="p-1.5 rounded-xl border theme-border text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                  title="Close Attributes Panel"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {isLoadingAttrs ? (
              <div className="py-8 text-center text-xs text-[var(--text-secondary)]">
                Loading attribute definitions...
              </div>
            ) : attributes.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No custom dynamic attributes defined yet"
                description={`Products added under "${selectedCatForAttrs.name}" currently only use standard fields.`}
                actionLabel="Add First Attribute"
                onAction={() => setIsAttrModalOpen(true)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {attributes.map((attr) => (
                  <div
                    key={attr._id}
                    className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border theme-border space-y-1.5 text-xs hover:border-[var(--accent-primary)]/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[var(--text-main)]">
                        {attr.name}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[var(--text-secondary)]">
                        {attr.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px]">
                      {attr.isRequired && (
                        <span className="text-rose-500 font-bold">
                          Required
                        </span>
                      )}
                      {attr.isVariantAttribute && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold">
                          Variant
                        </span>
                      )}
                      {attr.unit && (
                        <span className="font-mono text-[var(--text-secondary)]">
                          Unit: {attr.unit}
                        </span>
                      )}
                    </div>

                    {attr.predefinedValues &&
                      attr.predefinedValues.length > 0 && (
                        <p className="text-[11px] text-[var(--text-secondary)] truncate pt-0.5">
                          Options: {attr.predefinedValues.join(", ")}
                        </p>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* 5. Create / Edit Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        initialData={editingCategory}
        existingCategories={categories}
        onSubmit={handleFormSubmit}
        isLoading={isCreating || isUpdating}
      />

      {/* 6. Delete Category Dialog */}
      <DeleteCategoryDialog
        isOpen={isDeleteDialogOpen}
        category={categoryToDelete}
        allCategories={categories}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirmDelete={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* 7. Add Dynamic Attribute Modal */}
      <AnimatePresence>
        {isAttrModalOpen && selectedCatForAttrs && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAttrModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-md p-6 rounded-3xl theme-surface border theme-border shadow-2xl z-10 text-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b theme-border">
                <h3 className="font-bold text-sm text-[var(--text-main)]">
                  Add Dynamic Attribute to "{selectedCatForAttrs.name}"
                </h3>
                <button
                  type="button"
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
                    placeholder="e.g. Storage Capacity, Shoe Size, Wattage"
                    className="w-full px-3 py-2 rounded-xl border theme-border bg-[var(--bg-secondary)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
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
                      className="w-full px-3 py-2 rounded-xl border theme-border bg-[var(--bg-secondary)] text-[var(--text-main)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    >
                      <option value="text">Single Text</option>
                      <option value="dropdown">Dropdown Select</option>
                      <option value="multi-select">Multi-Select</option>
                      <option value="number">Numeric</option>
                      <option value="boolean">Boolean (Yes/No)</option>
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
                      placeholder="e.g. GB, kg, W"
                      className="w-full px-3 py-2 rounded-xl border theme-border bg-[var(--bg-secondary)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
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
                    className="w-full px-3 py-2 rounded-xl border theme-border bg-[var(--bg-secondary)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  />
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={attrIsRequired}
                      onChange={(e) => setAttrIsRequired(e.target.checked)}
                      className="rounded accent-[var(--accent-primary)] cursor-pointer"
                    />
                    <span>Required Field</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={attrIsVariant}
                      onChange={(e) => setAttrIsVariant(e.target.checked)}
                      className="rounded accent-[var(--accent-primary)] cursor-pointer"
                    />
                    <span>Variant Attribute</span>
                  </label>
                </div>

                <div className="flex gap-2.5 pt-2 border-t theme-border">
                  <button
                    type="button"
                    onClick={() => setIsAttrModalOpen(false)}
                    className="flex-1 py-2 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingAttr}
                    className="flex-1 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-semibold hover:opacity-90 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isAddingAttr ? "Saving..." : "Save Attribute"}
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
