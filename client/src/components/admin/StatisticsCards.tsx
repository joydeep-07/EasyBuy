import React, { useEffect, useRef } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import gsap from 'gsap';

interface StatisticsCardsProps {
  stats?: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    activeProducts: number;
    soldOutProducts: number;
    pendingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    lowStockCount: number;
  };
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ stats }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll('.stat-card');
    gsap.fromTo(
      cards,
      { opacity: 0, y: 16, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power2.out',
      }
    );
  }, []);

  const items = [
    {
      title: 'Total Gross Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      subtitle: `Across ${stats?.totalOrders || 0} orders`,
      icon: DollarSign,
      color: 'emerald',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Total Orders',
      value: (stats?.totalOrders || 0).toLocaleString('en-IN'),
      subtitle: `${stats?.deliveredOrders || 0} delivered, ${stats?.pendingOrders || 0} pending`,
      icon: ShoppingBag,
      color: 'blue',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Total Catalog Products',
      value: (stats?.totalProducts || 0).toLocaleString('en-IN'),
      subtitle: `${stats?.activeProducts || 0} active, ${stats?.lowStockCount || 0} low stock`,
      icon: Package,
      color: 'amber',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Registered Customers',
      value: (stats?.totalCustomers || 0).toLocaleString('en-IN'),
      subtitle: 'Active shopper profiles',
      icon: Users,
      color: 'purple',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Pending Fulfillment',
      value: (stats?.pendingOrders || 0).toLocaleString('en-IN'),
      subtitle: 'Orders awaiting dispatch',
      icon: Clock,
      color: 'amber',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Completed Orders',
      value: (stats?.deliveredOrders || 0).toLocaleString('en-IN'),
      subtitle: 'Successfully delivered',
      icon: CheckCircle2,
      color: 'emerald',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 w-full"
    >
      {items.map((it, idx) => {
        const Icon = it.icon;
        return (
          <div
            key={idx}
            className="stat-card p-5 rounded-2xl theme-surface border theme-border shadow-xs hover:shadow-md hover:border-[var(--border-focus)]/30 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] tracking-tight truncate">
                {it.title}
              </span>
              <div className={`w-8 h-8 rounded-xl ${it.iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={16} strokeWidth={2} />
              </div>
            </div>

            <div className="mt-3">
              <h3 className="text-xl sm:text-2xl font-black text-[var(--text-main)] tracking-tight">
                {it.value}
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1 truncate">
                {it.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
