import React, { useState } from 'react';
import { Tag, Plus, Trash2, Calendar, Check, X, Copy, Percent, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetAdminCouponsQuery,
  useCreateCouponMutation,
  useDeleteCouponMutation,
} from '../../redux/api/adminApi';
import { AdminBadge } from '../../components/admin/AdminBadge';
import { EmptyState } from '../../components/admin/EmptyState';
import { toast } from 'sonner';

export const AdminCouponsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderValue, setMinOrderValue] = useState<number>(499);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number>(500);
  const [expiryDays, setExpiryDays] = useState<number>(30);
  const [usageLimit, setUsageLimit] = useState<number>(1000);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: couponsData, isLoading, refetch } = useGetAdminCouponsQuery();
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + Number(expiryDays));

    try {
      await createCoupon({
        code: code.toUpperCase().trim(),
        description,
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue),
        maxDiscountAmount: discountType === 'PERCENTAGE' ? Number(maxDiscountAmount) : null,
        expiryDate,
        usageLimit: Number(usageLimit),
        perUserLimit: 1,
      }).unwrap();

      toast.success('Promotional coupon created!');
      setIsModalOpen(false);
      setCode('');
      setDescription('');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create coupon');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(id).unwrap();
        toast.success('Coupon removed');
        refetch();
      } catch (err: any) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  const copyPromoCode = (c: string) => {
    navigator.clipboard.writeText(c);
    setCopiedCode(c);
    toast.success(`Copied coupon code ${c}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const coupons = couponsData?.coupons || [];

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
              Promotions & Discount Codes
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
              {coupons.length} Active Deals
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Configure promotional coupons, percentage ceilings, minimum spend limits, and expiry dates.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>New Coupon</span>
        </button>
      </div>

      {/* 2. Coupons Table */}
      <div className="rounded-3xl theme-surface border theme-border overflow-hidden shadow-xs w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="bg-[var(--bg-secondary)]/50 border-b theme-border text-[var(--text-secondary)] text-[11px] font-semibold uppercase tracking-wider">
                <th className="p-4 font-semibold">Promo Code</th>
                <th className="p-4 font-semibold">Benefit / Value</th>
                <th className="p-4 font-semibold">Min Order Value</th>
                <th className="p-4 font-semibold">Usage Limits</th>
                <th className="p-4 font-semibold">Valid Until</th>
                <th className="p-4 font-semibold">State</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-xs text-[var(--text-secondary)]">
                    Loading promotion rules...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Tag}
                      title="No promotional coupons"
                      description="Create coupon codes like WELCOME10 or FLAT50 to boost conversion."
                      actionLabel="Create First Coupon"
                      onAction={() => setIsModalOpen(true)}
                    />
                  </td>
                </tr>
              ) : (
                coupons.map((c) => {
                  const isExpired = new Date(c.expiryDate) < new Date();
                  const usedCount = c.usedCount || 0;
                  const limit = c.usageLimit || 1000;
                  const usagePercentage = Math.min(100, Math.round((usedCount / limit) * 100));

                  return (
                    <tr key={c._id} className="hover:bg-[var(--bg-secondary)]/60 transition-colors group">
                      {/* Code */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[var(--accent-primary)] bg-[var(--bg-secondary)] px-2.5 py-1 rounded-lg border theme-border">
                            {c.code}
                          </span>
                          <button
                            onClick={() => copyPromoCode(c.code)}
                            className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors opacity-0 group-hover:opacity-100"
                            title="Copy Code"
                          >
                            {copiedCode === c.code ? (
                              <Check size={12} className="text-emerald-500" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                        {c.description && (
                          <p className="text-[11px] text-[var(--text-secondary)] mt-1 truncate max-w-xs">
                            {c.description}
                          </p>
                        )}
                      </td>

                      {/* Benefit */}
                      <td className="p-4 font-bold text-[var(--text-main)] whitespace-nowrap">
                        {c.discountType === 'PERCENTAGE' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Percent size={13} /> {c.discountValue}% OFF
                          </span>
                        ) : (
                          <span className="text-[var(--accent-primary)]">
                            ₹{c.discountValue} FLAT OFF
                          </span>
                        )}
                        {c.maxDiscountAmount && (
                          <span className="block text-[10px] text-[var(--text-secondary)] font-normal">
                            Max ₹{c.maxDiscountAmount}
                          </span>
                        )}
                      </td>

                      {/* Min Order */}
                      <td className="p-4 whitespace-nowrap text-[var(--text-main)] font-semibold">
                        ₹{c.minOrderValue.toLocaleString('en-IN')}
                      </td>

                      {/* Usage */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="space-y-1 max-w-[120px]">
                          <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                            <span>{usedCount} used</span>
                            <span>{limit} max</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[var(--accent-primary)]"
                              style={{ width: `${Math.max(usagePercentage, 5)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Expiry */}
                      <td className="p-4 whitespace-nowrap font-mono text-[11px] text-[var(--text-secondary)]">
                        {new Date(c.expiryDate).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        <AdminBadge variant={isExpired ? 'danger' : 'success'}>
                          {isExpired ? 'Expired' : 'Active'}
                        </AdminBadge>
                      </td>

                      {/* Action */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="p-1.5 rounded-lg border theme-border text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Delete Coupon"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
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
                <h3 className="font-bold text-sm text-[var(--text-main)]">
                  Create Promotional Coupon
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-7 h-7 rounded-full border theme-border flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-3.5">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FESTIVE20, SAVE100"
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-mono font-bold text-xs focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. 20% discount on orders above ₹499"
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      Discount Calculation
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-semibold focus:outline-none"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Flat Fixed (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-bold text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      Min Order Value (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={minOrderValue}
                      onChange={(e) => setMinOrderValue(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      value={maxDiscountAmount}
                      onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
                      placeholder="Leave blank for none"
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      Valid Duration (Days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      Global Usage Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-bold hover:opacity-90 shadow-sm"
                  >
                    {isCreating ? 'Creating...' : 'Activate Coupon'}
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

export default AdminCouponsPage;
