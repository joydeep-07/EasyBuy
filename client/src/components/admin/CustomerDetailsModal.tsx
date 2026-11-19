import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Calendar,
  Shield,
  ShoppingBag,
  MapPin,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { AdminBadge } from './AdminBadge';

interface CustomerDetailsModalProps {
  customerId: string | null;
  detailData: any;
  onClose: () => void;
  onToggleStatus?: (id: string) => void;
}

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  customerId,
  detailData,
  onClose,
  onToggleStatus,
}) => {
  if (!customerId || !detailData?.customer) return null;

  const { customer, orders = [], addresses = [] } = detailData;

  const totalSpent = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl theme-surface border theme-border shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b theme-border flex items-center justify-between bg-[var(--bg-secondary)]/50">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold text-sm flex items-center justify-center">
                {customer.firstName?.[0]}
                {customer.lastName?.[0]}
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--text-main)]">
                  {customer.firstName} {customer.lastName}
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5 mt-0.5">
                  <Mail size={12} />
                  <span>{customer.email}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AdminBadge variant={customer.isActive ? 'success' : 'danger'}>
                {customer.isActive ? 'Active Account' : 'Suspended'}
              </AdminBadge>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full border theme-border flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border theme-border text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Total Orders</span>
                <p className="text-xl font-black text-[var(--text-main)]">{orders.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border theme-border text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Lifetime Spend</span>
                <p className="text-xl font-black text-[var(--accent-primary)]">
                  ₹{totalSpent.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border theme-border text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Member Since</span>
                <p className="text-xs font-bold text-[var(--text-main)] mt-2">
                  {new Date(customer.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-[var(--text-main)] flex items-center gap-1.5">
                <MapPin size={13} className="text-[var(--accent-primary)]" />
                <span>Saved Addresses ({addresses.length})</span>
              </h4>
              {addresses.length === 0 ? (
                <p className="text-gray-400 text-xs italic">No saved addresses</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-2xl border theme-border bg-[var(--bg-secondary)]/30 text-[11px] space-y-1">
                      <p className="font-semibold text-[var(--text-main)]">{addr.fullName}</p>
                      <p className="text-[var(--text-secondary)] leading-relaxed">
                        {addr.houseBuilding && `${addr.houseBuilding}, `}
                        {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)] font-mono">Ph: {addr.phoneNumber}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Customer Orders */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-[var(--text-main)] flex items-center gap-1.5">
                <ShoppingBag size={13} className="text-[var(--accent-primary)]" />
                <span>Order History ({orders.length})</span>
              </h4>
              {orders.length === 0 ? (
                <p className="text-gray-400 text-xs italic">No orders placed yet</p>
              ) : (
                <div className="divide-y theme-border border theme-border rounded-2xl overflow-hidden bg-[var(--bg-secondary)]/30">
                  {orders.map((o: any) => (
                    <div key={o._id} className="p-3 flex items-center justify-between text-xs hover:bg-[var(--bg-secondary)] transition-colors">
                      <div>
                        <span className="font-mono font-bold text-[var(--accent-primary)]">
                          #{o.orderNumber}
                        </span>
                        <p className="text-[10px] text-[var(--text-secondary)]">
                          {new Date(o.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })} • {o.items?.length || 0} item(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[var(--text-main)] block">
                          ₹{o.totalAmount?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
                          {o.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t theme-border bg-[var(--bg-secondary)]/50 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] text-xs font-semibold text-[var(--text-secondary)]"
            >
              Close
            </button>
            {onToggleStatus && (
              <button
                onClick={() => onToggleStatus(customer._id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  customer.isActive
                    ? 'border border-red-500/30 text-red-500 hover:bg-red-500/10'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {customer.isActive ? 'Suspend Customer Account' : 'Activate Customer Account'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
