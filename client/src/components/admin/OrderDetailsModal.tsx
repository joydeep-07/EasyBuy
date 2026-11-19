import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Package,
  Truck,
  MapPin,
  Banknote,
  User,
  Calendar,
  Copy,
  Check,
  ExternalLink,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { AdminBadge, getStatusBadgeVariant } from './AdminBadge';
import type { Order } from '../../types';
import { toast } from 'sonner';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onOpenStatusModal?: (order: Order) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onOpenStatusModal,
}) => {
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [copiedOrderNo, setCopiedOrderNo] = useState(false);

  if (!order) return null;

  const copyToClipboard = (text: string, type: 'tracking' | 'order') => {
    navigator.clipboard.writeText(text);
    if (type === 'tracking') {
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
      toast.success('Tracking ID copied to clipboard');
    } else {
      setCopiedOrderNo(true);
      setTimeout(() => setCopiedOrderNo(false), 2000);
      toast.success('Order Number copied to clipboard');
    }
  };

  const customerName =
    typeof order.user === 'object' && order.user !== null
      ? `${order.user.firstName} ${order.user.lastName}`
      : order.addressSnapshot?.fullName || 'Customer';

  const customerEmail =
    typeof order.user === 'object' && order.user !== null
      ? order.user.email
      : '';

  const trackingId = order.trackingId || order.trackingInfo?.trackingId || '';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl theme-surface border theme-border shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b theme-border flex items-center justify-between bg-[var(--bg-secondary)]/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center font-mono font-bold text-xs">
                <Package size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[var(--text-main)] tracking-tight">
                    Order #{order.orderNumber}
                  </h3>
                  <button
                    onClick={() => copyToClipboard(order.orderNumber, 'order')}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-main)] p-1 rounded-md transition-colors"
                    title="Copy Order #"
                  >
                    {copiedOrderNo ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5 mt-0.5">
                  <Calendar size={12} />
                  <span>Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AdminBadge variant={getStatusBadgeVariant(order.orderStatus)}>
                {order.orderStatus}
              </AdminBadge>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full border theme-border flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Customer */}
              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border theme-border space-y-1">
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-semibold text-[11px]">
                  <User size={13} />
                  <span>Customer</span>
                </div>
                <p className="font-bold text-[var(--text-main)] text-xs truncate">{customerName}</p>
                {customerEmail && <p className="text-[11px] text-[var(--text-secondary)] truncate">{customerEmail}</p>}
                {order.addressSnapshot?.phoneNumber && (
                  <p className="text-[11px] text-[var(--text-secondary)]">Ph: {order.addressSnapshot.phoneNumber}</p>
                )}
              </div>

              {/* Payment Info */}
              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border theme-border space-y-1">
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-semibold text-[11px]">
                  <Banknote size={13} />
                  <span>Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <AdminBadge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                    COD {order.paymentStatus}
                  </AdminBadge>
                </div>
                <p className="text-[11px] font-bold text-[var(--accent-primary)] mt-1">
                  Total: ₹{order.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>

              {/* Courier & Tracking */}
              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border theme-border space-y-1">
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-semibold text-[11px]">
                  <Truck size={13} />
                  <span>Shipment & Courier</span>
                </div>
                <p className="font-bold text-[var(--text-main)] text-xs">
                  {order.trackingInfo?.shippingCompany || order.shipment?.shippingCompany || 'EasyBuy Logistics'}
                </p>
                {trackingId ? (
                  <div className="flex items-center gap-1 font-mono text-[11px] text-[var(--text-secondary)]">
                    <span className="truncate">AWB: {trackingId}</span>
                    <button
                      onClick={() => copyToClipboard(trackingId, 'tracking')}
                      className="p-0.5 hover:text-[var(--text-main)]"
                      title="Copy Tracking ID"
                    >
                      {copiedTracking ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400">Tracking pending</p>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-xs text-[var(--text-main)] tracking-tight flex items-center justify-between">
                <span>Items Ordered ({order.items.length})</span>
                <span className="text-[var(--text-secondary)] font-normal text-[11px]">
                  Subtotal: ₹{order.subtotal.toLocaleString('en-IN')}
                </span>
              </h4>

              <div className="rounded-2xl border theme-border overflow-hidden divide-y theme-border bg-[var(--bg-secondary)]/30">
                {order.items.map((it, idx) => (
                  <div key={idx} className="p-3.5 flex items-center gap-3.5 hover:bg-[var(--bg-secondary)] transition-colors">
                    <img
                      src={it.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                      alt={it.title}
                      className="w-12 h-12 rounded-xl object-contain bg-white p-1 border theme-border shrink-0 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--text-main)] text-xs truncate">
                        {it.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] mt-0.5">
                        {it.brand && <span>Brand: {it.brand}</span>}
                        {it.sku && <span>SKU: {it.sku}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-[var(--text-main)] text-xs">
                        ₹{it.subtotal.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)]">
                        Qty {it.quantity} × ₹{it.unitPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Details & Shipping Address Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Delivery Address */}
              <div className="p-4 rounded-2xl border theme-border bg-[var(--bg-secondary)]/30 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-[var(--text-main)] text-xs">
                  <MapPin size={13} className="text-[var(--accent-primary)]" />
                  <span>Delivery Address</span>
                </div>
                {order.addressSnapshot ? (
                  <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    <p className="font-semibold text-[var(--text-main)]">{order.addressSnapshot.fullName}</p>
                    <p>
                      {order.addressSnapshot.houseBuilding && `${order.addressSnapshot.houseBuilding}, `}
                      {order.addressSnapshot.street}
                    </p>
                    <p>
                      {order.addressSnapshot.locality && `${order.addressSnapshot.locality}, `}
                      {order.addressSnapshot.city}, {order.addressSnapshot.state} - {order.addressSnapshot.pincode}
                    </p>
                    <p className="mt-1 font-mono">Phone: {order.addressSnapshot.phoneNumber}</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400">No address details available</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl border theme-border bg-[var(--bg-secondary)]/30 space-y-2">
                <span className="font-semibold text-[var(--text-main)] text-xs block">
                  Payment Summary
                </span>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Items Subtotal</span>
                    <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Coupon Discount</span>
                      <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Delivery Charge</span>
                    <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span>
                  </div>
                  <div className="pt-2 border-t theme-border flex justify-between font-bold text-xs text-[var(--text-main)]">
                    <span>Amount Due on Delivery</span>
                    <span className="text-[var(--accent-primary)]">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="space-y-2.5">
                <span className="font-semibold text-xs text-[var(--text-main)] tracking-tight flex items-center gap-1.5">
                  <Clock size={13} className="text-[var(--accent-primary)]" />
                  <span>Order Audit History</span>
                </span>
                <div className="space-y-2 rounded-2xl border theme-border p-3.5 bg-[var(--bg-secondary)]/20">
                  {order.statusHistory.map((sh, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-[11px] pb-2 last:pb-0 border-b theme-border last:border-b-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-semibold text-[var(--text-main)]">{sh.status}</span>
                          <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                            {new Date(sh.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        {sh.comment && <p className="text-[var(--text-secondary)] text-[10px] mt-0.5">{sh.comment}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t theme-border bg-[var(--bg-secondary)]/50 backdrop-blur-sm flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] text-xs font-semibold text-[var(--text-secondary)] transition-colors"
            >
              Close
            </button>
            {onOpenStatusModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenStatusModal(order);
                }}
                className="px-5 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
              >
                <Truck size={14} />
                <span>Update Fulfillment & Tracking</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
