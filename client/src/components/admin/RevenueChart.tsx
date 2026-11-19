import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Layers, ChevronRight, BarChart3, ArrowUpRight } from 'lucide-react';

interface RevenueChartProps {
  charts?: {
    monthlyTrends: { label: string; revenue: number; orders: number }[];
    categoryStats: { name: string; slug: string; productCount: number }[];
  };
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ charts }) => {
  const [viewMode, setViewMode] = useState<'revenue' | 'orders'>('revenue');

  const monthlyTrends = charts?.monthlyTrends || [];
  const categoryStats = charts?.categoryStats || [];

  const maxRevenue = Math.max(...monthlyTrends.map((t) => t.revenue), 10000);
  const maxOrders = Math.max(...monthlyTrends.map((t) => t.orders), 10);

  const totalPeriodRevenue = monthlyTrends.reduce((acc, cur) => acc + cur.revenue, 0);
  const totalPeriodOrders = monthlyTrends.reduce((acc, cur) => acc + cur.orders, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* 1. Monthly Revenue & Orders Analytics (8 cols) */}
      <div className="lg:col-span-8 p-6 rounded-3xl theme-surface border theme-border shadow-xs flex flex-col justify-between space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[var(--text-main)] tracking-tight">
                Financial Telemetry & Sales Velocity
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Live DB
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Period Gross: <strong className="text-[var(--text-main)]">₹{totalPeriodRevenue.toLocaleString('en-IN')}</strong> across{' '}
              <strong className="text-[var(--text-main)]">{totalPeriodOrders}</strong> processed orders
            </p>
          </div>

          {/* Metric Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[var(--bg-secondary)] border theme-border text-xs self-start sm:self-auto">
            <button
              onClick={() => setViewMode('revenue')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'revenue'
                  ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              Revenue (₹)
            </button>
            <button
              onClick={() => setViewMode('orders')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'orders'
                  ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              Order Count
            </button>
          </div>
        </div>

        {/* Visual Bar Progression */}
        <div className="space-y-4 pt-1">
          {monthlyTrends.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)] text-center py-8">
              No historical trend records found.
            </p>
          ) : (
            monthlyTrends.map((item, idx) => {
              const val = viewMode === 'revenue' ? item.revenue : item.orders;
              const maxVal = viewMode === 'revenue' ? maxRevenue : maxOrders;
              const percentage = Math.min(100, Math.round((val / maxVal) * 100));

              return (
                <div key={idx} className="space-y-1.5 group">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[var(--text-main)] text-[12px]">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-[var(--text-main)]">
                        {viewMode === 'revenue'
                          ? `₹${item.revenue.toLocaleString('en-IN')}`
                          : `${item.orders} orders`}
                      </span>
                      <span className="text-[11px] text-[var(--text-secondary)]">
                        ({viewMode === 'revenue' ? `${item.orders} orders` : `₹${item.revenue.toLocaleString('en-IN')}`})
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all duration-700 ease-out group-hover:brightness-110"
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t theme-border flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-emerald-500" />
            <span>Aggregate 6-month fulfillment analytics</span>
          </div>
          <Link
            to="/admin/orders"
            className="text-[var(--accent-primary)] font-semibold hover:underline inline-flex items-center gap-1"
          >
            <span>Order Logs</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>

      {/* 2. Category Catalog Breakdown (4 cols) */}
      <div className="lg:col-span-4 p-6 rounded-3xl theme-surface border theme-border shadow-xs flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[var(--accent-primary)]" />
            <h3 className="font-bold text-sm text-[var(--text-main)] tracking-tight">
              Department Allocation
            </h3>
          </div>
          <Link
            to="/admin/categories"
            className="text-xs font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-0.5"
          >
            <span>Manage</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {categoryStats.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)] text-center py-6">
              No category allocations found.
            </p>
          ) : (
            categoryStats.map((cat, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-[var(--bg-secondary)] border theme-border flex items-center justify-between text-xs hover:border-[var(--accent-primary)]/30 transition-all"
              >
                <div className="min-w-0 pr-2">
                  <span className="font-semibold text-[var(--text-main)] block truncate">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                    /{cat.slug}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full font-bold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[11px] shrink-0">
                  {cat.productCount} SKUs
                </span>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t theme-border text-[11px] text-[var(--text-secondary)]">
          Total {categoryStats.reduce((sum, c) => sum + c.productCount, 0)} items cataloged across categories
        </div>
      </div>
    </div>
  );
};
