import React, { useState } from 'react';
import { Truck, Plus, Trash2, MapPin, Check, X } from 'lucide-react';
import {
  useGetAdminDeliveryZonesQuery,
  useCreateDeliveryZoneMutation,
  useDeleteDeliveryZoneMutation,
} from '../../redux/api/adminApi';
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-main)]">Shipping & Serviceable PIN Zones</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Configure delivery SLAs, location eligibility, express options, and COD availability by postal code
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:opacity-90 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add PIN Code Zone</span>
        </button>
      </div>

      <div className="rounded-3xl theme-surface border theme-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b theme-border text-[var(--text-secondary)]">
                <th className="p-4 font-semibold">PIN Code</th>
                <th className="p-4 font-semibold">City & State</th>
                <th className="p-4 font-semibold">Serviceable?</th>
                <th className="p-4 font-semibold">Est. Days</th>
                <th className="p-4 font-semibold">Delivery Fee</th>
                <th className="p-4 font-semibold">COD Available?</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">Loading delivery zones...</td>
                </tr>
              ) : zones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">No postal delivery zones configured.</td>
                </tr>
              ) : (
                zones.map((z) => (
                  <tr key={z._id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="p-4 font-mono font-bold text-[var(--accent-primary)]">
                      {z.pincode}
                    </td>
                    <td className="p-4 font-semibold text-[var(--text-main)]">
                      {z.city}, {z.state}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          z.isServiceable
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {z.isServiceable ? 'Deliverable' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="p-4">{z.estimatedDeliveryDays} days</td>
                    <td className="p-4 font-bold">{z.deliveryFee === 0 ? 'FREE' : `₹${z.deliveryFee}`}</td>
                    <td className="p-4 font-bold">
                      {z.isCodAvailable ? <span className="text-emerald-500">Yes</span> : <span className="text-red-500">No</span>}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(z._id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10"
                        title="Delete zone"
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

      {/* Modal: Add Delivery Zone */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl theme-surface border theme-border shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-[var(--text-main)]">Add PIN Delivery Zone</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveZone} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">6-Digit PIN Code *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 713301"
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">City / Region *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Asansol"
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. West Bengal"
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Est. Delivery Days</label>
                  <input
                    type="number"
                    min={1}
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Delivery Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={isServiceable}
                    onChange={(e) => setIsServiceable(e.target.checked)}
                    className="rounded text-[var(--accent-primary)]"
                  />
                  <span>Is Serviceable (Allow orders)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={isCodAvailable}
                    onChange={(e) => setIsCodAvailable(e.target.checked)}
                    className="rounded text-[var(--accent-primary)]"
                  />
                  <span>Allow Cash on Delivery</span>
                </label>
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
                  {isCreating ? 'Saving...' : 'Save Delivery Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
