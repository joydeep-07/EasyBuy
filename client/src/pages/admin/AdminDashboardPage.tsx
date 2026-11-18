import React from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useGetAdminDashboardQuery } from '../../redux/api/adminApi';

export const AdminDashboardPage: React.FC = () => {
  const { data: dashboardData, isLoading, refetch } = useGetAdminDashboardQuery();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats;
  const charts = dashboardData?.charts;
  const recentOrders = dashboardData?.recentOrders || [];
  const topProducts = dashboardData?.topProducts || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)]">
            Platform Analytics & Operations
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Real-time live database telemetry, financial performance, and fulfillment queues
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 self-start sm:self-auto"
        >
          Refresh Telemetry
        </button>
      </div>

      {/* 1. Core KPIs Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-3xl theme-surface border theme-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text-secondary)]">Total Gross Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-[var(--accent-primary)]">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[var(--text-main)]">
            ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp size={12} />
            <span>Across {stats?.totalOrders || 0} customer orders</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-3xl theme-surface border theme-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text-secondary)]">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[var(--text-main)]">
            {stats?.totalOrders || 0}
          </div>
          <div className="flex gap-2 text-[10px] text-[var(--text-secondary)]">
            <span className="text-amber-500 font-bold">{stats?.pendingOrders || 0} pending</span>
            <span>•</span>
            <span className="text-emerald-500 font-bold">{stats?.deliveredOrders || 0} delivered</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="p-5 rounded-3xl theme-surface border theme-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text-secondary)]">Registered Customers</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[var(--text-main)]">
            {stats?.totalCustomers || 0}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">Active customer accounts</p>
        </div>

        {/* Total Products & Low Stock */}
        <div className="p-5 rounded-3xl theme-surface border theme-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text-secondary)]">Catalog & Stock</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Package size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[var(--text-main)]">
            {stats?.totalProducts || 0}
          </div>
          <div className="flex gap-2 text-[10px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{stats?.activeProducts || 0} active</span>
            <span>•</span>
            <span className="text-red-500 font-bold">{stats?.lowStockCount || 0} stock alerts</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Trends & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Revenue Trend Bars (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--text-main)]">Monthly Revenue & Orders Trend</h3>
            <span className="text-xs text-[var(--accent-primary)] font-semibold">Past 6 Months</span>
          </div>

          <div className="space-y-3 pt-2">
            {charts?.monthlyTrends?.map((item, idx) => {
              const maxRev = Math.max(...(charts.monthlyTrends.map((t) => t.revenue) || [100000]), 10000);
              const percentage = Math.min(100, Math.round((item.revenue / maxRev) * 100));

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[var(--text-secondary)]">{item.label}</span>
                    <span className="font-bold text-[var(--text-main)]">
                      ₹{item.revenue.toLocaleString('en-IN')}{' '}
                      <span className="text-[10px] text-gray-400 font-normal">({item.orders} orders)</span>
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Performance Breakdown (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--text-main)]">Departments Catalog Distribution</h3>
            <Link to="/admin/categories" className="text-xs font-bold text-[var(--accent-primary)] hover:underline">
              Manage
            </Link>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {charts?.categoryStats?.map((cat, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-[var(--text-main)]">{cat.name}</span>
                <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-500/10 text-[var(--accent-primary)] text-[11px]">
                  {cat.productCount} items
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Orders Table (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--text-main)]">Recent Customer Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1">
              <span>View all orders</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b theme-border text-[var(--text-secondary)]">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y theme-border">
                {recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="py-3 font-mono font-bold text-[var(--accent-primary)]">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 text-[var(--text-main)]">
                      {typeof ord.user === 'object' && ord.user !== null
                        ? `${ord.user.firstName} ${ord.user.lastName}`
                        : ord.addressSnapshot?.fullName || 'Customer'}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : ord.orderStatus === 'Cancelled'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-[var(--text-main)]">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to="/admin/orders"
                        className="px-2.5 py-1 rounded-lg border theme-border font-semibold hover:bg-[var(--bg-secondary)]"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Products (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[var(--text-main)]">Top Sales Volume</h3>
          <div className="space-y-3">
            {topProducts.map((p: any) => (
              <div key={p._id} className="flex items-center gap-3 text-xs">
                <img
                  src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                  alt={p.title}
                  className="w-12 h-12 rounded-xl object-contain bg-white p-1 border shrink-0"
                />
                <div className="flex-1 truncate">
                  <p className="font-semibold text-[var(--text-main)] truncate">{p.title}</p>
                  <p className="text-[11px] text-[var(--accent-primary)] font-bold">
                    ₹{p.basePrice?.toLocaleString('en-IN')} • {p.salesCount || 0} sold
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
