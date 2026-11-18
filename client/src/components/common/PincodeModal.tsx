import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Check, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setSelectedPincode } from '../../redux/slices/addressSlice';
import { useLazyCheckPincodeQuery } from '../../redux/api/shippingApi';

interface PincodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PincodeModal: React.FC<PincodeModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const currentPincode = useAppSelector((state) => state.address.selectedPincode);
  const [pinInput, setPinInput] = useState(currentPincode || '713301');
  const [triggerCheck, { data, isFetching, error }] = useLazyCheckPincodeQuery();

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pinInput.trim())) return;

    const res = await triggerCheck(pinInput.trim()).unwrap();
    if (res?.data) {
      dispatch(setSelectedPincode(pinInput.trim()));
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md p-6 rounded-2xl theme-surface border theme-border shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-2xl bg-[var(--accent-surface)] text-[var(--accent-primary)]">
              <MapPin size={22} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-main)] tracking-tight">Choose your delivery location</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Delivery options and speeds are verified for your area
              </p>
            </div>
          </div>

          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Enter a 6-digit Indian PIN code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 713301"
                  className="flex-1 px-4 py-2.5 rounded-full border theme-border bg-[var(--bg-secondary)] text-[var(--text-main)] font-mono text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                />
                <button
                  type="submit"
                  disabled={pinInput.length !== 6 || isFetching}
                  className="px-6 py-2.5 rounded-full bg-[var(--accent-primary)] text-white font-medium text-sm hover:brightness-105 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1.5"
                >
                  {isFetching ? 'Checking...' : 'Apply'}
                </button>
              </div>
            </div>

            {/* Quick Demo PIN Shortcuts */}
            <div className="pt-1">
              <p className="text-[11px] font-medium text-[var(--text-secondary)] mb-2">Try Demo Locations:</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPinInput('713301')}
                  className="px-3 py-1 rounded-full border theme-border hover:bg-[var(--accent-surface)] text-[var(--accent-primary)] font-medium transition-colors"
                >
                  713301 (Deliverable)
                </button>
                <button
                  type="button"
                  onClick={() => setPinInput('713302')}
                  className="px-3 py-1 rounded-full border theme-border hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] transition-colors"
                >
                  713302 (Unavailable)
                </button>
                <button
                  type="button"
                  onClick={() => setPinInput('713303')}
                  className="px-3 py-1 rounded-full border theme-border hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] transition-colors"
                >
                  713303 (Restricted)
                </button>
                <button
                  type="button"
                  onClick={() => setPinInput('700001')}
                  className="px-3 py-1 rounded-full border theme-border hover:bg-[var(--accent-surface)] text-[var(--accent-primary)] font-medium transition-colors"
                >
                  700001 (Kolkata)
                </button>
              </div>
            </div>

            {/* Status Feedback */}
            {data?.data && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                  data.data.isServiceable
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400'
                }`}
              >
                {data.data.isServiceable ? <Check size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                <div>
                  <p className="font-semibold">{data.data.statusText} ({data.data.city}, {data.data.state})</p>
                  {data.data.isServiceable ? (
                    <p className="mt-0.5 opacity-90">
                      Standard delivery in {data.data.estimatedDays} days • {data.data.deliveryFee === 0 ? 'FREE Delivery' : `₹${data.data.deliveryFee} shipping`}
                    </p>
                  ) : (
                    <p className="mt-0.5 opacity-90">Delivery is temporarily not available to this area.</p>
                  )}
                </div>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
