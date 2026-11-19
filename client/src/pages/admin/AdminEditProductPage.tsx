import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Package, ArrowLeft, Save, DollarSign, Tag, FileText } from 'lucide-react';
import { useGetProductsQuery } from '../../redux/api/productApi';
import { useUpdateProductMutation } from '../../redux/api/adminApi';
import { toast } from 'sonner';

export const AdminEditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: productsData, isLoading } = useGetProductsQuery({ limit: 100 });
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const product = productsData?.products?.find((p) => p._id === id);

  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setBrand(product.brand);
      setBasePrice(product.basePrice);
      setOriginalPrice(product.originalPrice || product.basePrice);
      setDiscountPercentage(product.discountPercentage || 0);
      setDescription(product.description || '');
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await updateProduct({
        id,
        data: {
          title,
          brand,
          basePrice: Number(basePrice),
          originalPrice: Number(originalPrice),
          discountPercentage: Number(discountPercentage),
          description,
        },
      }).unwrap();

      toast.success('Product updated successfully!');
      navigate('/admin/products');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update product');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-[var(--text-secondary)]">
        Loading product details...
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
            className="p-2 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
            title="Back to Catalog"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
              Edit Product SKU
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
              SKU ID: {id}
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isUpdating}
          className="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Save size={15} />
          <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Details Form (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-5 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
            <Package size={16} className="text-[var(--accent-primary)]" />
            <span>Product Specifications</span>
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
                className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 transition-all"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card text-xs focus:outline-none"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card font-bold text-[var(--accent-primary)] text-xs focus:outline-none"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[var(--text-main)]">
                Marketing Description
              </label>
              <textarea
                rows={6}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Thumbnail Preview & Info (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
            <Package size={16} className="text-[var(--accent-primary)]" />
            <span>Catalog Preview</span>
          </h2>

          <div className="rounded-2xl border theme-border bg-white p-3 aspect-square flex items-center justify-center overflow-hidden">
            <img
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'}
              alt={product.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border theme-border space-y-1.5 text-[11px]">
            <p>
              Status:{' '}
              <strong className="text-[var(--text-main)] font-semibold">
                {product.status || 'AVAILABLE'}
              </strong>
            </p>
            <p>
              Rating: <strong className="text-amber-500">★ {product.rating?.toFixed(1) || '0.0'}</strong> ({product.reviewCount || 0} reviews)
            </p>
            <p>
              Department: <strong className="text-[var(--text-main)]">{product.category?.name || 'General'}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditProductPage;
