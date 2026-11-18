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
} from 'lucide-react';
import {
  useGetAdminInventoryQuery,
  useUpdateStockMutation,
  useGetInventoryTransactionsQuery,
} from '../../redux/api/adminApi';
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

  const { data: inventoryData, isLoading, refetch } = useGetAdminInventoryQuery({
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-main)]">Inventory & Stock Tracking</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Atomic stock counts, order reservations, reorder thresholds, and damage logs
          </p>
        </div>

        <button
          onClick={() => setIsHistoryOpen(true)}
          className="px-4 py-2 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] text-xs font-bold flex items-center gap-2 self-start sm:self-auto"
        >
          <History size={16} />
          <span>Audit Log</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl theme-surface border theme-border flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border theme-border theme-card font-mono text-xs focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border theme-border theme-card font-semibold focus:outline-none"
        >
          <option value="ALL">All Stock Statuses</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW_STOCK">Low Stock Alert</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="rounded-3xl theme-surface border theme-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b theme-border text-[var(--text-secondary)]">
                <th className="p-4 font-semibold">SKU</th>
                <th className="p-4 font-semibold">Product Title</th>
                <th className="p-4 font-semibold">Current Physical</th>
                <th className="p-4 font-semibold">Order Reserved</th>
                <th className="p-4 font-semibold">Available for Sale</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">Loading inventory records...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">No inventory entries found.</td>
                </tr>
              ) : (
                items.map((inv) => (
                  <tr key={inv._id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="p-4 font-mono font-bold text-[var(--accent-primary)]">
                      {inv.sku}
                    </td>
                    <td className="p-4 font-medium text-[var(--text-main)] max-w-xs truncate">
                      {inv.product?.title || 'Standalone Item'}
                      {inv.variant?.title && (
                        <span className="block text-[10px] text-[var(--text-secondary)] truncate">
                          {inv.variant.title}
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-bold">{inv.currentStock}</td>
                    <td className="p-4 text-amber-500 font-bold">{inv.reservedStock}</td>
                    <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">
                      {Math.max(0, inv.currentStock - inv.reservedStock)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          inv.status === 'IN_STOCK'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : inv.status === 'LOW_STOCK'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {inv.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenAdjust(inv)}
                        className="px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl theme-surface border theme-border shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-[var(--text-main)]">Adjust Stock: {selectedItem.sku}</h3>
              <button onClick={() => setSelectedItem(null)}>
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              Current Stock: <strong>{selectedItem.currentStock} units</strong> • Reserved: <strong>{selectedItem.reservedStock}</strong>
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Adjustment Action</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-bold"
                >
                  <option value="ADD">ADD Stock (Restock Shipment)</option>
                  <option value="REDUCE">REDUCE Stock (Internal Consumption)</option>
                  <option value="DAMAGE">Record DAMAGED Goods</option>
                  <option value="RETURN">Record Customer RETURN Restock</option>
                  <option value="ADJUSTMENT">Set EXACT Quantity (Audit Reconciliation)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Low-Stock Alert Threshold</label>
                <input
                  type="number"
                  min={1}
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Reason / Notes</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Supplier PO #4921 received in warehouse"
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 py-2.5 rounded-xl border theme-border font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-bold"
                >
                  {isUpdating ? 'Saving...' : 'Apply Stock Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction History Drawer */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl h-full p-6 theme-surface shadow-2xl overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b theme-border">
              <h3 className="font-bold text-base text-[var(--text-main)] flex items-center gap-2">
                <History size={18} /> Inventory Audit Trail
              </h3>
              <button onClick={() => setIsHistoryOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {transactionData?.transactions?.map((tx: any) => (
                <div key={tx._id} className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[var(--accent-primary)]">{tx.sku}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 dark:bg-gray-800">
                      {tx.type}
                    </span>
                  </div>
                  <p className="text-[var(--text-main)]">{tx.reason}</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    Prev: {tx.previousStock} → New: <strong>{tx.newStock}</strong> (by {tx.performedBy} on {new Date(tx.createdAt).toLocaleString()})
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
