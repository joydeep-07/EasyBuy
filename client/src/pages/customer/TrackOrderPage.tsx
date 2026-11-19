import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Search,
  X,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useGetOrderTrackingQuery } from '../../redux/api/shippingApi';
import { useGetMyOrdersQuery } from '../../redux/api/orderApi';
import { useAppSelector } from '../../redux/hooks';
import { toast } from 'sonner';

export const TrackOrderPage: React.FC = () => {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryId = searchParams.get('id') || searchParams.get('trackingId') || searchParams.get('q');
  const activeIdentifier = (paramId || queryId || '').trim();

  const [searchInput, setSearchInput] = useState(activeIdentifier);
  const [copied, setCopied] = useState(false);

  // Sync input if param changes
  useEffect(() => {
    setSearchInput(activeIdentifier);
  }, [activeIdentifier]);

  // Auth state to fetch user orders if logged in
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data: myOrdersData } = useGetMyOrdersQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Query tracking for activeIdentifier
  const {
    data: trackData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetOrderTrackingQuery(activeIdentifier, {
    skip: !activeIdentifier,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim();
    if (!clean) {
      toast.error('Please enter a Tracking ID or Order Number');
      return;
    }
    navigate(`/track-order/${encodeURIComponent(clean)}`);
  };

  const handleClear = () => {
    setSearchInput('');
    navigate('/track-order');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Tracking ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full px-4 sm:px-6 py-8 max-w-4xl mx-auto space-y-8 min-h-[75vh]">
      {/* 1. Header & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-2">
          <Link to="/" className="hover:text-[var(--accent-primary)] transition-colors">
            Home
          </Link>
          <span>/</span>
          {isAuthenticated && (
            <>
              <Link to="/orders" className="hover:text-[var(--accent-primary)] transition-colors">
                My Orders
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-[var(--text-main)] font-semibold">Track Order</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] flex items-center gap-2.5">
              <Truck className="text-[var(--accent-primary)]" size={30} />
              <span>Track Your Package</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Enter your unique tracking ID or order number to see real-time transit milestones.
            </p>
          </div>

          {activeIdentifier && (
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border theme-border theme-card text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition-all self-start sm:self-center"
              title="Refresh tracking status"
            >
              <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Prominent Search Box */}
      <div className="p-4 sm:p-5 rounded-3xl theme-surface border theme-border shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Tracking ID (e.g. TRK-..., BD-..., DEL-...) or Order #"
              className="w-full pl-10 pr-9 py-3 rounded-2xl border theme-border theme-card text-xs sm:text-sm font-medium text-[var(--text-main)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-main)] p-1 rounded-full hover:bg-[var(--bg-secondary)]"
                title="Clear"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!searchInput.trim() || isFetching}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[var(--accent-primary)] text-white text-xs sm:text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:pointer-events-none shadow-sm"
          >
            <Truck size={16} />
            <span>Track Order</span>
          </button>
        </form>

        {/* Quick Sample / Test Suggestions */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-secondary)] pt-1">
          <span className="font-semibold">Quick Search Examples:</span>
          {['BD-847291039', 'DEL-928174102', 'EB-202611-1001'].map((sampleId) => (
            <button
              key={sampleId}
              type="button"
              onClick={() => {
                setSearchInput(sampleId);
                navigate(`/track-order/${encodeURIComponent(sampleId)}`);
              }}
              className="px-2.5 py-0.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--accent-primary)]/10 hover:text-[var(--accent-primary)] font-mono font-medium border theme-border transition-colors cursor-pointer"
            >
              {sampleId}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Content Views: No active search / Loading / Error / Success */}
      {!activeIdentifier ? (
        /* Empty State: Guide & Recent Orders */
        <div className="space-y-6">
          <div className="p-8 rounded-3xl theme-surface border theme-border text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-[var(--accent-primary)] mx-auto flex items-center justify-center">
              <Package size={32} />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h2 className="text-lg font-bold text-[var(--text-main)]">
                Track Any EasyBuy Shipment
              </h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Every order placed on EasyBuy is assigned a unique Tracking ID. Search above with your
                Tracking ID, carrier AWB, or order number to see live status.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[var(--accent-primary)]" />
                <span>Real-Time Courier Updates</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[var(--accent-primary)]" />
                <span>Accurate Delivery Dates</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[var(--accent-primary)]" />
                <span>Verified Carrier Links</span>
              </div>
            </div>
          </div>

          {/* Quick Track User's Existing Orders if Logged In */}
          {isAuthenticated && myOrdersData?.orders && myOrdersData.orders.length > 0 && (
            <div className="p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b theme-border">
                <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                  <Clock size={16} className="text-[var(--accent-primary)]" />
                  <span>Your Recent Orders</span>
                </h3>
                <Link
                  to="/orders"
                  className="text-xs text-[var(--accent-primary)] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>All Orders</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myOrdersData.orders.slice(0, 4).map((ord: any) => {
                  const effectiveId = ord.trackingId || ord.orderNumber || ord._id;
                  return (
                    <div
                      key={ord._id}
                      className="p-4 rounded-2xl bg-[var(--bg-secondary)] border theme-border flex items-center justify-between gap-3 hover:border-[var(--accent-primary)]/40 transition-all"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[var(--accent-primary)]">
                            #{ord.orderNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.orderStatus === 'Delivered'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : ord.orderStatus === 'Cancelled'
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                        </div>
                        {ord.trackingId && (
                          <p className="text-[11px] font-mono text-[var(--text-secondary)] truncate">
                            Track ID: {ord.trackingId}
                          </p>
                        )}
                        <p className="text-[10px] text-[var(--text-secondary)]">
                          Placed on {new Date(ord.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSearchInput(effectiveId);
                          navigate(`/track-order/${encodeURIComponent(effectiveId)}`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shrink-0 flex items-center gap-1"
                      >
                        <Truck size={12} />
                        <span>Track</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : isLoading ? (
        /* Loading Skeleton */
        <div className="space-y-6 animate-pulse">
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
          <div className="h-44 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        </div>
      ) : error || !trackData?.success ? (
        /* Not Found / Error State */
        <div className="p-8 rounded-3xl theme-surface border theme-border shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-lg font-bold text-[var(--text-main)]">
              No Tracking Record Found
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              We couldn&apos;t find an order or shipment matching{' '}
              <strong className="text-[var(--text-main)] font-mono">&ldquo;{activeIdentifier}&rdquo;</strong>.
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] pt-1">
              Please ensure your Tracking ID or Order # is correct. You can find your unique Tracking
              ID in your{' '}
              <Link to="/orders" className="text-[var(--accent-primary)] font-bold hover:underline">
                My Orders
              </Link>{' '}
              page or in your order confirmation screen.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleClear}
              className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Clear & Search Another
            </button>
            <Link
              to="/orders"
              className="px-5 py-2.5 rounded-xl border theme-border theme-card text-xs font-semibold hover:bg-[var(--bg-secondary)] transition-colors"
            >
              View My Orders
            </Link>
          </div>
        </div>
      ) : (
        /* Success State: Tracking Details */
        <div className="space-y-6">
          {/* Tracking Summary Card */}
          <div className="p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b theme-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm sm:text-base font-black text-[var(--text-main)]">
                    Order #{trackData.orderNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      trackData.orderStatus === 'Delivered'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : trackData.orderStatus === 'Cancelled'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {trackData.orderStatus}
                  </span>
                </div>

                {/* Unique Tracking ID Display with Copy */}
                {trackData.trackingId && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-xs text-[var(--text-secondary)] font-medium">Tracking ID:</span>
                    <span className="font-mono text-xs font-bold text-[var(--accent-primary)] bg-[var(--bg-secondary)] px-2.5 py-1 rounded-lg border theme-border">
                      {trackData.trackingId}
                    </span>
                    <button
                      onClick={() => copyToClipboard(trackData.trackingId!)}
                      className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
                      title="Copy Tracking ID"
                    >
                      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                )}
              </div>

              {/* Courier Partner Info */}
              {trackData.shipment && (
                <div className="sm:text-right text-xs space-y-1">
                  <span className="text-[var(--text-secondary)]">Courier Partner: </span>
                  <strong className="text-[var(--text-main)] block sm:inline">
                    {trackData.shipment.shippingCompany}
                  </strong>
                  {trackData.shipment.trackingId && (
                    <p className="font-mono text-[11px] text-[var(--text-secondary)]">
                      AWB / Waybill: <strong className="text-[var(--text-main)]">{trackData.shipment.trackingId}</strong>
                    </p>
                  )}
                  {trackData.shipment.trackingUrl && (
                    <a
                      href={trackData.shipment.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-500 hover:underline inline-flex items-center gap-1 mt-0.5 font-semibold"
                    >
                      <span>Open Carrier Portal</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Estimated Delivery Banner */}
            <div
              className={`p-6 rounded-2xl text-white shadow-md flex items-center justify-between ${
                trackData.orderStatus === 'Delivered'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-800'
                  : trackData.orderStatus === 'Cancelled'
                  ? 'bg-gradient-to-r from-red-600 to-rose-800'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-800'
              }`}
            >
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-100 flex items-center gap-1.5">
                  <Calendar size={14} />
                  {trackData.deliveredAt
                    ? 'Delivered On'
                    : trackData.orderStatus === 'Cancelled'
                    ? 'Order Cancelled'
                    : 'Estimated Delivery Date'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black">
                  {trackData.orderStatus === 'Cancelled'
                    ? 'Cancelled'
                    : new Date(
                        trackData.deliveredAt || trackData.estimatedDelivery || Date.now()
                      ).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                </h2>
                <p className="text-xs text-emerald-100">
                  Current Status: <strong>{trackData.orderStatus}</strong>
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md shrink-0">
                <Truck size={34} />
              </div>
            </div>
          </div>

          {/* Visual Timeline Stepper */}
          <div className="p-6 sm:p-8 rounded-3xl theme-surface border theme-border shadow-sm space-y-6">
            <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
              <Package size={16} className="text-[var(--accent-primary)]" />
              <span>Delivery Milestone Progress</span>
            </h3>

            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
              {trackData.stages.map((stg, idx) => (
                <div
                  key={stg.key}
                  className="flex md:flex-col items-center gap-3 md:text-center z-10 flex-1 relative w-full md:w-auto"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0 ${
                      stg.isError
                        ? 'bg-red-500 text-white shadow-md'
                        : stg.completed
                        ? 'bg-[var(--accent-primary)] text-white shadow-md'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                    } ${stg.current ? 'ring-4 ring-[var(--accent-primary)]/30 animate-pulse' : ''}`}
                  >
                    {stg.isError ? (
                      <X size={20} />
                    ) : stg.completed ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div className="text-left md:text-center">
                    <p
                      className={`text-xs font-bold ${
                        stg.isError
                          ? 'text-red-500'
                          : stg.completed
                          ? 'text-[var(--text-main)]'
                          : 'text-gray-400'
                      }`}
                    >
                      {stg.label}
                    </p>
                    {stg.current && (
                      <span className="inline-block px-2 py-0.5 mt-0.5 rounded-full text-[9px] font-bold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                        Current Step
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipment Items Snapshot (if available) */}
          {trackData.items && trackData.items.length > 0 && (
            <div className="p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                <Package size={16} className="text-[var(--accent-primary)]" />
                <span>Package Items ({trackData.items.length})</span>
              </h3>

              <div className="divide-y theme-border">
                {trackData.items.map((item, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3 text-xs">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 rounded-xl object-contain bg-white p-1 border theme-border shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[var(--text-main)] truncate">{item.title}</p>
                      {item.brand && (
                        <p className="text-[10px] text-[var(--text-secondary)]">{item.brand}</p>
                      )}
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                        Qty: <strong>{item.quantity}</strong> • Price: ₹{item.unitPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Destination Snapshot & Delivery Address */}
          {trackData.addressSnapshot && (
            <div className="p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-2 text-xs">
              <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                <MapPin size={16} className="text-[var(--accent-primary)]" />
                <span>Delivery Destination</span>
              </h3>
              <p className="font-bold text-[var(--text-main)]">{trackData.addressSnapshot.fullName}</p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {trackData.addressSnapshot.houseBuilding && `${trackData.addressSnapshot.houseBuilding}, `}
                {trackData.addressSnapshot.street && `${trackData.addressSnapshot.street}, `}
                {trackData.addressSnapshot.locality && `${trackData.addressSnapshot.locality}, `}
                {trackData.addressSnapshot.city}, {trackData.addressSnapshot.state} -{' '}
                <strong className="text-[var(--text-main)]">{trackData.addressSnapshot.pincode}</strong>
              </p>
            </div>
          )}

          {/* Detailed Transit History Log */}
          <div className="p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
              <Clock size={16} className="text-[var(--accent-primary)]" />
              <span>Tracking Updates History</span>
            </h3>

            <div className="space-y-4 text-xs">
              {trackData.statusHistory && trackData.statusHistory.length > 0 ? (
                trackData.statusHistory.map((hist, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b theme-border last:border-b-0">
                    <div className="p-1.5 rounded-full bg-emerald-500/10 text-[var(--accent-primary)] mt-0.5 shrink-0">
                      <CheckCircle2 size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-bold text-[var(--text-main)]">{hist.status}</span>
                        <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                          {new Date(hist.timestamp).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {hist.comment && (
                        <p className="text-[var(--text-secondary)] mt-0.5">{hist.comment}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[var(--text-secondary)] text-xs">No transit log updates yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
