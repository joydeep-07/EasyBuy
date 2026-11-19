import React, { useState } from 'react';
import { Truck, Plus, Trash2, MapPin, Check, X, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetAdminDeliveryZonesQuery,
  useCreateDeliveryZoneMutation,
  useDeleteDeliveryZoneMutation,
} from '../../redux/api/adminApi';
import { AdminBadge } from '../../components/admin/AdminBadge';
import { EmptyState } from '../../components/admin/EmptyState';
import { toast } from 'sonner';

export const AdminShippingPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isServiceable, setIsServiceable] = useState(true);
  const [estimatedDays, setEstimatedDays] = useState(3);
  const [deliveryFee, setDeliveryFee] = useState(40);
  const [isCodAvailable, setIsCodAvailable] = useState(true);
  const [isExpressAvailable, setIsExpressAvailable] = useState(false);

  const { data: zonesData, isLoading, refetch } = useGetAdminDeliveryZonesQuery();
  const [createZone, { isLoading: isCreating }] = useCreateDeliveryZoneMutation();
  const [deleteZone] = useDeleteDeliveryZoneMutation();

  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || !city || !state) return;

    try {
      await createZone({
        pincode: pincode.trim(),
        city,
        state,
        isServiceable,
        estimatedDeliveryDays: Number(estimatedDays),
        deliveryFee: Number(deliveryFee),
        isCodAvailable,
        isExpressAvailable,
      }).unwrap();

      toast.success('Delivery zone saved successfully!');
      setIsModalOpen(false);
      setPincode('');
      setCity('');
      setState('');
      refetch();
    } catch (err: any) {
      toast.error('Failed to save delivery zone');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this delivery zone?')) {
      try {
        await deleteZone(id).unwrap();
        toast.success('Zone removed');
        refetch();
      } catch (e) {
        toast.error('Delete failed');
      }
    }
  };

  const zones = zonesData?.zones || [];

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
              Shipping & PIN Serviceability Zones
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
              {zones.length} Configured PINs
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Configure delivery SLAs, location eligibility, express options, and COD availability by postal code.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add PIN Zone</span>
        </button>
      </div>

      {/* 2. Zones Full-Width Table */}
      <div className="rounded-3xl theme-surface border theme-border overflow-hidden shadow-xs w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="bg-[var(--bg-secondary)]/50 border-b theme-border text-[var(--text-secondary)] text-[11px] font-semibold uppercase tracking-wider">
                <th className="p-4 font-semibold">Postal PIN Code</th>
                <th className="p-4 font-semibold">City & State Region</th>
                <th className="p-4 font-semibold">Estimated SLA</th>
                <th className="p-4 font-semibold">Standard Fee</th>
                <th className="p-4 font-semibold">COD Payment</th>
                <th className="p-4 font-semibold">Express Tier</th>
                <th className="p-4 font-semibold">Serviceability</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-xs text-[var(--text-secondary)]">
                    Loading delivery zones...
                  </td>
                </tr>
              ) : zones.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={Truck}
                      title="No custom delivery zones"
                      description="Default standard ground delivery rules are currently applied to all Indian PIN codes."
                      actionLabel="Create Custom Zone"
                      onAction={() => setIsModalOpen(true)}
                    />
                  </td>
                </tr>
              ) : (
                zones.map((z) => (
                  <tr key={z._id} className="hover:bg-[var(--bg-secondary)]/60 transition-colors">
                    {/* Pincode */}
                    <td className="p-4 font-mono font-bold text-xs text-[var(--accent-primary)]">
                      {z.pincode}
                    </td>

                    {/* Region */}
                    <td className="p-4 font-medium text-[var(--text-main)]">
                      {z.city}, {z.state}
                    </td>

                    {/* SLA */}
                    <td className="p-4 text-[var(--text-secondary)] whitespace-nowrap">
                      {z.estimatedDeliveryDays || 3} business days
                    </td>

                    {/* Fee */}
                    <td className="p-4 font-bold text-[var(--text-main)] whitespace-nowrap">
                      ₹{z.deliveryFee || 0}
                    </td>

                    {/* COD */}
                    <td className="p-4 whitespace-nowrap">
                      <AdminBadge variant={z.isCodAvailable ? 'success' : 'neutral'} size="sm">
                        {z.isCodAvailable ? 'COD Supported' : 'Prepaid Only'}
                      </AdminBadge>
                    </td>

                    {/* Express */}
                    <td className="p-4 whitespace-nowrap">
                      {z.isExpressAvailable ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          <Zap size={13} />
                          <span>Express (+₹{z.expressDeliveryFee || 60})</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400">Standard Only</span>
                      )}
                    </td>

                    {/* Serviceable */}
                    <td className="p-4 whitespace-nowrap">
                      <AdminBadge variant={z.isServiceable ? 'success' : 'danger'} size="sm">
                        {z.isServiceable ? 'Deliverable' : 'Suspended'}
                      </AdminBadge>
                    </td>

                    {/* Action */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(z._id)}
                        className="p-1.5 rounded-lg border theme-border text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete Zone"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
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
                  Add Delivery Zone
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-7 h-7 rounded-full border theme-border flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleSaveZone} className="space-y-3.5">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">
                    Postal PIN Code (6 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 700001, 110001"
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-mono font-bold text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      City / District *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Kolkata"
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. West Bengal"
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      Estimated SLA (Days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">
                      Delivery Fee (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1 font-semibold">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isServiceable}
                      onChange={(e) => setIsServiceable(e.target.checked)}
                      className="rounded accent-[var(--accent-primary)]"
                    />
                    <span>Serviceable by Delivery Fleet</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCodAvailable}
                      onChange={(e) => setIsCodAvailable(e.target.checked)}
                      className="rounded accent-[var(--accent-primary)]"
                    />
                    <span>Cash on Delivery (COD) Allowed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isExpressAvailable}
                      onChange={(e) => setIsExpressAvailable(e.target.checked)}
                      className="rounded accent-[var(--accent-primary)]"
                    />
                    <span>Express Air Shipping Option</span>
                  </label>
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
                    {isCreating ? 'Saving...' : 'Add Delivery Zone'}
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

export default AdminShippingPage;
