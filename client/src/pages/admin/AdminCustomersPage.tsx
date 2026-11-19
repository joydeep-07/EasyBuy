import React, { useState } from 'react';
import {
  Users,
  Search,
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  ShoppingBag,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
} from 'lucide-react';
import {
  useGetAdminCustomersQuery,
  useToggleCustomerStatusMutation,
  useGetCustomerDetailsQuery,
} from '../../redux/api/adminApi';
import { AdminBadge } from '../../components/admin/AdminBadge';
import { CustomerDetailsModal } from '../../components/admin/CustomerDetailsModal';
import { EmptyState } from '../../components/admin/EmptyState';
import { toast } from 'sonner';

export const AdminCustomersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewCustomerId, setViewCustomerId] = useState<string | null>(null);

  const { data: customerData, isLoading, isFetching, refetch } = useGetAdminCustomersQuery({
    search,
    page,
    limit: 15,
  });

  const { data: detailData } = useGetCustomerDetailsQuery(viewCustomerId || '', {
    skip: !viewCustomerId,
  });

  const [toggleStatus] = useToggleCustomerStatusMutation();

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await toggleStatus(id).unwrap();
      toast.success(res.message);
      refetch();
    } catch (err: any) {
      toast.error('Failed to change customer status');
    }
  };

  const customers = customerData?.customers || [];
  const totalCustomers = customerData?.total || customers.length;
  const totalPages = customerData?.totalPages || 1;

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
              Customer Accounts & Profiles
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
              {totalCustomers} Registered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Registered shopper directory, order frequency, lifetime spend, and account access management.
          </p>
        </div>
      </div>

      {/* 2. Search & Controls */}
      <div className="p-4 rounded-2xl theme-surface border theme-border shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by customer name, email, or phone number..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border theme-border theme-card text-xs font-medium text-[var(--text-main)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-main)]"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Customers Table */}
      <div className="rounded-3xl theme-surface border theme-border overflow-hidden shadow-xs w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="bg-[var(--bg-secondary)]/50 border-b theme-border text-[var(--text-secondary)] text-[11px] font-semibold uppercase tracking-wider">
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Contact Email & Phone</th>
                <th className="p-4 font-semibold">Orders Placed</th>
                <th className="p-4 font-semibold">Lifetime Spend</th>
                <th className="p-4 font-semibold">Account State</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-xs text-[var(--text-secondary)]">
                    Loading customer accounts...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Users}
                      title="No customers found"
                      description="No customer accounts match your search filter."
                    />
                  </td>
                </tr>
              ) : (
                customers.map((c: any) => (
                  <tr
                    key={c._id}
                    onClick={() => setViewCustomerId(c._id)}
                    className="hover:bg-[var(--bg-secondary)]/60 transition-colors cursor-pointer group"
                  >
                    {/* Customer Name & Initials */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold text-xs flex items-center justify-center shrink-0">
                          {c.firstName?.[0] || 'U'}
                          {c.lastName?.[0] || ''}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--text-main)] text-xs">
                            {c.firstName} {c.lastName}
                          </p>
                          <p className="text-[10px] text-[var(--text-secondary)]">
                            Joined {new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="p-4 text-[var(--text-secondary)]">
                      <p className="font-medium text-[var(--text-main)] text-xs">{c.email}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] font-mono">{c.phone || 'No phone registered'}</p>
                    </td>

                    {/* Orders */}
                    <td className="p-4 whitespace-nowrap font-semibold text-[var(--text-main)]">
                      {c.orderCount || 0} orders
                    </td>

                    {/* Spend */}
                    <td className="p-4 font-bold text-[var(--text-main)] whitespace-nowrap text-xs">
                      ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Status */}
                    <td className="p-4 whitespace-nowrap">
                      <AdminBadge variant={c.isActive ? 'success' : 'danger'}>
                        {c.isActive ? 'Active' : 'Suspended'}
                      </AdminBadge>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewCustomerId(c._id)}
                          className="px-2.5 py-1 rounded-lg border theme-border font-semibold text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition-colors inline-flex items-center gap-1"
                        >
                          <Eye size={12} />
                          <span>View Profile</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(c._id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            c.isActive
                              ? 'text-rose-500 hover:bg-rose-500/10'
                              : 'text-emerald-600 hover:bg-emerald-500/10'
                          }`}
                        >
                          {c.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t theme-border flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>
              Page {page} of {totalPages} ({totalCustomers} customers)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl border theme-border hover:bg-[var(--bg-secondary)] disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Inspection Modal */}
      <CustomerDetailsModal
        customerId={viewCustomerId}
        detailData={detailData}
        onClose={() => setViewCustomerId(null)}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};

export default AdminCustomersPage;
