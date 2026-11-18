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
} from 'lucide-react';
import {
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
} from '../../redux/api/adminApi';
import { toast } from 'sonner';
import type { Order } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Status & Tracking update modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('Confirmed');
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>('PENDING');
  const [shippingCompany, setShippingCompany] = useState<string>('BlueDart Express');
  const [trackingId, setTrackingId] = useState<string>('');
  const [trackingUrl, setTrackingUrl] = useState<string>('');
  const [adminComment, setAdminComment] = useState<string>('');

  const { data: ordersData, isLoading, refetch } = useGetAdminOrdersQuery({
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
    setTrackingId(ord.trackingInfo?.trackingId || '');
    setTrackingUrl(ord.trackingInfo?.trackingUrl || '');
    setAdminComment('');
  };

  const handleQuickMarkPaid = async (ord: Order) => {
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

  const orders = ordersData?.orders || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-main)]">Fulfillment & Order Processing</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Manage status transitions, dispatch shipping labels, and track carrier deliveries & COD collections
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl theme-surface border theme-border flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order # or Customer..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border theme-border theme-card text-xs focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border theme-border theme-card font-semibold focus:outline-none"
        >
          <option value="ALL">All Order Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Processing">Processing</option>
          <option value="Packed">Packed</option>
          <option value="Shipped">Shipped</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl theme-surface border theme-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b theme-border text-[var(--text-secondary)]">
                <th className="p-4 font-semibold">Order #</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Items</th>
                <th className="p-4 font-semibold">Total Amount</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Payment (COD)</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">No orders found.</td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="p-4 font-mono font-bold text-[var(--accent-primary)]">
                      {ord.orderNumber}
                    </td>
                    <td className="p-4 font-medium text-[var(--text-main)]">
                      {typeof ord.user === 'object' && ord.user !== null
                        ? `${ord.user.firstName} ${ord.user.lastName}`
                        : ord.addressSnapshot?.fullName}
                      <span className="block text-[10px] text-[var(--text-secondary)]">
                        PIN {ord.addressSnapshot?.pincode}
                      </span>
                    </td>
                    <td className="p-4 text-[var(--text-secondary)]">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold">{ord.items.length} item(s)</span>
                    </td>
                    <td className="p-4 font-bold text-[var(--text-main)]">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : ord.orderStatus === 'Cancelled'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                            ord.paymentStatus === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          <Banknote size={12} />
                          {ord.paymentStatus === 'PAID' ? 'COD Paid' : 'COD Pending'}
                        </span>
                        {ord.paymentStatus !== 'PAID' && (
                          <button
                            title="Mark Cash Collected"
                            onClick={() => handleQuickMarkPaid(ord)}
                            className="p-1 rounded-lg hover:bg-emerald-500/10 text-[var(--accent-primary)] transition-colors text-[10px] font-semibold underline"
                          >
                            Collect
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenStatusModal(ord)}
                        className="px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90"
                      >
                        Update / Dispatch
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Update Status and Courier Tracking */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-3xl theme-surface border theme-border shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-[var(--text-main)]">
                Fulfill Order #{selectedOrder.orderNumber}
              </h3>
              <button onClick={() => setSelectedOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              Customer: <strong>{selectedOrder.addressSnapshot?.fullName}</strong> • Destination:{' '}
              <strong>{selectedOrder.addressSnapshot?.city}, {selectedOrder.addressSnapshot?.pincode}</strong> • Total:{' '}
              <strong className="text-[var(--accent-primary)]">₹{selectedOrder.totalAmount.toLocaleString('en-IN')} (COD)</strong>
            </p>

            <form onSubmit={handleStatusSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Order Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-bold"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing (Dispatched to Warehouse)</option>
                    <option value="Packed">Packed (In Tamper-Proof Packaging)</option>
                    <option value="Shipped">Shipped (Handed to Carrier)</option>
                    <option value="Out for Delivery">Out for Delivery (With Rider)</option>
                    <option value="Delivered">Delivered (Completed)</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">COD Payment Status</label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-bold"
                  >
                    <option value="PENDING">PENDING (Uncollected)</option>
                    <option value="PAID">PAID (Cash Collected)</option>
                    <option value="FAILED">FAILED (Refused on Delivery)</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Carrier / Shipping Company</label>
                  <select
                    value={shippingCompany}
                    onChange={(e) => setShippingCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                  >
                    <option value="BlueDart Express">BlueDart Express</option>
                    <option value="Delhivery">Delhivery</option>
                    <option value="DTDC Express">DTDC Express</option>
                    <option value="India Post EMS">India Post EMS</option>
                    <option value="EasyBuy Logistics">EasyBuy Logistics</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Tracking ID / AWB #</label>
                  <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="e.g. BD-982174"
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Tracking URL (optional)</label>
                <input
                  type="text"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://track.bluedart.com/..."
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Comment / Dispatch Notes</label>
                <input
                  type="text"
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="e.g. Package inspected, sealed, and handed to driver"
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border theme-border font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-bold"
                >
                  {isUpdating ? 'Saving...' : 'Save & Notify Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
