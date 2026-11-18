import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { useGetMyOrdersQuery } from '../../redux/api/orderApi';
import { useAppSelector } from '../../redux/hooks';

export const MyOrdersPage: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data: ordersData, isLoading } = useGetMyOrdersQuery(undefined, {
    skip: !isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4 px-4">
        <Package size={40} className="mx-auto text-[var(--accent-primary)]" />
        <h2 className="text-xl font-bold">Please sign in to view your orders</h2>
        <Link to="/login" className="inline-block px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold">
          Sign In
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      </div>
    );
  }

  const orders = ordersData?.orders || [];

  return (
    <div className="w-full px-4 sm:px-6 py-8 max-w-5xl mx-auto space-y-6">
      <div className="pb-4 border-b theme-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-main)]">Your Orders</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Track shipments, return items, or buy again
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center space-y-3 theme-card rounded-3xl p-8 border theme-border">
          <Package size={40} className="mx-auto text-gray-400" />
          <h3 className="font-bold text-base text-[var(--text-main)]">No orders placed yet</h3>
          <p className="text-xs text-[var(--text-secondary)]">Looks like you haven't bought anything yet.</p>
          <Link
            to="/products"
            className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord._id}
              className="rounded-3xl theme-surface border theme-border overflow-hidden shadow-sm"
            >
              {/* Card Header */}
              <div className="bg-[var(--bg-secondary)] px-6 py-3.5 border-b theme-border flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-6 text-[var(--text-secondary)]">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-[var(--text-secondary)]">Order Placed</span>
                    <span className="font-semibold text-[var(--text-main)]">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-[var(--text-secondary)]">Total</span>
                    <span className="font-semibold text-[var(--text-main)]">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-[var(--text-secondary)]">Ship To</span>
                    <span className="font-semibold text-[var(--text-main)]">
                      {ord.addressSnapshot?.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-[var(--text-secondary)]">Payment</span>
                    <span className="font-semibold text-[var(--text-main)] flex items-center gap-1">
                      COD • <span className={`text-[10px] ${ord.paymentStatus === 'PAID' ? 'text-[var(--accent-primary)] font-bold' : 'text-amber-600 font-bold'}`}>{ord.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[var(--accent-primary)]">
                    #{ord.orderNumber}
                  </span>
                  <Link
                    to={`/orders/${ord._id}`}
                    className="text-xs font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                  >
                    <span>View Order</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Items and status */}
              <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ord.orderStatus === 'Delivered'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : ord.orderStatus === 'Cancelled'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {ord.deliveredAt
                        ? `Delivered on ${new Date(ord.deliveredAt).toLocaleDateString()}`
                        : `Estimated delivery by ${new Date(ord.estimatedDelivery || Date.now()).toLocaleDateString()}`}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-contain bg-white p-1 border shrink-0"
                        />
                        <div className="truncate max-w-[200px]">
                          <p className="font-semibold text-[var(--text-main)] truncate">{item.title}</p>
                          <p className="text-[10px] text-[var(--text-secondary)]">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
                  <Link
                    to={`/track-order/${ord._id}`}
                    className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 text-center flex items-center justify-center gap-1.5"
                  >
                    <Truck size={14} />
                    <span>Track Package</span>
                  </Link>
                  <Link
                    to={`/orders/${ord._id}`}
                    className="px-5 py-2.5 rounded-xl border theme-border theme-card text-xs font-semibold hover:bg-[var(--bg-secondary)] text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
