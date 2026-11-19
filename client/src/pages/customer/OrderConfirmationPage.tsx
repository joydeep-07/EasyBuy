import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, ArrowRight, Home, Banknote, ShieldCheck, Copy } from 'lucide-react';
import { useGetOrderByIdQuery } from '../../redux/api/orderApi';
import { toast } from 'sonner';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: orderData, isLoading } = useGetOrderByIdQuery(id || '');
  const order = orderData?.order;

  if (isLoading) {
    return (
      <div className="py-24 text-center max-w-lg mx-auto p-6 space-y-4 animate-pulse">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto" />
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded mx-auto" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 py-12 max-w-3xl mx-auto space-y-8">
      {/* Success banner */}
      <div className="p-8 rounded-3xl theme-surface border theme-border shadow-sm text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-[var(--accent-primary)] mx-auto flex items-center justify-center">
          <CheckCircle2 size={40} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)]">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Thank you for shopping with EasyBuy. Your Cash on Delivery order has been confirmed.
          </p>
        </div>

        {order && (
          <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border theme-border text-left text-xs space-y-2.5 max-w-md mx-auto">
            <p className="font-bold text-[var(--text-main)] flex justify-between items-center">
              <span>Order Number:</span>
              <span className="font-mono text-[var(--accent-primary)] font-bold">{order.orderNumber}</span>
            </p>
            {(order.trackingId || order.trackingInfo?.trackingId) && (
              <p className="font-bold text-[var(--text-main)] flex justify-between items-center">
                <span>Unique Tracking ID:</span>
                <span className="flex items-center gap-1 font-mono text-[var(--accent-primary)]">
                  <span>{order.trackingId || order.trackingInfo?.trackingId}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(order.trackingId || order.trackingInfo?.trackingId || '');
                      toast.success('Tracking ID copied');
                    }}
                    className="p-1 hover:text-[var(--text-main)] text-[var(--text-secondary)] transition-colors"
                    title="Copy Tracking ID"
                  >
                    <Copy size={13} />
                  </button>
                </span>
              </p>
            )}
            <p className="text-[var(--text-secondary)] flex justify-between">
              <span>Estimated Delivery:</span>
              <strong>{new Date(order.estimatedDelivery || Date.now()).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
            </p>
            <p className="text-[var(--text-secondary)] flex justify-between">
              <span>Payment Method:</span>
              <span className="font-bold text-[var(--accent-primary)] flex items-center gap-1">
                <Banknote size={14} /> Cash on Delivery (COD)
              </span>
            </p>
            <p className="text-[var(--text-secondary)] flex justify-between">
              <span>Payment Status:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                Pending (Pay on Delivery)
              </span>
            </p>
            <div className="pt-2 border-t theme-border flex justify-between font-bold text-sm text-[var(--text-main)]">
              <span>Amount Due on Delivery:</span>
              <span className="text-[var(--accent-primary)]">₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        {/* COD guidance callout */}
        <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 max-w-md mx-auto text-xs text-left flex items-start gap-2.5">
          <ShieldCheck size={18} className="text-[var(--accent-primary)] shrink-0 mt-0.5" />
          <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
            Please keep <strong>₹{order?.totalAmount.toLocaleString('en-IN')}</strong> in cash or ready via your favorite UPI app (GPay, PhonePe, Paytm) when our courier delivery partner reaches your location.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={`/track-order/${encodeURIComponent(order?.trackingId || order?.orderNumber || id || '')}`}
            className="px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
          >
            <Truck size={16} />
            <span>Track Order & Delivery</span>
          </Link>
          <Link
            to={`/orders/${id}`}
            className="px-6 py-3 rounded-xl border theme-border theme-card font-bold text-xs hover:bg-[var(--bg-secondary)] flex items-center gap-2"
          >
            <Package size={16} />
            <span>Order Details</span>
          </Link>
          <Link
            to="/products"
            className="px-6 py-3 rounded-xl border theme-border theme-card font-bold text-xs hover:bg-[var(--bg-secondary)] flex items-center gap-2"
          >
            <Home size={16} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
