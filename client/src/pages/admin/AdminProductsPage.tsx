import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  Archive,
  X,
} from 'lucide-react';
import {
  useGetProductsQuery,
} from '../../redux/api/productApi';
import {
  useGetCategoriesQuery,
} from '../../redux/api/categoryApi';
import {
  useUpdateProductAvailabilityMutation,
  useDeleteProductMutation,
} from '../../redux/api/adminApi';
import { toast } from 'sonner';
import type { Product } from '../../types';

export const AdminProductsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  // Availability modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<string>('AVAILABLE');
  const [availabilityReason, setAvailabilityReason] = useState<string>('');

  const { data: productsData, isLoading, refetch } = useGetProductsQuery({
    keyword: search,
    category: categoryFilter,
    page,
    limit: 15,
  });

  const { data: categoriesData } = useGetCategoriesQuery();
  const [updateAvailability, { isLoading: isUpdatingAvailability }] =
    useUpdateProductAvailabilityMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleOpenAvailabilityModal = (p: Product) => {
    setSelectedProduct(p);
    setAvailabilityStatus(p.status || 'AVAILABLE');
    setAvailabilityReason(p.availabilityReason || '');
  };

  const handleSaveAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await updateAvailability({
        id: selectedProduct._id,
        status: availabilityStatus,
        availabilityReason,
      }).unwrap();

      toast.success(`Availability updated to ${availabilityStatus}`);
      setSelectedProduct(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update availability');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to archive this product?')) {
      try {
        await deleteProduct(id).unwrap();
        toast.success('Product archived successfully');
        refetch();
      } catch (err: any) {
        toast.error('Failed to archive product');
      }
    }
  };

  const products = productsData?.products || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-main)]">Product Management</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Manage catalogue, inventory availability, multi-variant combinations, and prices
          </p>
        </div>

        <Link
          to="/admin/products/create"
          className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:opacity-90 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl theme-surface border theme-border flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, brand, or SKU..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border theme-border theme-card text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border theme-border theme-card text-xs focus:outline-none"
        >
          <option value="">All Departments</option>
          {categoriesData?.categories?.map((cat: any) => (
            <option key={cat._id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl theme-surface border theme-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b theme-border text-[var(--text-secondary)]">
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Rating</th>
                <th className="p-4 font-semibold">Availability Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">No products found matching filters.</td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    {/* Title & Image */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                          alt={p.title}
                          className="w-12 h-12 rounded-xl object-contain bg-white p-1 border shrink-0"
                        />
                        <div className="truncate max-w-xs">
                          <p className="font-bold text-[var(--text-main)] truncate">{p.title}</p>
                          <p className="text-[10px] text-[var(--accent-primary)] font-bold uppercase">{p.brand}</p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="p-4 font-medium text-[var(--text-secondary)]">
                      {p.category?.name || 'General'}
                    </td>

                    {/* Price */}
                    <td className="p-4 font-bold text-[var(--text-main)]">
                      ₹{p.basePrice.toLocaleString('en-IN')}
                    </td>

                    {/* Rating */}
                    <td className="p-4">
                      <span className="font-bold text-amber-500">★ {p.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-gray-400 ml-1">({p.reviewCount})</span>
                    </td>

                    {/* Availability status badge */}
                    <td className="p-4">
                      <button
                        onClick={() => handleOpenAvailabilityModal(p)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                          p.status === 'AVAILABLE'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : p.status === 'SOLD_OUT'
                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                            : p.status === 'TEMPORARILY_UNAVAILABLE'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-500 border-transparent'
                        }`}
                        title="Click to change availability status and reason"
                      >
                        {p.status.replace(/_/g, ' ')}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/product/${p.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg border theme-border hover:bg-[var(--bg-secondary)]"
                          title="Preview in Store"
                        >
                          <Package size={14} />
                        </Link>
                        <Link
                          to={`/admin/products/edit/${p._id}`}
                          className="p-1.5 rounded-lg border theme-border hover:bg-[var(--bg-secondary)] text-blue-500"
                          title="Edit Product"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 rounded-lg border theme-border hover:bg-red-500/10 text-red-500"
                          title="Archive Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Change Availability & Enter Reason */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl theme-surface border theme-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[var(--text-main)]">Change Availability Status</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-full hover:bg-[var(--bg-secondary)]"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              Product: <strong>{selectedProduct.title}</strong>
            </p>

            <form onSubmit={handleSaveAvailability} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Availability Status</label>
                <select
                  value={availabilityStatus}
                  onChange={(e) => setAvailabilityStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-bold"
                >
                  <option value="AVAILABLE">AVAILABLE (Purchasable)</option>
                  <option value="SOLD_OUT">SOLD_OUT (Out of stock notice)</option>
                  <option value="TEMPORARILY_UNAVAILABLE">TEMPORARILY_UNAVAILABLE</option>
                  <option value="COMING_SOON">COMING_SOON (Pre-launch)</option>
                  <option value="DISABLED">DISABLED (Hidden from storefront)</option>
                  <option value="ARCHIVED">ARCHIVED (Permanently retired)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Reason for Status Change (Visible to Admin/Logs)</label>
                <textarea
                  rows={3}
                  value={availabilityReason}
                  onChange={(e) => setAvailabilityReason(e.target.value)}
                  placeholder="e.g. Supply chain bottleneck, awaiting batch testing, or safety recall"
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-card focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-2.5 rounded-xl border theme-border font-semibold hover:bg-[var(--bg-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingAvailability}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-bold hover:opacity-90"
                >
                  {isUpdatingAvailability ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
