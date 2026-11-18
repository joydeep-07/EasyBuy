import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Upload,
  ArrowRight,
  Sliders,
  DollarSign,
  Boxes,
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
  const [highlightsText, setHighlightsText] = useState('High performance engineering\nPremium durable build\nCertified warranty');
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

  // Handle dynamic attribute value change
  const handleDynamicChange = (slug: string, value: any) => {
    setDynamicAttributes((prev) => ({
      ...prev,
      [slug]: value,
    }));
  };

  // Add Specification row
  const addSpecRow = () => {
    setSpecs((prev) => [...prev, { name: '', value: '' }]);
  };

  const removeSpecRow = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Image URL
  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImageUrls((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('images', e.target.files[i]);
    }
    try {
      const res = await uploadImages(formData).unwrap();
      if (res.urls) {
        setImageUrls((prev) => [...prev, ...res.urls]);
        toast.success(`${res.urls.length} images uploaded!`);
      }
    } catch (err: any) {
      toast.error('Upload failed. Check server file size limits.');
    }
  };

  // Variant Matrix Generator
  const generateVariantCombinations = () => {
    const validInputs = variantAttributesInput.filter(
      (va) => va.name.trim() && va.valuesString.trim()
    );

    if (validInputs.length === 0) {
      toast.error('Please enter at least one variation attribute (e.g. Size or Colour)');
      return;
    }

    const attributeArrays = validInputs.map((va) => ({
      name: va.name.trim(),
      values: va.valuesString
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }));

    // Cartesian product of variation values
    let combinations: Record<string, string>[] = [{}];

    attributeArrays.forEach((attr) => {
      const nextCombos: Record<string, string>[] = [];
      combinations.forEach((combo) => {
        attr.values.forEach((val) => {
          nextCombos.push({ ...combo, [attr.name]: val });
        });
      });
      combinations = nextCombos;
    });

    // Transform into editable variant rows
    const prefix = (brand || 'PROD').slice(0, 3).toUpperCase();
    const rows: GeneratedVariantRow[] = combinations.map((attrs, idx) => {
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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[var(--text-main)]">Add New Product</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Forms adapt dynamically based on selected Department's attribute schema
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 text-xs">
        {/* Section 1: Basic Information */}
        <div className="p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
            <Package size={16} className="text-[var(--accent-primary)]" /> Basic Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Nike Dri-FIT Men Classic Performance Athletic T-Shirt"
                className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card text-xs focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Brand Name *</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Nike, Apple, Optimum Nutrition"
                className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card text-xs focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Department / Category *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card text-xs font-semibold focus:ring-1 focus:ring-[var(--accent-primary)]"
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
              <label className="block font-semibold mb-1">Slug (URL friendly key)</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Full Product Description *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description, fabric, specifications, benefits..."
              className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card text-xs focus:ring-1 focus:ring-[var(--accent-primary)]"
            />
          </div>
        </div>

        {/* Section 2: DYNAMIC ATTRIBUTES (CRITICAL REQUIREMENT) */}
        <div className="p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
              <Layers size={16} className="text-[var(--accent-primary)]" />
              Dynamic Department Attributes
            </h2>
            <span className="text-[11px] text-[var(--accent-primary)] font-semibold">
              Auto-generated form based on category schema
            </span>
          </div>

          {dynamicAttrs.length === 0 ? (
            <p className="text-[11px] text-[var(--text-secondary)] italic">
              {categoryId
                ? 'No custom dynamic attributes defined for this category yet. You can add them under Categories & Attributes.'
                : 'Please select a Category above to load its specific dynamic attributes.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {dynamicAttrs.map((attr) => (
                <div key={attr._id} className="space-y-1">
                  <label className="block font-semibold text-[var(--text-main)]">
                    {attr.name} {attr.isRequired && <span className="text-red-500">*</span>}
                    {attr.unit && <span className="text-gray-400 font-normal"> ({attr.unit})</span>}
                  </label>

                  {/* Render based on attribute type */}
                  {attr.type === 'dropdown' ? (
                    <select
                      value={dynamicAttributes[attr.slug] || ''}
                      onChange={(e) => handleDynamicChange(attr.slug, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                    >
                      <option value="">Select {attr.name}</option>
                      {attr.predefinedValues.map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  ) : attr.type === 'boolean' ? (
                    <div className="flex items-center gap-3 pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name={attr.slug}
                          checked={dynamicAttributes[attr.slug] === true}
                          onChange={() => handleDynamicChange(attr.slug, true)}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name={attr.slug}
                          checked={dynamicAttributes[attr.slug] === false}
                          onChange={() => handleDynamicChange(attr.slug, false)}
                        />
                        <span>No</span>
                      </label>
                    </div>
                  ) : (
                    <input
                      type={attr.type === 'number' ? 'number' : 'text'}
                      value={dynamicAttributes[attr.slug] || ''}
                      onChange={(e) => handleDynamicChange(attr.slug, e.target.value)}
                      placeholder={`Enter ${attr.name}`}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Pricing & Inventory */}
        <div className="p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
            <DollarSign size={16} className="text-[var(--accent-primary)]" /> Pricing & Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold mb-1">Base Price (₹) *</label>
              <input
                type="number"
                required
                min={0}
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Original Price (₹)</label>
              <input
                type="number"
                min={0}
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Discount %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Default Stock</label>
              <input
                type="number"
                min={0}
                value={initialStock}
                onChange={(e) => setInitialStock(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Product Variations Generator (CRITICAL REQUIREMENT) */}
        <div className="p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
                <Boxes size={16} className="text-[var(--accent-primary)]" />
                Product Variations & SKU Combinations
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Generate combination matrix (e.g. Nike T-Shirt with Colors and Sizes) with individual SKUs and stock.
              </p>
            </div>
            <label className="flex items-center gap-2 font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => setHasVariants(e.target.checked)}
                className="rounded text-[var(--accent-primary)]"
              />
              <span>Enable Variants</span>
            </label>
          </div>

          {hasVariants && (
            <div className="space-y-4 pt-3 border-t theme-border">
              {/* Define Variant Attributes */}
              <div className="space-y-3">
                <span className="font-semibold text-xs">Variation Attributes & Values (Comma Separated):</span>
                {variantAttributesInput.map((va, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      type="text"
                      placeholder="e.g. Colour"
                      value={va.name}
                      onChange={(e) => {
                        const copy = [...variantAttributesInput];
                        copy[idx].name = e.target.value;
                        setVariantAttributesInput(copy);
                      }}
                      className="w-40 px-3 py-2 rounded-xl border theme-border theme-card font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="e.g. Black, White, Navy Blue"
                      value={va.valuesString}
                      onChange={(e) => {
                        const copy = [...variantAttributesInput];
                        copy[idx].valuesString = e.target.value;
                        setVariantAttributesInput(copy);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border theme-border theme-card"
                    />
                    <button
                      type="button"
                      onClick={() => setVariantAttributesInput(variantAttributesInput.filter((_, i) => i !== idx))}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setVariantAttributesInput([...variantAttributesInput, { name: '', valuesString: '' }])}
                    className="px-3.5 py-1.5 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] font-semibold flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Add Another Attribute
                  </button>
                  <button
                    type="button"
                    onClick={generateVariantCombinations}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 flex items-center gap-1.5"
                  >
                    <Sparkles size={14} /> Generate Combination Matrix
                  </button>
                </div>
              </div>

              {/* Generated Variants Table */}
              {generatedVariants.length > 0 && (
                <div className="pt-4 border-t theme-border space-y-2">
                  <h3 className="font-bold text-xs text-[var(--text-main)]">
                    Generated Combinations ({generatedVariants.length} Variants)
                  </h3>
                  <div className="overflow-x-auto rounded-2xl border theme-border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--bg-secondary)] border-b theme-border text-[var(--text-secondary)]">
                        <tr>
                          <th className="p-3">SKU</th>
                          <th className="p-3">Attributes</th>
                          <th className="p-3">Price (₹)</th>
                          <th className="p-3">Stock</th>
                          <th className="p-3">Available?</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y theme-border">
                        {generatedVariants.map((row, i) => (
                          <tr key={i} className="hover:bg-[var(--bg-secondary)]">
                            <td className="p-3">
                              <input
                                type="text"
                                value={row.sku}
                                onChange={(e) => handleVariantRowChange(i, 'sku', e.target.value)}
                                className="px-2 py-1 rounded border theme-border theme-card font-mono text-[11px]"
                              />
                            </td>
                            <td className="p-3 font-semibold text-[var(--text-main)]">
                              {Object.entries(row.attributes).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={row.price}
                                onChange={(e) => handleVariantRowChange(i, 'price', Number(e.target.value))}
                                className="w-24 px-2 py-1 rounded border theme-border theme-card"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={row.stock}
                                onChange={(e) => handleVariantRowChange(i, 'stock', Number(e.target.value))}
                                className="w-20 px-2 py-1 rounded border theme-border theme-card"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={row.isAvailable}
                                onChange={(e) => handleVariantRowChange(i, 'isAvailable', e.target.checked)}
                                className="rounded text-[var(--accent-primary)]"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 5: Images & Media */}
        <div className="p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
            <Upload size={16} className="text-[var(--accent-primary)]" /> Images & Gallery
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="Paste Image URL..."
              className="flex-1 px-3 py-2 rounded-xl border theme-border theme-card"
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="px-4 py-2 rounded-xl bg-[var(--bg-secondary)] border theme-border font-bold hover:bg-gray-200"
            >
              Add URL
            </button>
            <label className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-bold cursor-pointer hover:opacity-90 flex items-center gap-1.5">
              <Upload size={14} />
              <span>{isUploading ? 'Uploading...' : 'Upload Files'}</span>
              <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {imageUrls.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-2xl border theme-border overflow-hidden bg-white p-1">
                <img src={img} alt="preview" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-red-600 text-white"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-3 rounded-2xl border theme-border hover:bg-[var(--bg-secondary)] font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3.5 rounded-2xl bg-[var(--accent-primary)] hover:opacity-90 disabled:opacity-50 text-white font-bold shadow-lg"
          >
            {isSubmitting ? 'Creating Product...' : 'Publish Product to Store'}
          </button>
        </div>
      </form>
    </div>
  );
};
