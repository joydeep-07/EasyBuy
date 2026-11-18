import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingBag,
  Users,
  Tag,
  Star,
  Truck,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { useGetAdminProfileQuery, useAdminLogoutMutation } from '../redux/api/adminApi';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setAdmin, adminLogoutSuccess } from '../redux/slices/adminAuthSlice';
import { Toaster, toast } from 'sonner';

export const AdminLayout: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const admin = useAppSelector((state) => state.adminAuth.admin);
  const isAdminAuthenticated = useAppSelector((state) => state.adminAuth.isAdminAuthenticated);

  const { data: profileData, isError, isLoading } = useGetAdminProfileQuery();
  const [adminLogout] = useAdminLogoutMutation();

  useEffect(() => {
    if (profileData?.admin) {
      dispatch(setAdmin(profileData.admin));
    }
  }, [profileData, dispatch]);

  useEffect(() => {
    if (isError && !isLoading && pathname !== '/admin/login') {
      navigate('/admin/login');
    }
  }, [isError, isLoading, pathname, navigate]);

  const handleLogout = async () => {
    try {
      await adminLogout().unwrap();
      dispatch(adminLogoutSuccess());
      toast.success('Admin logged out');
      navigate('/admin/login');
    } catch (e) {
      toast.error('Logout failed');
    }
  };

  const navLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Add Product', path: '/admin/products/create', icon: PlusCircle },
    { label: 'Categories & Attributes', path: '/admin/categories', icon: Layers },
    { label: 'Inventory & Stock', path: '/admin/inventory', icon: Boxes },
    { label: 'Orders & Shipments', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Coupons & Deals', path: '/admin/coupons', icon: Tag },
    { label: 'Review Moderation', path: '/admin/reviews', icon: Star },
    { label: 'Shipping & Zones', path: '/admin/shipping', icon: Truck },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[var(--bg-main)] text-[var(--text-main)] transition-colors">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 theme-surface border-r theme-border flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-16 px-6 border-b theme-border flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-primary)] text-white flex items-center justify-center font-black">
                EB
              </div>
              <div>
                <span className="font-black text-sm text-[var(--text-main)]">
                  Easy<span className="text-[var(--accent-primary)]">Buy</span>
                </span>
                <span className="block text-[9px] font-bold tracking-widest text-emerald-500 uppercase">
                  Admin Portal
                </span>
              </div>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-[var(--bg-secondary)]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] text-xs">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || (item.path !== '/admin/dashboard' && pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--accent-primary)] text-white font-bold shadow-md shadow-emerald-950/20'
                      : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile and Store Link */}
        <div className="p-3 border-t theme-border space-y-2">
          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] text-[11px] font-semibold text-[var(--text-secondary)]"
          >
            <span>Customer Storefront</span>
            <ExternalLink size={12} />
          </Link>

          <div className="flex items-center justify-between px-2 pt-1">
            <div className="truncate">
              <p className="text-xs font-bold text-[var(--text-main)] truncate">
                {admin?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)] truncate">{admin?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 sticky top-0 z-30 theme-surface border-b theme-border px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border theme-border"
            >
              <Menu size={18} />
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <span>Admin</span>
              <ChevronRight size={12} />
              <span className="font-bold text-[var(--text-main)] capitalize">
                {pathname.split('/')[2]?.replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-[var(--accent-primary)] text-xs font-bold border border-emerald-500/20">
              <ShieldCheck size={14} />
              <span>Full Access Mode</span>
            </div>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
};
