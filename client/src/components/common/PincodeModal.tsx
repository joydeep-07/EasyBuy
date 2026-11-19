import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TextField, InputAdornment } from "@mui/material";
import {
  MapPin,
  X,
  Check,
  AlertCircle,
  Truck,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setSelectedPincode } from "../../redux/slices/addressSlice";
import { useLazyCheckPincodeQuery } from "../../redux/api/shippingApi";

interface PincodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PostalAreaInfo {
  areaName: string;
  district: string;
  state: string;
}

const POSTAL_API_URL =
  import.meta.env.VITE_POSTAL_PINCODE_API_URL ||
  "https://api.postalpincode.in/pincode";

export const PincodeModal: React.FC<PincodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const currentPincode = useAppSelector(
    (state) => state.address.selectedPincode,
  );
  const [pinInput, setPinInput] = useState(currentPincode || "713301");

  const [triggerCheck, { data, isFetching }] = useLazyCheckPincodeQuery();
  const [postalInfo, setPostalInfo] = useState<PostalAreaInfo | null>(null);
  const [isLookingUpArea, setIsLookingUpArea] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const cleanPin = pinInput.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setPostalInfo(null);
      return;
    }

    const timer = setTimeout(async () => {
      triggerCheck(cleanPin);

      setIsLookingUpArea(true);
      try {
        const res = await fetch(`${POSTAL_API_URL}/${cleanPin}`);
        const json = await res.json();
        if (json?.[0]?.Status === "Success" && json[0].PostOffice?.length > 0) {
          const po = json[0].PostOffice[0];
          setPostalInfo({
            areaName: po.Name,
            district: po.District,
            state: po.State,
          });
        } else {
          setPostalInfo(null);
        }
      } catch {
        setPostalInfo(null);
      } finally {
        setIsLookingUpArea(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [pinInput, isOpen, triggerCheck]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    if (!/^\d{6}$/.test(cleanPin)) return;

    try {
      const res = data?.data ? data : await triggerCheck(cleanPin).unwrap();
      if (res?.data) {
        dispatch(setSelectedPincode(cleanPin));
        onClose();
      }
    } catch {
      // Handled gracefully in UI
    }
  };

  if (!isOpen) return null;

  const isValidPin = /^\d{6}$/.test(pinInput.trim());
  const isLoading = isFetching || isLookingUpArea;
  const serviceData = data?.data;

  const resolvedArea = postalInfo?.areaName || serviceData?.city || "";

  const resolvedCityState = serviceData
    ? `${serviceData.city}, ${serviceData.state}`
    : postalInfo
      ? `${postalInfo.district}, ${postalInfo.state}`
      : "";

  const demoLocations = [
    { pin: "713301", label: "Asansol", status: "Available" },
    { pin: "700001", label: "Kolkata GPO", status: "Express" },
    { pin: "713302", label: "Asansol North", status: "Unavailable" },
    { pin: "713303", label: "Burnpur", status: "Restricted" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/40 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-6xl md:h-[500px] rounded-[28px] theme-surface border border-black/[0.08] dark:border-white/[0.08] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.28)] overflow-hidden grid grid-cols-1 md:grid-cols-12"
        >
          {/* Minimalist Close Button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-6 right-6 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.1] dark:hover:bg-white/[0.14] text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
          >
            <X size={16} strokeWidth={2} />
          </button>

          {/* LEFT PANE: Clean Input & Selection (7 Columns) */}
          <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-between h-full">
            <div>
              {/* Title Block */}
              <div className="max-w-md">
                <h2 className="text-[26px] font-semibold tracking-[-0.025em] text-[var(--text-main)] leading-tight">
                  Delivery Location
                </h2>
                <p className="text-[14px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  Enter a 6-digit PIN code to check local availability and
                  estimated delivery dates.
                </p>
              </div>

              {/* Input Row with MUI TextField */}
              <form onSubmit={handleApply} className="mt-8">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <TextField
                    fullWidth
                    autoFocus
                    variant="outlined"
                    label="6-Digit PIN Code"
                    placeholder="e.g. 713301"
                    value={pinInput}
                    onChange={(e) =>
                      setPinInput(e.target.value.replace(/\D/g, ""))
                    }
                    slotProps={{
                      htmlInput: {
                        maxLength: 6,
                        inputMode: "numeric",
                      },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <MapPin
                              size={17}
                              className="text-[var(--text-secondary)]"
                            />
                          </InputAdornment>
                        ),
                        endAdornment: isLoading ? (
                          <InputAdornment position="end">
                            <Loader2
                              size={16}
                              className="animate-spin text-[var(--text-secondary)]"
                            />
                          </InputAdornment>
                        ) : null,
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "52px",
                        borderRadius: "14px",
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-main)",
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                        fontSize: "17px",
                        fontWeight: 500,
                        letterSpacing: "0.16em",
                        transition: "all 0.2s ease",
                        "& fieldset": {
                          borderColor: "rgba(128, 128, 128, 0.22)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(128, 128, 128, 0.45)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "var(--accent-primary)",
                          borderWidth: "1.5px",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "var(--text-secondary)",
                        fontSize: "14px",
                        fontFamily: "inherit",
                        letterSpacing: "normal",
                        "&.Mui-focused": {
                          color: "var(--accent-primary)",
                        },
                      },
                      "& input::placeholder": {
                        fontFamily: "inherit",
                        letterSpacing: "normal",
                        fontSize: "14px",
                        opacity: 0.5,
                      },
                    }}
                  />

                  <button
                    type="submit"
                    disabled={
                      !isValidPin ||
                      isFetching ||
                      serviceData?.isServiceable === false
                    }
                    className="h-[52px] px-8 rounded-[14px] bg-[var(--accent-primary)] text-white font-medium text-[14px] tracking-[-0.01em] hover:opacity-90 active:scale-[0.99] disabled:opacity-35 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 shrink-0"
                  >
                    Apply
                  </button>
                </div>

                {/* Preset Locations */}
                <div className="mt-8">
                  <span className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-secondary)] mb-3">
                    Suggested Locations
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {demoLocations.map((loc) => {
                      const isSelected = pinInput === loc.pin;
                      return (
                        <button
                          key={loc.pin}
                          type="button"
                          onClick={() => setPinInput(loc.pin)}
                          className={`group p-3 rounded-xl text-left transition-all border ${
                            isSelected
                              ? "bg-[var(--bg-secondary)] border-[var(--accent-primary)]/60 shadow-xs"
                              : "bg-transparent border-black/[0.06] dark:border-white/[0.06] hover:bg-[var(--bg-secondary)]/60"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[13px] font-semibold text-[var(--text-main)]">
                              {loc.pin}
                            </span>
                            <ArrowUpRight
                              size={12}
                              className={`transition-opacity ${
                                isSelected
                                  ? "opacity-100 text-[var(--accent-primary)]"
                                  : "opacity-0 group-hover:opacity-50 text-[var(--text-secondary)]"
                              }`}
                            />
                          </div>
                          <p className="text-[12px] text-[var(--text-secondary)] truncate mt-0.5">
                            {loc.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </form>
            </div>

            {/* Subtle Footer Metadata */}
            <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[12px] text-[var(--text-secondary)]">
              <span>
                Standard &amp; Express shipping options updated automatically
              </span>
              {currentPincode && (
                <span className="font-mono text-[var(--text-main)] opacity-80">
                  Saved: {currentPincode}
                </span>
              )}
            </div>
          </div>

          {/* RIGHT PANE: Editorial Area & Status Summary (5 Columns) */}
          <div className="md:col-span-5 bg-[var(--bg-secondary)]/55 border-t md:border-t-0 md:border-l border-black/[0.06] dark:border-white/[0.06] p-8 sm:p-12 flex flex-col justify-between h-full">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-secondary)]">
                Area Details
              </span>

              {!isValidPin ? (
                <div className="mt-14">
                  <div className="w-10 h-10 rounded-full bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-[var(--text-secondary)] mb-4">
                    <MapPin size={18} strokeWidth={1.75} />
                  </div>
                  <p className="text-[15px] font-medium text-[var(--text-main)]">
                    No PIN code entered
                  </p>
                  <p className="text-[13px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                    Type a 6-digit PIN code to automatically detect your post
                    office locality and shipping eligibility.
                  </p>
                </div>
              ) : isLoading && !serviceData && !postalInfo ? (
                <div className="mt-8 space-y-3 animate-pulse">
                  <div className="h-7 w-2/3 rounded-lg bg-black/[0.06] dark:bg-white/[0.08]" />
                  <div className="h-4 w-1/2 rounded-md bg-black/[0.06] dark:bg-white/[0.08]" />
                  <div className="h-24 w-full rounded-2xl bg-black/[0.05] dark:bg-white/[0.06] mt-8" />
                </div>
              ) : (
                <motion.div
                  key={pinInput}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-6"
                >
                  {/* Clean Locality Typography */}
                  <h3 className="text-[28px] font-semibold tracking-[-0.025em] text-[var(--text-main)] leading-tight">
                    {resolvedArea || `PIN ${pinInput}`}
                  </h3>

                  {resolvedCityState && (
                    <p className="text-[14px] text-[var(--text-secondary)] mt-1">
                      {resolvedCityState} · {pinInput}
                    </p>
                  )}

                  {/* Hairline Divider */}
                  <div className="h-px w-full bg-black/[0.06] dark:bg-white/[0.06] my-7" />

                  {/* Status Card */}
                  {serviceData ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5">
                        {serviceData.isServiceable ? (
                          <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Check size={14} strokeWidth={2.5} />
                          </span>
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                            <AlertCircle size={14} strokeWidth={2.5} />
                          </span>
                        )}
                        <span className="text-[15px] font-medium text-[var(--text-main)]">
                          {serviceData.statusText}
                        </span>
                      </div>

                      {serviceData.isServiceable ? (
                        <div className="p-4 rounded-2xl theme-surface border border-black/[0.06] dark:border-white/[0.06] space-y-2.5">
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="text-[var(--text-secondary)] flex items-center gap-2">
                              <Truck size={14} /> Estimated Delivery
                            </span>
                            <span className="font-medium text-[var(--text-main)]">
                              {serviceData.estimatedDays} Business Days
                            </span>
                          </div>
                          <div className="h-px w-full bg-black/[0.05] dark:bg-white/[0.05]" />
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="text-[var(--text-secondary)]">
                              Shipping Fee
                            </span>
                            <span className="font-medium text-[var(--text-main)]">
                              {serviceData.deliveryFee === 0
                                ? "Free"
                                : `₹${serviceData.deliveryFee}`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                          Delivery is currently unavailable for{" "}
                          {resolvedArea || pinInput}. Please select a different
                          address or PIN code.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[13px] text-[var(--text-secondary)]">
                      Checking courier coverage...
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed opacity-80">
              Delivery times are estimates and may vary based on item
              availability.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
