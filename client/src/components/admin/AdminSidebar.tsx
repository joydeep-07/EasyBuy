import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Layers,
  Boxes,
  ShoppingBag,
  Users,
  Tag,
  Star,
  Truck,
  Settings,
  LogOut,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AdminUser } from '../../types';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  admin: AdminUser | null;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  admin,
  onLogout,
}) => {
  const { pathname } = useLocation();

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Catalog & Inventory',
      items: [
        { label: 'Products', path: '/admin/products', icon: Package },
        { label: 'Add Product', path: '/admin/products/create', icon: PlusCircle },
        { label: 'Categories', path: '/admin/categories', icon: Layers },
        { label: 'Stock & Inventory', path: '/admin/inventory', icon: Boxes },
      ],
    },
    {
      group: 'Fulfillment & Sales',
      items: [
        { label: 'Orders & Shipping', path: '/admin/orders', icon: ShoppingBag },
        { label: 'Customers', path: '/admin/customers', icon: Users },
      ],
    },
    {
      group: 'Marketing & Reviews',
      items: [
        { label: 'Coupons & Deals', path: '/admin/coupons', icon: Tag },
        { label: 'Customer Reviews', path: '/admin/reviews', icon: Star },
        { label: 'Delivery Zones', path: '/admin/shipping', icon: Truck },
      ],
    },
    {
      group: 'System',
      items: [
        { label: 'System Settings', path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen apple-glass border-r theme-border flex flex-col justify-between transition-all duration-300 ${
          isCollapsed ? 'lg:w-[76px]' : 'lg:w-64'
        } ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top: Brand Header */}
        <div>
          <div className="h-16 px-4 border-b theme-border flex items-center justify-between">
            <Link
              to="/admin/dashboard"
              className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'lg:justify-center lg:w-full' : ''}`}
            >
              <div className="w-9 h-9 rounded-2xl bg-[var(--accent-primary)] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-[var(--accent-primary)]/20">
                EB
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <span className="font-bold text-sm tracking-tight text-[var(--text-main)] block">
                    Easy<span className="text-[var(--accent-primary)]">Buy</span>
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
                    Admin SaaS
                  </span>
                </div>
              )}
            </Link>

            {/* Mobile close */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-170px)] text-xs scrollbar-none">
            {navGroups.map((grp, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {!isCollapsed && (
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
                    {grp.group}
                  </p>
                )}
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.path ||
                    (item.path !== '/admin/dashboard' &&
                      item.path !== '/admin/products/create' &&
                      pathname.startsWith(item.path));

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      title={isCollapsed ? item.label : undefined}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all group ${
                        isCollapsed ? 'justify-center' : ''
                      } ${
                        isActive
                          ? 'bg-[var(--accent-primary)] text-white font-semibold shadow-xs'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      <Icon
                        size={17}
                        strokeWidth={isActive ? 2.2 : 1.7}
                        className="shrink-0 transition-transform group-hover:scale-105"
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}

                      {/* Tooltip on collapsed mode */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[var(--text-main)] text-[var(--bg-main)] text-[11px] font-semibold opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-lg">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Section: Storefront Link, Collapse Toggle & Profile */}
        <div className="p-3 border-t theme-border space-y-2 bg-[var(--bg-secondary)]/30 backdrop-blur-xs">
          {/* Customer Store Link */}
          <Link
            to="/"
            target="_blank"
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
            title="Open Customer Storefront"
          >
            {!isCollapsed && <span>Storefront</span>}
            <ExternalLink size={13} className="shrink-0" />
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className={`hidden lg:flex w-full items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition-colors ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {!isCollapsed && <span>Collapse Sidebar</span>}
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Admin Profile Footprint */}
          <div
            className={`flex items-center gap-2 pt-1 px-1 ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold text-xs flex items-center justify-center shrink-0">
                {admin?.name?.[0] || 'A'}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--text-main)] truncate">
                    {admin?.name || 'Administrator'}
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] truncate">
                    {admin?.email || 'admin@gmail.com'}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
