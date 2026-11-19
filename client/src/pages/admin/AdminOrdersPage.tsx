import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
  X,
  Package,
  Banknote,
  Eye,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
} from '../../redux/api/adminApi';
import { AdminBadge, getStatusBadgeVariant } from '../../components/admin/AdminBadge';
import { OrderDetailsModal } from '../../components/admin/OrderDetailsModal';
import { EmptyState } from '../../components/admin/EmptyState';
import { toast } from 'sonner';
import type { Order } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Status & Tracking update modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [newStatus, setNewStatus] = useState<string>('Confirmed');
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>('PENDING');
  const [shippingCompany, setShippingCompany] = useState<string>('BlueDart Express');
  const [trackingId, setTrackingId] = useState<string>('');
  const [trackingUrl, setTrackingUrl] = useState<string>('');
  const [adminComment, setAdminComment] = useState<string>('');

  const { data: ordersData, isLoading, isFetching, refetch } = useGetAdminOrdersQuery({
    status: statusFilter,
    search,
    page,
    limit: 15,
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [updatePayment, { isLoading: isUpdatingPayment }] = useUpdatePaymentStatusMutation();

  const handleOpenStatusModal = (ord: Order) => {
    setSelectedOrder(ord);
    setNewStatus(ord.orderStatus);
    setNewPaymentStatus(ord.paymentStatus);
    setShippingCompany(ord.trackingInfo?.shippingCompany || 'BlueDart Express');
    setTrackingId(ord.trackingId || ord.trackingInfo?.trackingId || '');
    setTrackingUrl(ord.trackingInfo?.trackingUrl || '');
    setAdminComment('');
  };

  const handleQuickMarkPaid = async (ord: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updatePayment({
        id: ord._id,
        paymentStatus: 'PAID',
        notes: 'Cash collected upon delivery verified by admin',
      }).unwrap();
      toast.success(`Payment for Order #${ord.orderNumber} marked as PAID`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update payment status');
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await updateStatus({
        id: selectedOrder._id,
        status: newStatus,
        paymentStatus: newPaymentStatus,
        comment: adminComment,
        shippingCompany: shippingCompany || undefined,
        trackingId: trackingId || undefined,
        trackingUrl: trackingUrl || undefined,
      }).unwrap();

      toast.success(`Order #${selectedOrder.orderNumber} updated successfully`);
      setSelectedOrder(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update order status');
    }
  };

  const copyOrderNo = (orderNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(orderNumber);
    setCopiedId(orderNumber);
    toast.success(`Copied #${orderNumber}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const orders = ordersData?.orders || [];
  const totalOrders = ordersData?.total || 0;
  const totalPages = ordersData?.totalPages || 1;

  const fallbackImage =
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&auto=format&fit=crop&q=80';

  const filterTabs = [
    { label: 'All Orders', value: 'ALL' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Packed', value: 'Packed' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Out for Delivery', value: 'Out for Delivery' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
              Order Fulfillment & Shipments
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
              {totalOrders} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Dispatch packages, assign carrier tracking AWBs, inspect item orders, and verify cash collection.
          </p>
        </div>
      </div>

      {/* 2. Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
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

      {/* 3. Search and Quick Controls */}
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
            placeholder="Search by Order #, Unique Tracking ID, Customer Name, or Phone..."
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
      </div>

      {/* 4. Orders Full-Width Table */}
      <div className="rounded-3xl theme-surface border theme-border overflow-hidden shadow-xs w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[860px]">
            <thead>
              <tr className="bg-[var(--bg-secondary)]/50 border-b theme-border text-[var(--text-secondary)] text-[11px] font-semibold uppercase tracking-wider">
                <th className="p-4 font-semibold">Order & Tracking</th>
                <th className="p-4 font-semibold">Items & Products</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">COD Payment</th>
                <th className="p-4 font-semibold">Fulfillment Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-xs text-[var(--text-secondary)]">
                    Loading order records...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={ShoppingBag}
                      title="No orders found"
                      description="No orders match the selected filter criteria or search keyword."
                    />
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const customerName =
                    typeof ord.user === 'object' && ord.user !== null
                      ? `${ord.user.firstName} ${ord.user.lastName}`
                      : ord.addressSnapshot?.fullName || 'Customer';

                  const primaryItem = ord.items?.[0];
                  const totalQty = ord.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 0;
                  const extraItems = (ord.items?.length || 1) - 1;

                  return (
                    <tr
                      key={ord._id}
                      onClick={() => setInspectOrder(ord)}
                      className="hover:bg-[var(--bg-secondary)]/60 transition-colors cursor-pointer group"
                    >
                      {/* Order & Tracking ID */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[var(--accent-primary)] text-xs">
                            #{ord.orderNumber}
                          </span>
                          <button
                            onClick={(e) => copyOrderNo(ord.orderNumber, e)}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-main)] p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy Order #"
                          >
                            {copiedId === ord.orderNumber ? (
                              <Check size={11} className="text-emerald-500" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        </div>
                        {(ord.trackingId || ord.trackingInfo?.trackingId) ? (
                          <span className="block text-[10px] font-mono text-[var(--text-secondary)] mt-0.5">
                            TRK: {ord.trackingId || ord.trackingInfo?.trackingId}
                          </span>
                        ) : (
                          <span className="block text-[10px] text-gray-400 mt-0.5">Unassigned</span>
                        )}
                      </td>

                      {/* Items & Product Thumbnails */}
                      <td className="p-4">
                        <div className="flex items-center gap-3 max-w-[260px]">
                          <div className="relative shrink-0">
                            <img
                              src={primaryItem?.image || fallbackImage}
                              alt={primaryItem?.title || 'Product'}
                              className="w-10 h-10 rounded-xl object-contain bg-white p-1 border theme-border shadow-2xs"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = fallbackImage;
                              }}
                            />
                            {extraItems > 0 && (
                              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[var(--text-main)] text-[var(--bg-main)]">
                                +{extraItems}
                              </span>
                            )}
                          </div>
                          <div className="truncate">
                            <p className="font-medium text-[var(--text-main)] truncate text-xs">
                              {primaryItem?.title || 'EasyBuy Product'}
                            </p>
                            <p className="text-[10px] text-[var(--text-secondary)]">
                              Qty: {totalQty} ({ord.items?.length || 1} SKU{ord.items?.length > 1 ? 's' : ''})
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <p className="font-semibold text-[var(--text-main)] truncate max-w-[140px]">
                          {customerName}
                        </p>
                        <p className="text-[10px] text-[var(--text-secondary)]">
                          {ord.addressSnapshot?.city ? `${ord.addressSnapshot.city}, PIN ${ord.addressSnapshot?.pincode}` : 'India'}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-[var(--text-secondary)] whitespace-nowrap text-[11px] font-mono">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Amount */}
                      <td className="p-4 font-bold text-[var(--text-main)] whitespace-nowrap text-xs">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </td>

                      {/* Payment */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <AdminBadge
                            variant={ord.paymentStatus === 'PAID' ? 'success' : 'warning'}
                            size="sm"
                          >
                            COD {ord.paymentStatus}
                          </AdminBadge>
                          {ord.paymentStatus !== 'PAID' && (
                            <button
                              onClick={(e) => handleQuickMarkPaid(ord, e)}
                              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                              title="Mark Paid upon delivery"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        <AdminBadge
                          variant={getStatusBadgeVariant(ord.orderStatus)}
                          size="sm"
                        >
                          {ord.orderStatus}
                        </AdminBadge>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setInspectOrder(ord)}
                            className="p-1.5 rounded-lg border theme-border text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition-colors"
                            title="Inspect Order Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenStatusModal(ord)}
                            className="px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-2xs"
                          >
                            Dispatch
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t theme-border flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>
              Showing page {page} of {totalPages} ({totalOrders} orders)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Modal */}
      <OrderDetailsModal
        order={inspectOrder}
        onClose={() => setInspectOrder(null)}
        onOpenStatusModal={handleOpenStatusModal}
      />

      {/* Fulfillment & Tracking Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg p-6 rounded-3xl theme-surface border theme-border shadow-2xl space-y-4 z-10 text-xs"
            >
              <div className="flex justify-between items-center pb-2 border-b theme-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center">
                    <Truck size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-main)]">
                      Fulfill Order #{selectedOrder.orderNumber}
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Update courier milestones & COD collection
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-7 h-7 rounded-full border theme-border flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border theme-border text-[11px] space-y-1">
                <p>
                  Customer: <strong>{selectedOrder.addressSnapshot?.fullName}</strong> ({selectedOrder.addressSnapshot?.city}, PIN {selectedOrder.addressSnapshot?.pincode})
                </p>
                <p>
                  Order Total: <strong className="text-[var(--accent-primary)]">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</strong> (COD)
                </p>
              </div>

              <form onSubmit={handleStatusSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      Fulfillment Milestone
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-semibold focus:outline-none"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing (In Warehouse)</option>
                      <option value="Packed">Packed (Ready for Dispatch)</option>
                      <option value="Shipped">Shipped (Handed to Carrier)</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      COD Cash Status
                    </label>
                    <select
                      value={newPaymentStatus}
                      onChange={(e) => setNewPaymentStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-semibold focus:outline-none"
                    >
                      <option value="PENDING">PENDING (Uncollected)</option>
                      <option value="PAID">PAID (Cash Collected)</option>
                      <option value="FAILED">FAILED (Refused Delivery)</option>
                      <option value="REFUNDED">REFUNDED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      Courier Carrier
                    </label>
                    <select
                      value={shippingCompany}
                      onChange={(e) => setShippingCompany(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card focus:outline-none"
                    >
                      <option value="BlueDart Express">BlueDart Express</option>
                      <option value="Delhivery">Delhivery</option>
                      <option value="DTDC Express">DTDC Express</option>
                      <option value="India Post EMS">India Post EMS</option>
                      <option value="EasyBuy Logistics">EasyBuy Logistics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      Tracking ID / AWB #
                    </label>
                    <input
                      type="text"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      placeholder="e.g. BD-847291039"
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Carrier Tracking Portal URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://www.bluedart.com"
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Audit Note / Comment
                  </label>
                  <input
                    type="text"
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="e.g. Sealed and handed to delivery partner"
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card focus:outline-none"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 py-2.5 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-bold hover:opacity-90 active:scale-98 transition-all shadow-sm"
                  >
                    {isUpdating ? 'Updating...' : 'Save & Notify Customer'}
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

export default AdminOrdersPage;
