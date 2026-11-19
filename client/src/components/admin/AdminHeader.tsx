import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
  Bell,
  Search,
  ExternalLink,
  LogOut,
  User,
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import type { AdminUser } from '../../types';

interface AdminHeaderProps {
  onOpenSidebar: () => void;
  admin: AdminUser | null;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onOpenSidebar,
  admin,
  onLogout,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Generate dynamic breadcrumb segments
  const segments = pathname.split('/').filter(Boolean);
  const currentSection = segments[1] ? segments[1].replace(/-/g, ' ') : 'dashboard';
  const subSection = segments[2] ? segments[2].replace(/-/g, ' ') : null;

  return (
    <header className="h-16 sticky top-0 z-30 apple-glass border-b theme-border px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl border theme-border text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition-colors"
          title="Open Menu"
        >
          <Menu size={18} />
        </button>

        <nav className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <Link
            to="/admin/dashboard"
            className="hover:text-[var(--accent-primary)] font-medium transition-colors"
          >
            Admin
          </Link>
          <ChevronRight size={13} className="text-[var(--text-tertiary)]" />
          <span className="font-semibold text-[var(--text-main)] capitalize">
            {currentSection}
          </span>
          {subSection && (
            <>
              <ChevronRight size={13} className="text-[var(--text-tertiary)]" />
              <span className="font-semibold text-[var(--text-main)] capitalize">
                {subSection}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Right: Quick Actions, Theme Toggle & Admin Menu */}
      <div className="flex items-center gap-3">
        {/* Quick Add Product Button */}
        <Link
          to="/admin/products/create"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--accent-primary)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-xs"
        >
          <PlusCircle size={14} />
          <span>Add SKU</span>
        </Link>

        {/* System Health Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
          <ShieldCheck size={13} />
          <span>Full Access</span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full border theme-border bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-bold text-xs flex items-center justify-center">
              {admin?.name?.[0] || 'A'}
            </div>
            <span className="text-xs font-semibold text-[var(--text-main)] hidden sm:inline max-w-[100px] truncate">
              {admin?.name || 'Admin'}
            </span>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl theme-surface border theme-border shadow-xl p-2 z-50 text-xs space-y-1">
                <div className="px-3 py-2 border-b theme-border">
                  <p className="font-bold text-[var(--text-main)] truncate">
                    {admin?.name || 'Administrator'}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] truncate">
                    {admin?.email}
                  </p>
                </div>

                <Link
                  to="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] font-medium transition-colors"
                >
                  <User size={14} />
                  <span>Admin Profile & Settings</span>
                </Link>

                <Link
                  to="/"
                  target="_blank"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] font-medium transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>Customer Storefront</span>
                </Link>

                <div className="pt-1 border-t theme-border">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 font-semibold transition-colors text-left"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
