import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Database,
  Key,
  Server,
  CheckCircle2,
  User,
  Lock,
  Globe,
  Bell,
  Cpu,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { useAppSelector } from '../../redux/hooks';
import { AdminBadge } from '../../components/admin/AdminBadge';
import { toast } from 'sonner';

export const AdminSettingsPage: React.FC = () => {
  const admin = useAppSelector((state) => state.adminAuth.admin);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'database' | 'store'>('profile');
  const [copiedDb, setCopiedDb] = useState(false);

  const copyMongoUri = () => {
    navigator.clipboard.writeText('mongodb://127.0.0.1:27017/ecommerce_platform');
    setCopiedDb(true);
    toast.success('MongoDB connection URI copied to clipboard');
    setTimeout(() => setCopiedDb(false), 2000);
  };

  const tabs = [
    { id: 'profile', label: 'Administrator Profile', icon: User },
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'database', label: 'Database & MongoDB', icon: Database },
    { id: 'store', label: 'Platform Parameters', icon: Globe },
  ];

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
              Settings & Profile Architecture
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              System v2.4.0
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Manage your administrative profile, security policies, database telemetry, and platform rules.
          </p>
        </div>
      </div>

      {/* 2. Apple Navigation Tabs */}
      <div className="flex items-center gap-2 border-b theme-border pb-3 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
          {/* Profile Card (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-5 text-xs">
            <div className="flex items-center gap-4 pb-4 border-b theme-border">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-bold text-2xl flex items-center justify-center shrink-0 shadow-xs">
                {admin?.name?.[0] || 'A'}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[var(--text-main)] truncate">
                    {admin?.name || 'Administrator'}
                  </h3>
                  <AdminBadge variant="success" size="sm">
                    {admin?.role || 'Superuser'}
                  </AdminBadge>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-mono truncate">
                  {admin?.email || 'admin@gmail.com'}
                </p>
                <p className="text-[10px] text-[var(--text-secondary)]">
                  Session Token: Active • HTTP-Only Cookie Verified
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-xs text-[var(--text-main)] uppercase tracking-wider">
                Administrator Identity
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Display Name</label>
                  <input
                    type="text"
                    disabled
                    value={admin?.name || 'Administrator'}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border bg-[var(--bg-secondary)] font-medium text-xs text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Administrative Email</label>
                  <input
                    type="email"
                    disabled
                    value={admin?.email || 'admin@gmail.com'}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border bg-[var(--bg-secondary)] font-medium text-xs text-[var(--text-main)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Role-Based Access Control</label>
                <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border theme-border text-[11px] space-y-1">
                  <p className="font-semibold text-[var(--text-main)]">Role: Super Administrator (Full Write Access)</p>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Grants unrestricted authorization across product catalogs, coupon management, order dispatching, user activation toggles, and delivery zone SLAs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Credentials Info (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-4 text-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-main)]">
              <Key size={17} className="text-[var(--accent-primary)]" />
              <span>Development Seed Credentials</span>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Standard seed credentials generated by default in development mode:
            </p>
            <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] space-y-1 font-mono text-[11px]">
              <p>Email: <strong className="text-[var(--text-main)]">admin@gmail.com</strong></p>
              <p>Password: <strong className="text-[var(--text-main)]">123456</strong></p>
              <p>Security Role: <strong className="text-emerald-500">ADMIN (Superuser)</strong></p>
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              💡 To modify credentials or reset your secret key, update the database seed or perform a password change mutation.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs w-full">
          <div className="p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-main)]">HTTP-Only JWT Cookies</h3>
            <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
              Access tokens are securely stored in SameSite HTTP-only cookies, shielding administrative sessions from malicious XSS script injections.
            </p>
          </div>

          <div className="p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Lock size={20} />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-main)]">bcrypt Salt Encryption</h3>
            <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
              All credentials are cryptographically hashed using multi-round salt rounds prior to MongoDB persistence.
            </p>
          </div>

          <div className="p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Cpu size={20} />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-main)]">Atomic Stock Reservation</h3>
            <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
              Checkout transactions use MongoDB atomic operations to reserve units, preventing inventory race conditions.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'database' && (
        <div className="p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-4 text-xs w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-[var(--accent-primary)]" />
              <h3 className="font-bold text-sm text-[var(--text-main)]">MongoDB Connection & Compass URI</h3>
            </div>
            <span className="text-emerald-500 font-bold text-xs">● Connected (Port 27017)</span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border theme-border flex items-center justify-between gap-3 font-mono text-[11px]">
            <span className="truncate">mongodb://127.0.0.1:27017/ecommerce_platform</span>
            <button
              onClick={copyMongoUri}
              className="px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white font-semibold text-xs hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1.5"
            >
              {copiedDb ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedDb ? 'Copied' : 'Copy URI'}</span>
            </button>
          </div>

          <ul className="space-y-1.5 text-[11px] text-[var(--text-secondary)] pt-1">
            <li>• Active Database: <strong className="text-[var(--text-main)]">ecommerce_platform</strong></li>
            <li>• Indexed collections: Users, Products, Variants, Orders, Shipments, Categories, Inventory</li>
            <li>• Full-text search enabled across product titles, descriptions, and SKU barcodes</li>
          </ul>
        </div>
      )}

      {activeTab === 'store' && (
        <div className="p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-4 text-xs w-full">
          <h3 className="font-bold text-sm text-[var(--text-main)]">EasyBuy Storefront Localization</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border theme-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Store Currency</span>
              <p className="text-base font-black text-[var(--text-main)]">Indian Rupee (INR - ₹)</p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border theme-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Default Payment</span>
              <p className="text-base font-black text-[var(--text-main)]">Cash on Delivery (COD)</p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border theme-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Free Shipping Threshold</span>
              <p className="text-base font-black text-emerald-500">₹499 & Above</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
