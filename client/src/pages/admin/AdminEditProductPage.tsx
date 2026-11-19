import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Package, ArrowLeft, Save, DollarSign, Tag, FileText, CheckCircle2 } from 'lucide-react';
import { useGetProductBySlugQuery } from '../../redux/api/productApi';
import { useUpdateProductMutation } from '../../redux/api/adminApi';
import { ProductVariantManager } from '../../components/admin/variants/ProductVariantManager';
import type { VariantItemData } from '../../components/admin/variants/VariantOptionForm';
import { toast } from 'sonner';

export const AdminEditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: productData, isLoading, refetch } = useGetProductBySlugQuery(
    { slug: id || '' },
    { skip: !id }
  );
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const product = productData?.product;
  const initialVariants = productData?.variants || [];

  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [description, setDescription] = useState('');
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<VariantItemData[]>([]);

  useEffect(() => {
    if (product) {
      setTitle(product.title || '');
      setBrand(product.brand || '');
      setBasePrice(product.basePrice || 0);
      setOriginalPrice(product.originalPrice || product.basePrice || 0);
      setDiscountPercentage(product.discountPercentage || 0);
      setDescription(product.description || '');
      setHasVariants(Boolean(product.hasVariants));

      if (initialVariants && initialVariants.length > 0) {
        setVariants(
          initialVariants.map((v) => ({
            _id: v._id,
            sku: v.sku,
            title: v.title,
            attributes: v.attributes || {},
            price: v.price,
            originalPrice: v.originalPrice || v.price,
            stock: v.stock,
            isAvailable: v.isAvailable !== false,
          }))
        );
      }
    }
  }, [product, initialVariants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const payload: any = {
        title,
        brand,
        basePrice: Number(basePrice),
        originalPrice: Number(originalPrice),
        discountPercentage: Number(discountPercentage),
        description,
        hasVariants,
      };

      if (hasVariants && variants.length > 0) {
        payload.variants = variants.map((v) => ({
          _id: v._id,
          sku: v.sku,
          title: v.title,
          attributes: v.attributes,
          price: Number(v.price),
          originalPrice: Number(v.originalPrice || v.price),
          stock: Number(v.stock),
          isAvailable: v.isAvailable !== false,
        }));
      }

      await updateProduct({
        id,
        data: payload,
      }).unwrap();

      toast.success('Product and variants updated successfully!');
      refetch();
      navigate('/admin/products');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update product');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-[var(--text-secondary)]">
        Loading product and variant records...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="font-bold text-base text-[var(--text-main)]">Product not found</p>
        <Link
          to="/admin/products"
          className="text-xs text-[var(--accent-primary)] font-bold hover:underline"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            title="Back to Catalog"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
              Edit Product & Variants
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
              SKU: {product.slug} ({id})
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isUpdating}
          className="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <Save size={15} />
          <span>{isUpdating ? 'Saving...' : 'Save Product & Variants'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Details Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-5 text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
              <Package size={16} className="text-[var(--accent-primary)]" />
              <span>Core Product Details</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1 text-[var(--text-main)]">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border theme-border bg-[var(--bg-secondary)] text-[var(--text-main)] font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border bg-[var(--bg-secondary)] text-[var(--text-main)] text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border bg-[var(--bg-secondary)] text-[var(--accent-primary)] font-bold text-xs focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[var(--text-main)]">
                  Marketing Description
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border theme-border bg-[var(--bg-secondary)] text-[var(--text-main)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Variant Management Section */}
          <ProductVariantManager
            hasVariants={hasVariants}
            onHasVariantsChange={setHasVariants}
            variants={variants}
            onVariantsChange={setVariants}
            productSlug={product.slug}
            basePrice={basePrice}
          />
        </div>

        {/* Thumbnail Preview & Info (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
            <Package size={16} className="text-[var(--accent-primary)]" />
            <span>Catalog Preview</span>
          </h2>

          <div className="rounded-2xl border theme-border bg-white dark:bg-neutral-900 p-3 aspect-square flex items-center justify-center overflow-hidden">
            <img
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'}
              alt={product.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border theme-border space-y-1.5 text-[11px]">
            <p className="flex justify-between">
              <span>Status:</span>
              <strong className="text-[var(--text-main)] font-semibold">
                {product.status || 'AVAILABLE'}
              </strong>
            </p>
            <p className="flex justify-between">
              <span>Variants Count:</span>
              <strong className="text-[var(--accent-primary)] font-bold">
                {hasVariants ? `${variants.length} active` : 'Disabled (Single SKU)'}
              </strong>
            </p>
            <p className="flex justify-between">
              <span>Rating:</span>
              <strong className="text-amber-500">★ {product.rating?.toFixed(1) || '0.0'} ({product.reviewCount || 0} reviews)</strong>
            </p>
            <p className="flex justify-between">
              <span>Department:</span>
              <strong className="text-[var(--text-main)]">{product.category?.name || 'General'}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditProductPage;
