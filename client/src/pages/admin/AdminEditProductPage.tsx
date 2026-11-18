import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, Save } from 'lucide-react';
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
      setOriginalPrice(product.originalPrice);
      setDiscountPercentage(product.discountPercentage);
      setDescription(product.description);
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
    return <div className="p-8 text-center text-xs text-gray-400">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="py-16 text-center space-y-2">
        <p className="font-bold">Product not found</p>
        <button onClick={() => navigate('/admin/products')} className="text-xs text-[var(--accent-primary)] font-bold">
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 rounded-xl border theme-border hover:bg-[var(--bg-secondary)]"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-[var(--text-main)]">Edit Product</h1>
          <p className="text-xs text-[var(--text-secondary)]">ID: {id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-4 text-xs">
        <div>
          <label className="block font-semibold mb-1">Product Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card font-semibold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Brand</label>
            <input
              type="text"
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Base Price (₹)</label>
            <input
              type="number"
              required
              min={0}
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card"
          />
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-bold text-xs hover:opacity-90 flex items-center gap-2"
        >
          <Save size={14} />
          <span>{isUpdating ? 'Saving Changes...' : 'Save Product Changes'}</span>
        </button>
      </form>
    </div>
  );
};
