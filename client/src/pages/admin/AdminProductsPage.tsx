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
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Star,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetProductsQuery } from '../../redux/api/productApi';
import { useGetCategoriesQuery } from '../../redux/api/categoryApi';
import {
  useUpdateProductAvailabilityMutation,
  useDeleteProductMutation,
} from '../../redux/api/adminApi';
import { AdminBadge, getStatusBadgeVariant } from '../../components/admin/AdminBadge';
import { EmptyState } from '../../components/admin/EmptyState';
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

  const { data: productsData, isLoading, isFetching, refetch } = useGetProductsQuery({
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
    if (window.confirm('Are you sure you want to archive this product? It will be hidden from storefront.')) {
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
  const totalProducts = productsData?.total || products.length;
  const totalPages = productsData?.totalPages || 1;

  const fallbackImage =
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&auto=format&fit=crop&q=80';

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
              Product Catalog & SKUs
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
              {totalProducts} Items
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Manage product catalog, inventory availability, multi-variant combinations, pricing, and stock status.
          </p>
        </div>

        <Link
          to="/admin/products/create"
          className="px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:opacity-90 active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="p-4 rounded-2xl theme-surface border theme-border shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title, brand, SKU..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border theme-border theme-card text-xs font-medium text-[var(--text-main)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-main)]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border theme-border theme-card text-xs font-semibold text-[var(--text-main)] focus:outline-none"
        >
          <option value="">All Departments</option>
          {categoriesData?.categories?.map((cat: any) => (
            <option key={cat._id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Products Full-Width Table */}
      <div className="rounded-3xl theme-surface border theme-border overflow-hidden shadow-xs w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[860px]">
            <thead>
              <tr className="bg-[var(--bg-secondary)]/50 border-b theme-border text-[var(--text-secondary)] text-[11px] font-semibold uppercase tracking-wider">
                <th className="p-4 font-semibold">SKU & Item Details</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Base Price</th>
                <th className="p-4 font-semibold">Rating</th>
                <th className="p-4 font-semibold">Availability Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-xs text-[var(--text-secondary)]">
                    Loading product catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Package}
                      title="No products found"
                      description="No products match your search keyword or selected department filter."
                      actionLabel="Add New Product"
                      onAction={() => {}}
                    />
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-[var(--bg-secondary)]/60 transition-colors group">
                    {/* Title & Image */}
                    <td className="p-4">
                      <div className="flex items-center gap-3.5 max-w-md">
                        <img
                          src={p.images?.[0] || fallbackImage}
                          alt={p.title}
                          className="w-11 h-11 rounded-xl object-contain bg-white p-1 border theme-border shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = fallbackImage;
                          }}
                        />
                        <div className="truncate">
                          <p className="font-semibold text-[var(--text-main)] text-xs truncate">
                            {p.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] mt-0.5">
                            {p.brand && (
                              <span className="font-bold text-[var(--accent-primary)] uppercase">
                                {p.brand}
                              </span>
                            )}
                            {p.salesCount !== undefined && (
                              <span>• {p.salesCount} sold</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="p-4 font-medium text-[var(--text-secondary)] whitespace-nowrap">
                      {p.category?.name || 'General'}
                    </td>

                    {/* Price */}
                    <td className="p-4 font-bold text-[var(--text-main)] whitespace-nowrap text-xs">
                      ₹{p.basePrice.toLocaleString('en-IN')}
                    </td>

                    {/* Rating */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-semibold text-amber-500">
                        <Star size={13} fill="currentColor" />
                        <span>{p.rating.toFixed(1)}</span>
                        <span className="text-[10px] text-[var(--text-secondary)] font-normal">
                          ({p.reviewCount})
                        </span>
                      </div>
                    </td>

                    {/* Availability status badge */}
                    <td className="p-4 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenAvailabilityModal(p)}
                        className="cursor-pointer"
                        title="Click to update availability status"
                      >
                        <AdminBadge
                          variant={getStatusBadgeVariant(p.status || 'AVAILABLE')}
                          size="sm"
                        >
                          {(p.status || 'AVAILABLE').replace(/_/g, ' ')}
                        </AdminBadge>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/product/${p.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg border theme-border hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
                          title="Preview in Storefront"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <Link
                          to={`/admin/products/edit/${p._id}`}
                          className="p-1.5 rounded-lg border theme-border hover:bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] transition-colors"
                          title="Edit Product Details"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 rounded-lg border theme-border hover:bg-rose-500/10 text-rose-500 transition-colors"
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t theme-border flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>
              Page {page} of {totalPages} ({totalProducts} products)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Change Availability & Reason */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md p-6 rounded-3xl theme-surface border theme-border shadow-2xl space-y-4 z-10 text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b theme-border">
                <h3 className="font-bold text-sm text-[var(--text-main)]">
                  Update Availability Status
                </h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-7 h-7 rounded-full border theme-border flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border theme-border">
                <p className="text-[11px] text-[var(--text-secondary)]">Selected SKU:</p>
                <p className="font-semibold text-xs text-[var(--text-main)] truncate mt-0.5">
                  {selectedProduct.title}
                </p>
              </div>

              <form onSubmit={handleSaveAvailability} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Availability State
                  </label>
                  <select
                    value={availabilityStatus}
                    onChange={(e) => setAvailabilityStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-semibold focus:outline-none"
                  >
                    <option value="AVAILABLE">AVAILABLE (Active & Purchasable)</option>
                    <option value="SOLD_OUT">SOLD_OUT (Out of Stock Notice)</option>
                    <option value="TEMPORARILY_UNAVAILABLE">TEMPORARILY_UNAVAILABLE</option>
                    <option value="COMING_SOON">COMING_SOON (Pre-Launch)</option>
                    <option value="DISABLED">DISABLED (Hidden from Store)</option>
                    <option value="ARCHIVED">ARCHIVED (Permanently Retired)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Audit Note / Reason
                  </label>
                  <textarea
                    rows={3}
                    value={availabilityReason}
                    onChange={(e) => setAvailabilityReason(e.target.value)}
                    placeholder="e.g. Batch testing, supplier delay, or recall"
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card focus:outline-none"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 py-2.5 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingAvailability}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-bold hover:opacity-90 active:scale-98 transition-all shadow-sm"
                  >
                    {isUpdatingAvailability ? 'Saving...' : 'Update Availability'}
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

export default AdminProductsPage;
