import React, { useState } from 'react';
import { Tag, Plus, Trash2, Calendar, Check, X } from 'lucide-react';
import {
  useGetAdminCouponsQuery,
  useCreateCouponMutation,
  useDeleteCouponMutation,
} from '../../redux/api/adminApi';
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

  const coupons = couponsData?.coupons || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-main)]">Coupons & Promotional Rules</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Configure discount codes, percentage ceilings, minimum spend limits, and expiration dates
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:opacity-90 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="rounded-3xl theme-surface border theme-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b theme-border text-[var(--text-secondary)]">
                <th className="p-4 font-semibold">Coupon Code</th>
                <th className="p-4 font-semibold">Discount Type & Value</th>
                <th className="p-4 font-semibold">Min Spend</th>
                <th className="p-4 font-semibold">Max Cap</th>
                <th className="p-4 font-semibold">Usage</th>
                <th className="p-4 font-semibold">Expires</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">Loading coupons...</td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">No active coupons configured.</td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="p-4 font-mono font-bold text-sm text-[var(--accent-primary)]">
                      {c.code}
                    </td>
                    <td className="p-4 font-semibold">
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                    </td>
                    <td className="p-4">₹{c.minOrderValue}</td>
                    <td className="p-4">{c.maxDiscountAmount ? `₹${c.maxDiscountAmount}` : 'No Cap'}</td>
                    <td className="p-4">
                      {c.usedCount} / {c.usageLimit}
                    </td>
                    <td className="p-4 text-[var(--text-secondary)]">
                      {new Date(c.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10"
                        title="Delete coupon"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl theme-surface border theme-border shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-[var(--text-main)]">Create Coupon</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FLASH30"
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Special weekend savings promotion"
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-bold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Valid Days from Today</label>
                  <input
                    type="number"
                    min={1}
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border theme-border font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-bold"
                >
                  {isCreating ? 'Creating...' : 'Activate Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
