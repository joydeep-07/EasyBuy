import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Calendar,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { useGetOrderTrackingQuery } from '../../redux/api/shippingApi';

export const TrackOrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: trackData, isLoading } = useGetOrderTrackingQuery(id || '');

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      </div>
    );
  }

  if (!trackData) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="text-xl font-bold">Tracking record not found</h2>
        <Link to="/orders" className="text-xs font-bold text-[var(--accent-primary)] hover:underline">
          Return to My Orders
        </Link>
      </div>
    );
  }

  const { orderNumber, orderStatus, estimatedDelivery, deliveredAt, stages, statusHistory, shipment, addressSnapshot } =
    trackData;

  return (
    <div className="w-full px-4 sm:px-6 py-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b theme-border">
        <div>
          <Link to="/orders" className="text-xs text-[var(--accent-primary)] font-semibold flex items-center gap-1 mb-1">
            <ArrowLeft size={14} /> Back to Orders
          </Link>
          <h1 className="text-2xl font-black text-[var(--text-main)]">
            Tracking Details
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Order #{orderNumber}
          </p>
        </div>

        {shipment && (
          <div className="text-right text-xs">
            <span className="text-[var(--text-secondary)]">Courier: </span>
            <strong className="text-[var(--text-main)]">{shipment.shippingCompany}</strong>
            <p className="font-mono text-[var(--accent-primary)] font-bold">
              AWB: {shipment.trackingId}
            </p>
            {shipment.trackingUrl && (
              <a
                href={shipment.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-500 hover:underline inline-flex items-center gap-1 mt-0.5"
              >
                <span>Courier Portal</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Estimated Delivery Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-800 text-white shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-100 flex items-center gap-1.5">
            <Calendar size={14} />
            {deliveredAt ? 'Delivered On' : 'Estimated Delivery Date'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black">
            {new Date(deliveredAt || estimatedDelivery || Date.now()).toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </h2>
          <p className="text-xs text-emerald-100">
            Current Status: <strong>{orderStatus}</strong>
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md">
          <Truck size={36} />
        </div>
      </div>

      {/* Visual Timeline Stepper */}
      <div className="p-6 sm:p-8 rounded-3xl theme-surface border theme-border shadow-sm space-y-6">
        <h3 className="font-bold text-sm text-[var(--text-main)]">Delivery Progress</h3>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
          {stages.map((stg, idx) => (
            <div
              key={stg.key}
              className="flex md:flex-col items-center gap-3 md:text-center z-10 flex-1 relative"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
                  stg.completed
                    ? 'bg-[var(--accent-primary)] text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                }`}
              >
                {stg.completed ? <CheckCircle2 size={18} /> : idx + 1}
              </div>
              <div className="text-left md:text-center">
                <p className={`text-xs font-bold ${stg.completed ? 'text-[var(--text-main)]' : 'text-gray-400'}`}>
                  {stg.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Status Log */}
      <div className="p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-[var(--text-main)]">Tracking History</h3>

        <div className="space-y-4 text-xs">
          {statusHistory && statusHistory.length > 0 ? (
            statusHistory.map((hist, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b theme-border last:border-b-0">
                <div className="p-1.5 rounded-full bg-emerald-500/10 text-[var(--accent-primary)] mt-0.5">
                  <CheckCircle2 size={14} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--text-main)]">{hist.status}</span>
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      {new Date(hist.timestamp).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {hist.comment && <p className="text-[var(--text-secondary)] mt-0.5">{hist.comment}</p>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No transit updates yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
