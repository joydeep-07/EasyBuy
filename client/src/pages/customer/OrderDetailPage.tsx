import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  MapPin,
  Banknote,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Download,
  XCircle,
} from 'lucide-react';
import { useGetOrderByIdQuery, useCancelOrderMutation } from '../../redux/api/orderApi';
import { toast } from 'sonner';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: orderData, isLoading } = useGetOrderByIdQuery(id || '');
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Order placed by mistake');

  const order = orderData?.order;

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="text-xl font-bold">Order not found</h2>
        <Link to="/orders" className="text-xs font-bold text-[var(--accent-primary)] hover:underline">
          Return to My Orders
        </Link>
      </div>
    );
  }

  const isCancellable = !['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(order.orderStatus);

  const handleCancelOrder = async () => {
    try {
      await cancelOrder({ id: order._id, reason: cancelReason }).unwrap();
      toast.success('Order has been cancelled');
      setIsCancelConfirmOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to cancel order');
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 py-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b theme-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
            <Link to="/orders" className="hover:text-[var(--accent-primary)]">Orders</Link>
            <span>/</span>
            <span>Order #{order.orderNumber}</span>
          </div>
          <h1 className="text-2xl font-black text-[var(--text-main)]">
            Order Details
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/track-order/${order._id}`}
            className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 flex items-center gap-1.5"
          >
            <Truck size={14} />
            <span>Track Delivery</span>
          </Link>
          {isCancellable && (
            <button
              onClick={() => setIsCancelConfirmOpen(true)}
              className="px-4 py-2 rounded-xl border border-red-500/40 text-red-500 hover:bg-red-500/10 text-xs font-semibold"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Order Status Banner */}
      <div className="p-5 rounded-3xl theme-surface border theme-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-[var(--accent-primary)]">
            <Package size={24} />
          </div>
          <div>
            <span className="text-xs text-[var(--text-secondary)] font-medium">Current Status</span>
            <h3 className="text-base font-bold text-[var(--text-main)]">{order.orderStatus}</h3>
          </div>
        </div>
        {order.trackingInfo && (
          <div className="text-right text-xs">
            <span className="text-[var(--text-secondary)]">Courier: </span>
            <strong className="text-[var(--text-main)]">{order.trackingInfo.shippingCompany}</strong>
            <p className="font-mono text-[var(--accent-primary)]">AWB: {order.trackingInfo.trackingId}</p>
          </div>
        )}
      </div>

      {/* Grid: Delivery Info, Payment, Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        {/* Delivery Address */}
        <div className="p-5 rounded-3xl theme-surface border theme-border space-y-2">
          <h4 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-1.5">
            <MapPin size={16} className="text-[var(--accent-primary)]" /> Delivery Address
          </h4>
          <p className="font-semibold text-[var(--text-main)]">{order.addressSnapshot?.fullName}</p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {order.addressSnapshot?.houseBuilding}, {order.addressSnapshot?.street}, {order.addressSnapshot?.locality ? `${order.addressSnapshot.locality}, ` : ''}{order.addressSnapshot?.city}, {order.addressSnapshot?.state} - {order.addressSnapshot?.pincode}
          </p>
          <p className="text-[var(--text-secondary)]">Phone: {order.addressSnapshot?.phoneNumber}</p>
        </div>

        {/* Payment details */}
        <div className="p-5 rounded-3xl theme-surface border theme-border space-y-2">
          <h4 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-1.5">
            <Banknote size={16} className="text-[var(--accent-primary)]" /> Payment Details
          </h4>
          <p className="text-[var(--text-main)] font-medium flex items-center justify-between">
            <span>Method:</span>
            <strong>Cash on Delivery (COD)</strong>
          </p>
          <p className="text-[var(--text-main)] font-medium flex items-center justify-between">
            <span>Status:</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              order.paymentStatus === 'PAID'
                ? 'bg-emerald-500/10 text-[var(--accent-primary)]'
                : 'bg-amber-500/10 text-amber-600'
            }`}>
              {order.paymentStatus === 'PAID' ? 'Paid on Delivery' : 'Pending (Pay on Delivery)'}
            </span>
          </p>
          {order.appliedCoupon && (
            <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-between">
              <span>Coupon:</span>
              <span>{order.appliedCoupon.code} (-₹{order.discount})</span>
            </p>
          )}
          <p className="text-[var(--text-secondary)] text-[11px] pt-1">
            {order.paymentStatus === 'PAID'
              ? 'Payment was successfully collected upon delivery.'
              : 'Please pay the delivery partner in cash or via UPI at the time of delivery.'}
          </p>
        </div>

        {/* Price Summary */}
        <div className="p-5 rounded-3xl theme-surface border theme-border space-y-2">
          <h4 className="font-bold text-sm text-[var(--text-main)]">Summary</h4>
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>Items Subtotal:</span>
            <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>Discount:</span>
            <span>-₹{order.discount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>Delivery:</span>
            <span>₹{order.deliveryCharge}</span>
          </div>
          <div className="pt-2 border-t theme-border flex justify-between font-bold text-sm text-[var(--text-main)]">
            <span>Total:</span>
            <span className="text-[var(--accent-primary)]">₹{order.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Items in this Order */}
      <div className="p-6 rounded-3xl theme-surface border theme-border space-y-4">
        <h3 className="font-bold text-sm text-[var(--text-main)]">Items Ordered</h3>
        <div className="space-y-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 py-3 border-b theme-border last:border-b-0 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                  alt={item.title}
                  className="w-16 h-16 rounded-2xl object-contain bg-white p-1 border shrink-0"
                />
                <div>
                  <h4 className="font-bold text-[var(--text-main)]">{item.title}</h4>
                  <p className="text-[var(--text-secondary)]">
                    Price: ₹{item.unitPrice.toLocaleString('en-IN')} • Quantity: {item.quantity}
                  </p>
                  {item.sku && <p className="font-mono text-[10px] text-gray-500">SKU: {item.sku}</p>}
                </div>
              </div>
              <span className="font-bold text-sm text-[var(--text-main)]">
                ₹{item.subtotal.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel Order Modal */}
      {isCancelConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl theme-surface border theme-border shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[var(--text-main)]">Confirm Order Cancellation</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Are you sure you want to cancel order #{order.orderNumber}? Any reserved stock will be returned to inventory.
            </p>

            <div>
              <label className="block text-xs font-semibold mb-1">Reason for cancellation:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border theme-border theme-card text-xs"
              >
                <option value="Order placed by mistake">Order placed by mistake</option>
                <option value="Item price changed">Item price changed</option>
                <option value="Delivery time is too long">Delivery time is too long</option>
                <option value="Need to change shipping address">Need to change shipping address</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsCancelConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border theme-border text-xs font-semibold hover:bg-[var(--bg-secondary)]"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
