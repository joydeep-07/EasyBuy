import React, { useState } from 'react';
import {
  Boxes,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  History,
  RotateCcw,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetAdminInventoryQuery,
  useUpdateStockMutation,
  useGetInventoryTransactionsQuery,
} from '../../redux/api/adminApi';
import { AdminBadge, getStatusBadgeVariant } from '../../components/admin/AdminBadge';
import { EmptyState } from '../../components/admin/EmptyState';
import { toast } from 'sonner';
import type { InventoryItem } from '../../types';

export const AdminInventoryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Stock Adjustment Modal
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<string>('ADD');
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);

  // Transaction history drawer/modal
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const { data: inventoryData, isLoading, isFetching, refetch } = useGetAdminInventoryQuery({
    status: statusFilter,
    search,
    page,
    limit: 20,
  });

  const { data: transactionData } = useGetInventoryTransactionsQuery(undefined, {
    skip: !isHistoryOpen,
  });

  const [updateStock, { isLoading: isUpdating }] = useUpdateStockMutation();

  const handleOpenAdjust = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustType('ADD');
    setAdjustQty(10);
    setAdjustReason('Warehouse replenishment');
    setLowStockThreshold(item.lowStockThreshold || 5);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await updateStock({
        id: selectedItem._id,
        type: adjustType,
        quantity: Number(adjustQty),
        reason: adjustReason,
        lowStockThreshold: Number(lowStockThreshold),
      }).unwrap();

      toast.success('Inventory stock updated successfully!');
      setSelectedItem(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update stock');
    }
  };

  const items = inventoryData?.inventory || [];
  const totalItems = inventoryData?.total || items.length;
  const totalPages = inventoryData?.totalPages || 1;

  const stockFilterTabs = [
    { label: 'All Inventory', value: 'ALL' },
    { label: 'In Stock', value: 'IN_STOCK' },
    { label: 'Low Stock Alerts', value: 'LOW_STOCK' },
    { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
  ];

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
              Inventory & Real-Time Stock
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
              {totalItems} Tracked SKUs
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Atomic warehouse counts, pending customer reservations, safety buffers, and audit trails.
          </p>
        </div>

        <button
          onClick={() => setIsHistoryOpen(true)}
          className="px-4 py-2.5 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] text-xs font-bold flex items-center gap-2 transition-colors self-start sm:self-auto shadow-2xs"
        >
          <History size={16} />
          <span>Audit Log</span>
        </button>
      </div>

      {/* 2. Stock Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {stockFilterTabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-main)] border theme-border'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Search Bar */}
      <div className="p-4 rounded-2xl theme-surface border theme-border shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by SKU code or product title..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border theme-border theme-card font-mono text-xs text-[var(--text-main)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 transition-all"
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
      </div>

      {/* 4. Inventory Full-Width Table */}
      <div className="rounded-3xl theme-surface border theme-border overflow-hidden shadow-xs w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="bg-[var(--bg-secondary)]/50 border-b theme-border text-[var(--text-secondary)] text-[11px] font-semibold uppercase tracking-wider">
                <th className="p-4 font-semibold">SKU Code</th>
                <th className="p-4 font-semibold">Product Title & Variant</th>
                <th className="p-4 font-semibold">Physical Stock</th>
                <th className="p-4 font-semibold">Reserved</th>
                <th className="p-4 font-semibold">Available for Sale</th>
                <th className="p-4 font-semibold">Stock Status</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-xs text-[var(--text-secondary)]">
                    Loading inventory records...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Boxes}
                      title="No inventory entries found"
                      description="No tracked inventory records match your search or status filter."
                    />
                  </td>
                </tr>
              ) : (
                items.map((inv) => {
                  const availableUnits = Math.max(0, inv.currentStock - inv.reservedStock);
                  return (
                    <tr key={inv._id} className="hover:bg-[var(--bg-secondary)]/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-[var(--accent-primary)] text-xs">
                        {inv.sku}
                      </td>

                      <td className="p-4 max-w-xs">
                        <p className="font-semibold text-[var(--text-main)] text-xs truncate">
                          {inv.product?.title || 'Standalone SKU'}
                        </p>
                        {inv.variant?.title && (
                          <span className="block text-[10px] text-[var(--text-secondary)] truncate">
                            Variant: {inv.variant.title}
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-bold text-[var(--text-main)] whitespace-nowrap">
                        {inv.currentStock} units
                      </td>

                      <td className="p-4 text-amber-600 dark:text-amber-400 font-semibold whitespace-nowrap">
                        {inv.reservedStock} held
                      </td>

                      <td className="p-4 font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap text-sm">
                        {availableUnits}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <AdminBadge
                          variant={
                            inv.status === 'IN_STOCK'
                              ? 'success'
                              : inv.status === 'LOW_STOCK'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {inv.status.replace(/_/g, ' ')}
                        </AdminBadge>
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenAdjust(inv)}
                          className="px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-2xs"
                        >
                          Adjust Units
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t theme-border flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>
              Page {page} of {totalPages} ({totalItems} SKUs)
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

      {/* Stock Adjustment Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
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
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-main)]">
                    Adjust Warehouse Stock
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)] font-mono">
                    SKU: {selectedItem.sku}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-7 h-7 rounded-full border theme-border flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border theme-border space-y-1 text-[11px]">
                <p>
                  Current Physical Stock:{' '}
                  <strong className="text-[var(--text-main)]">{selectedItem.currentStock} units</strong>
                </p>
                <p>
                  Reserved for In-Flight Orders:{' '}
                  <strong className="text-amber-500">{selectedItem.reservedStock} units</strong>
                </p>
              </div>

              <form onSubmit={handleAdjustSubmit} className="space-y-3.5">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Adjustment Operation
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: '+ Add Stock', val: 'ADD' },
                      { label: '- Deduct Stock', val: 'SUBTRACT' },
                      { label: '= Set Absolute', val: 'SET' },
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        type="button"
                        onClick={() => setAdjustType(btn.val)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                          adjustType === btn.val
                            ? 'bg-[var(--accent-primary)] text-white border-transparent'
                            : 'theme-border hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      Units Amount *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={adjustQty}
                      onChange={(e) => setAdjustQty(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-bold text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Adjustment Reason
                  </label>
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="e.g. Inbound shipment arrival, damage disposal"
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card text-xs focus:outline-none"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 py-2 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-bold hover:opacity-90 shadow-sm"
                  >
                    {isUpdating ? 'Saving...' : 'Apply Adjustment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transaction History Drawer */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md h-screen apple-glass border-l theme-border shadow-2xl p-6 z-10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b theme-border">
                  <div className="flex items-center gap-2">
                    <History size={18} className="text-[var(--accent-primary)]" />
                    <h3 className="font-bold text-sm text-[var(--text-main)]">
                      Inventory Audit Log
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsHistoryOpen(false)}
                    className="p-1 rounded-full border theme-border"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] pr-1 text-xs">
                  {transactionData?.transactions?.length === 0 ? (
                    <p className="text-gray-400 py-10 text-center">No transaction records found</p>
                  ) : (
                    transactionData?.transactions?.map((tx: any) => (
                      <div
                        key={tx._id}
                        className="p-3 rounded-2xl bg-[var(--bg-secondary)] border theme-border space-y-1"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-[var(--accent-primary)]">
                            {tx.sku}
                          </span>
                          <span
                            className={`font-bold ${
                              tx.quantityChanged > 0 ? 'text-emerald-500' : 'text-rose-500'
                            }`}
                          >
                            {tx.quantityChanged > 0 ? `+${tx.quantityChanged}` : tx.quantityChanged} units
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)]">{tx.reason}</p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {new Date(tx.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsHistoryOpen(false)}
                className="w-full py-2.5 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] font-semibold text-xs"
              >
                Close Audit Log
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminInventoryPage;
