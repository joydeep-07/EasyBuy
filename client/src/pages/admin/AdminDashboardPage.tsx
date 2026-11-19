import React from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  PlusCircle,
  Package,
  ShoppingBag,
  Layers,
  Boxes,
  Users,
  Tag,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useGetAdminDashboardQuery } from '../../redux/api/adminApi';
import { StatisticsCards } from '../../components/admin/StatisticsCards';
import { RevenueChart } from '../../components/admin/RevenueChart';
import { RecentOrders } from '../../components/admin/RecentOrders';
import { TopSellingProducts } from '../../components/admin/TopSellingProducts';

export const AdminDashboardPage: React.FC = () => {
  const { data: dashboardData, isLoading, isFetching, refetch } = useGetAdminDashboardQuery();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse w-full">
        <div className="h-10 w-72 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      </div>
    );
  }

  const stats = dashboardData?.stats;
  const charts = dashboardData?.charts;
  const recentOrders = dashboardData?.recentOrders || [];
  const topProducts = dashboardData?.topProducts || [];

  return (
    <div className="space-y-8 w-full max-w-none">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
              Executive Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Real-time business intelligence, order queues, SKU stock health, and customer transactions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-3.5 py-2 rounded-xl border theme-border theme-card text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition-all flex items-center gap-1.5 shadow-2xs"
            title="Refresh database telemetry"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>

          <Link
            to="/admin/products/create"
            className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle size={14} />
            <span>New Product</span>
          </Link>
        </div>
      </div>

      {/* 2. Core KPI Statistics Grid (6 Cards) */}
      <StatisticsCards stats={stats} />

      {/* 3. Monthly Revenue Trend Chart & Category Allocations */}
      <RevenueChart charts={charts} />

      {/* 4. Recent Orders with Real Product Thumbnails & Top Selling SKUs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        <div className="lg:col-span-8 w-full">
          <RecentOrders orders={recentOrders} />
        </div>
        <div className="lg:col-span-4 w-full">
          <TopSellingProducts products={topProducts} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
