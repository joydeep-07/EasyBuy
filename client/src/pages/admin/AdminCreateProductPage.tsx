import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Upload,
  ArrowLeft,
  Sliders,
  DollarSign,
  Boxes,
  ShieldCheck,
  Image as ImageIcon,
  HelpCircle,
} from 'lucide-react';
import {
  useGetCategoriesQuery,
  useGetCategoryAttributesQuery,
} from '../../redux/api/categoryApi';
import { useCreateProductMutation, useUploadImagesMutation } from '../../redux/api/adminApi';
import { toast } from 'sonner';

interface GeneratedVariantRow {
  sku: string;
  title: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
  isAvailable: boolean;
  images: string[];
}

export const AdminCreateProductPage: React.FC = () => {
  const navigate = useNavigate();

  // Basic Details State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number>(999);
  const [originalPrice, setOriginalPrice] = useState<number>(1499);
  const [discountPercentage, setDiscountPercentage] = useState<number>(33);
  const [initialStock, setInitialStock] = useState<number>(20);
  const [warranty, setWarranty] = useState('1 Year Manufacturer Warranty');
  const [returnPolicy, setReturnPolicy] = useState('7 Days Replacement Policy');

  // Highlights & Specs
  const [highlightsText, setHighlightsText] = useState(
    'High performance engineering\nPremium durable build\nCertified warranty'
  );
  const [specs, setSpecs] = useState<{ name: string; value: string }[]>([
    { name: 'Model Year', value: '2026' },
    { name: 'Country of Origin', value: 'India' },
  ]);

  // Images state
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Dynamic Attributes State
  const [dynamicAttributes, setDynamicAttributes] = useState<Record<string, any>>({});

  // Multiple Variations State
  const [hasVariants, setHasVariants] = useState(false);
  const [variantAttributesInput, setVariantAttributesInput] = useState<{ name: string; valuesString: string }[]>([
    { name: 'Colour', valuesString: 'Black, White, Navy Blue' },
    { name: 'Size', valuesString: 'M, L, XL' },
  ]);
  const [generatedVariants, setGeneratedVariants] = useState<GeneratedVariantRow[]>([]);

  // Queries & Mutations
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: attributesData, refetch: refetchAttributes } = useGetCategoryAttributesQuery(categoryId, {
    skip: !categoryId,
  });
  const [createProduct, { isLoading: isSubmitting }] = useCreateProductMutation();
  const [uploadImages, { isLoading: isUploading }] = useUploadImagesMutation();

  // Auto-fill slug from title
  useEffect(() => {
    if (title) {
      setSlug(
        title
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  }, [title]);

  // When category changes, reload attributes
  useEffect(() => {
    if (categoryId) {
      refetchAttributes();
      setDynamicAttributes({});
    }
  }, [categoryId, refetchAttributes]);

  // Auto-calculate discount percentage when prices change
  useEffect(() => {
    if (originalPrice > 0 && basePrice > 0 && originalPrice > basePrice) {
      const calcDiscount = Math.round(((originalPrice - basePrice) / originalPrice) * 100);
      setDiscountPercentage(calcDiscount);
    }
  }, [basePrice, originalPrice]);

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    try {
      new URL(imageUrlInput.trim());
      setImageUrls((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
      toast.success('Image added to gallery');
    } catch {
      toast.error('Please enter a valid HTTP/HTTPS image URL');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSpecRow = () => {
    setSpecs((prev) => [...prev, { name: '', value: '' }]);
  };

  const handleRemoveSpecRow = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, field: 'name' | 'value', value: string) => {
    setSpecs((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleGenerateVariants = () => {
    if (!variantAttributesInput || variantAttributesInput.length === 0) {
      toast.error('Add at least one attribute to generate variants');
      return;
    }

    const attrMap: { name: string; values: string[] }[] = variantAttributesInput
      .filter((a) => a.name.trim() && a.valuesString.trim())
      .map((a) => ({
        name: a.name.trim(),
        values: a.valuesString
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
      }));

    if (attrMap.length === 0) {
      toast.error('Provide attribute names and comma-separated options');
      return;
    }

    const cartesian = (arr: { name: string; values: string[] }[]): Record<string, string>[] => {
      return arr.reduce(
        (acc, curr) => {
          return acc.flatMap((prev) => {
            return curr.values.map((val) => ({
              ...prev,
              [curr.name]: val,
            }));
          });
        },
        [{}] as Record<string, string>[]
      );
    };

    const combinations = cartesian(attrMap);
    const prefix = brand ? brand.slice(0, 3).toUpperCase() : 'SKU';

    const rows: GeneratedVariantRow[] = combinations.map((attrs) => {
      const skuSuffix = Object.values(attrs)
        .map((v) => v.slice(0, 3).toUpperCase())
        .join('-');
      const sku = `${prefix}-${skuSuffix}-${Math.floor(100 + Math.random() * 900)}`;

      return {
        sku,
        title: `${title || 'Product'} (${Object.values(attrs).join(' / ')})`,
        attributes: attrs,
        price: basePrice,
        stock: 15,
        isAvailable: true,
        images: imageUrls,
      };
    });

    setGeneratedVariants(rows);
    toast.success(`Generated ${rows.length} product variation combinations!`);
  };

  const handleVariantRowChange = (index: number, field: keyof GeneratedVariantRow, value: any) => {
    setGeneratedVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !categoryId || !basePrice) {
      toast.error('Title, Department, and Base Price are required');
      return;
    }

    const highlights = highlightsText
      .split('\n')
      .map((h) => h.trim())
      .filter(Boolean);

    const validSpecs = specs.filter((s) => s.name.trim() && s.value.trim());

    try {
      const payload: any = {
        title,
        slug,
        brand: brand || 'EasyBuy Brand',
        category: categoryId,
        subcategory: subcategoryId || undefined,
        description,
        highlights,
        specifications: validSpecs,
        dynamicAttributes,
        images: imageUrls,
        basePrice: Number(basePrice),
        originalPrice: Number(originalPrice || basePrice),
        discountPercentage: Number(discountPercentage || 0),
        hasVariants,
        initialStock: Number(initialStock),
        warranty,
        returnPolicy,
      };

      if (hasVariants && generatedVariants.length > 0) {
        payload.variants = generatedVariants.map((v) => ({
          sku: v.sku,
          title: v.title,
          attributes: v.attributes,
          price: Number(v.price),
          stock: Number(v.stock),
          isAvailable: v.isAvailable,
          images: v.images,
        }));
      }

      await createProduct(payload).unwrap();
      toast.success('Product created with attributes & variants successfully!');
      navigate('/admin/products');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create product');
    }
  };

  const categories = categoriesData?.categories || [];
  const dynamicAttrs = attributesData?.attributes || [];

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* 1. Header with Breadcrumb and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
            title="Back to Products"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
              Create New Product
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Forms adapt dynamically based on selected Department's schema.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs disabled:opacity-50 self-start sm:self-auto"
        >
          {isSubmitting ? 'Publishing SKU...' : 'Publish Product'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Two-Column Grid: Main Details (Left 8 cols), Media & Quick Summary (Right 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Core Details, Pricing, Attributes, Specs (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1: Basic Information */}
            <div className="p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
                <Package size={16} className="text-[var(--accent-primary)]" />
                <span>Basic SKU Details</span>
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Nike Dri-FIT Men Classic Performance Athletic T-Shirt"
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      Brand *
                    </label>
                    <input
                      type="text"
                      required
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Nike, Apple, Samsung"
                      className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      Slug Key (URL)
                    </label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Department / Primary Category *
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40"
                  >
                    <option value="">Select a Department to load dynamic fields</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Marketing Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a comprehensive product description, materials, and care guide..."
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Pricing, Discount & Initial Stock */}
            <div className="p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
                <DollarSign size={16} className="text-[var(--accent-primary)]" />
                <span>Pricing & Stock Level</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card text-xs font-bold text-[var(--accent-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Original MRP (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Discount %
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Inventory Units
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={initialStock}
                    onChange={(e) => setInitialStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Dynamic Category Attributes */}
            {dynamicAttrs.length > 0 && (
              <div className="p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
                    <Sliders size={16} className="text-[var(--accent-primary)]" />
                    <span>Department Attributes ({dynamicAttrs.length})</span>
                  </h2>
                  <span className="text-[11px] text-[var(--text-secondary)]">Auto-generated schema</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dynamicAttrs.map((attr) => (
                    <div key={attr._id} className="space-y-1">
                      <label className="block font-semibold text-[var(--text-main)]">
                        {attr.name} {attr.isRequired && <span className="text-red-500">*</span>}
                        {attr.unit && <span className="text-gray-400 font-normal ml-1">({attr.unit})</span>}
                      </label>

                      {attr.type === 'dropdown' ? (
                        <select
                          value={dynamicAttributes[attr.slug] || ''}
                          onChange={(e) =>
                            setDynamicAttributes({ ...dynamicAttributes, [attr.slug]: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card text-xs focus:outline-none"
                        >
                          <option value="">Select {attr.name}</option>
                          {attr.predefinedValues?.map((pv) => (
                            <option key={pv} value={pv}>
                              {pv}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={attr.type === 'number' ? 'number' : 'text'}
                          value={dynamicAttributes[attr.slug] || ''}
                          onChange={(e) =>
                            setDynamicAttributes({ ...dynamicAttributes, [attr.slug]: e.target.value })
                          }
                          placeholder={`Enter ${attr.name}`}
                          className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card text-xs focus:outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 4: Specifications & Highlights */}
            <div className="p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                <span>Highlights & Technical Specs</span>
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Bullet Highlights (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={highlightsText}
                    onChange={(e) => setHighlightsText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card text-xs focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-[var(--text-main)]">
                      Specification Pairs
                    </label>
                    <button
                      type="button"
                      onClick={handleAddSpecRow}
                      className="text-xs text-[var(--accent-primary)] font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <Plus size={13} />
                      <span>Add Row</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {specs.map((sp, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Spec Name (e.g. Battery)"
                          value={sp.name}
                          onChange={(e) => handleSpecChange(idx, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border theme-border theme-card text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. 5000 mAh)"
                          value={sp.value}
                          onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border theme-border theme-card text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecRow(idx)}
                          className="p-2 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Media Gallery, Variations & Live Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Media Gallery */}
            <div className="p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
                <ImageIcon size={16} className="text-[var(--accent-primary)]" />
                <span>Product Media ({imageUrls.length})</span>
              </h2>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 rounded-xl border theme-border theme-card text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3.5 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-semibold text-xs hover:opacity-90 transition-opacity"
                  >
                    Add
                  </button>
                </div>

                {/* Preview Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {imageUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-2xl border theme-border p-1 bg-white overflow-hidden group shadow-2xs aspect-square flex items-center justify-center"
                    >
                      <img
                        src={url}
                        alt="Product preview"
                        className="w-full h-full object-contain rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&auto=format&fit=crop&q=80';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <Trash2 size={12} />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-[var(--accent-primary)] text-white text-[9px] font-bold">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Variation Setup */}
            <div className="p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
                  <Boxes size={16} className="text-purple-500" />
                  <span>Variant Matrix</span>
                </h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasVariants}
                    onChange={(e) => setHasVariants(e.target.checked)}
                    className="rounded accent-[var(--accent-primary)]"
                  />
                  <span className="font-semibold text-xs">Enable Multi-Variant</span>
                </label>
              </div>

              {hasVariants && (
                <div className="space-y-3 pt-2">
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Specify options separated by commas (e.g. Black, White) and click Generate.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateVariants}
                    className="w-full py-2.5 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] font-semibold text-xs transition-colors"
                  >
                    Generate Combinations Matrix
                  </button>

                  {generatedVariants.length > 0 && (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold text-center">
                      ✓ {generatedVariants.length} variation combinations active
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Policy & Warranty */}
            <div className="p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>Warranty & Policy</span>
              </h2>

              <div className="space-y-2">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Warranty Terms
                  </label>
                  <input
                    type="text"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Return Policy
                  </label>
                  <input
                    type="text"
                    value={returnPolicy}
                    onChange={(e) => setReturnPolicy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateProductPage;
