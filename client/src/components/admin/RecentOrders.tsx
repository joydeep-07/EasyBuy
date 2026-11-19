import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Package,
  Calendar,
  Banknote,
  Eye,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { AdminBadge, getStatusBadgeVariant } from './AdminBadge';
import { OrderDetailsModal } from './OrderDetailsModal';
import { SelectedVariantSummary } from '../common/variants/SelectedVariantSummary';
import type { Order } from '../../types';
import { toast } from 'sonner';

interface RecentOrdersProps {
  orders: Order[];
  onOpenStatusModal?: (order: Order) => void;
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ orders, onOpenStatusModal }) => {
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fallbackImage =
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&auto=format&fit=crop&q=80';

  const copyOrderNo = (orderNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(orderNumber);
    setCopiedId(orderNumber);
    toast.success(`Copied #${orderNumber}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <div className="p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-5 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Package size={17} className="text-[var(--accent-primary)]" />
              <h3 className="font-bold text-sm text-[var(--text-main)] tracking-tight">
                Recent Orders & Product Fulfillment
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Live orders received with product thumbnails, payment state, and quick inspection
            </p>
          </div>

          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-[var(--accent-primary)] hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>All Orders ({orders.length})</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--text-secondary)]">
            No recent orders found.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead>
                <tr className="border-b theme-border text-[var(--text-secondary)] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="pb-3.5 pr-3 font-semibold">Order ID</th>
                  <th className="pb-3.5 px-3 font-semibold">Products & Items</th>
                  <th className="pb-3.5 px-3 font-semibold">Customer</th>
                  <th className="pb-3.5 px-3 font-semibold">Date</th>
                  <th className="pb-3.5 px-3 font-semibold">Total</th>
                  <th className="pb-3.5 px-3 font-semibold">Payment</th>
                  <th className="pb-3.5 px-3 font-semibold">Status</th>
                  <th className="pb-3.5 pl-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y theme-border">
                {orders.map((ord) => {
                  const customerName =
                    typeof ord.user === 'object' && ord.user !== null
                      ? `${ord.user.firstName} ${ord.user.lastName}`
                      : ord.addressSnapshot?.fullName || 'Customer';

                  const primaryItem = ord.items?.[0];
                  const totalQty = ord.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 0;
                  const additionalItemCount = (ord.items?.length || 1) - 1;

                  return (
                    <tr
                      key={ord._id}
                      onClick={() => setInspectOrder(ord)}
                      className="hover:bg-[var(--bg-secondary)]/70 transition-colors cursor-pointer group"
                    >
                      {/* 1. Order ID */}
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[var(--accent-primary)] text-xs">
                            #{ord.orderNumber}
                          </span>
                          <button
                            onClick={(e) => copyOrderNo(ord.orderNumber, e)}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-main)] p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Copy Order #"
                          >
                            {copiedId === ord.orderNumber ? (
                              <Check size={11} className="text-emerald-500" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        </div>
                        {(ord.trackingId || ord.trackingInfo?.trackingId) && (
                          <span className="block text-[10px] font-mono text-[var(--text-secondary)]">
                            {ord.trackingId || ord.trackingInfo?.trackingId}
                          </span>
                        )}
                      </td>

                      {/* 2. Product Thumbnails & Name */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3 max-w-[280px]">
                          {/* Image stack */}
                          <div className="relative flex items-center shrink-0">
                            <img
                              src={primaryItem?.image || fallbackImage}
                              alt={primaryItem?.title || 'Product'}
                              className="w-10 h-10 rounded-xl object-contain bg-white p-1 border theme-border shrink-0 shadow-2xs"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = fallbackImage;
                              }}
                            />
                            {additionalItemCount > 0 && (
                              <span
                                className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[var(--text-main)] text-[var(--bg-main)] shadow-xs"
                                title={`+${additionalItemCount} more item(s)`}
                              >
                                +{additionalItemCount}
                              </span>
                            )}
                          </div>

                          {/* Product Title and Quantity */}
                          <div className="truncate">
                            <p className="font-medium text-[var(--text-main)] text-xs truncate">
                              {primaryItem?.title || 'EasyBuy Item'}
                            </p>
                            <SelectedVariantSummary
                              variantTitle={primaryItem?.variantTitle}
                              selectedAttributes={primaryItem?.selectedAttributes}
                            />
                            <p className="text-[11px] text-[var(--text-secondary)]">
                              Qty: <strong className="text-[var(--text-main)]">{totalQty}</strong>{' '}
                              ({ord.items?.length || 1} SKU{ord.items?.length > 1 ? 's' : ''})
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 3. Customer */}
                      <td className="py-3.5 px-3 text-[var(--text-main)]">
                        <p className="font-medium truncate max-w-[140px]">{customerName}</p>
                        <p className="text-[10px] text-[var(--text-secondary)]">
                          {ord.addressSnapshot?.city || 'India'}
                        </p>
                      </td>

                      {/* 4. Date */}
                      <td className="py-3.5 px-3 text-[var(--text-secondary)] whitespace-nowrap text-[11px] font-mono">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* 5. Total Amount */}
                      <td className="py-3.5 px-3 font-bold text-[var(--text-main)] whitespace-nowrap text-xs">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </td>

                      {/* 6. Payment Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <AdminBadge
                          variant={ord.paymentStatus === 'PAID' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {ord.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
                        </AdminBadge>
                      </td>

                      {/* 7. Order Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <AdminBadge
                          variant={getStatusBadgeVariant(ord.orderStatus)}
                          size="sm"
                        >
                          {ord.orderStatus}
                        </AdminBadge>
                      </td>

                      {/* 8. Action */}
                      <td className="py-3.5 pl-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectOrder(ord);
                          }}
                          className="px-2.5 py-1 rounded-lg border theme-border font-semibold text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition-colors inline-flex items-center gap-1"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Modal */}
      <OrderDetailsModal
        order={inspectOrder}
        onClose={() => setInspectOrder(null)}
        onOpenStatusModal={onOpenStatusModal}
      />
    </>
  );
};
