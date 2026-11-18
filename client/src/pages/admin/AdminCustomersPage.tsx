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
} from 'lucide-react';
import {
  useGetAdminCustomersQuery,
  useToggleCustomerStatusMutation,
  useGetCustomerDetailsQuery,
} from '../../redux/api/adminApi';
import { toast } from 'sonner';

export const AdminCustomersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewCustomerId, setViewCustomerId] = useState<string | null>(null);

  const { data: customerData, isLoading, refetch } = useGetAdminCustomersQuery({
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-main)]">Customer Accounts</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Registered customer directory, order counts, and account activation controls
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl theme-surface border theme-border flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border theme-border theme-card text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl theme-surface border theme-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b theme-border text-[var(--text-secondary)]">
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Orders Placed</th>
                <th className="p-4 font-semibold">Total Spent</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">No customers found.</td>
                </tr>
              ) : (
                customers.map((c: any) => (
                  <tr key={c._id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-[var(--accent-primary)] font-bold flex items-center justify-center uppercase">
                          {c.firstName?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--text-main)]">{c.firstName} {c.lastName}</p>
                          <p className="text-[10px] text-[var(--text-secondary)]">Joined {new Date(c.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[var(--text-secondary)]">
                      <p>{c.email}</p>
                      <p className="text-[10px]">{c.phone || 'No phone'}</p>
                    </td>
                    <td className="p-4 font-semibold">
                      {c.orderCount || 0} orders
                    </td>
                    <td className="p-4 font-bold text-[var(--text-main)]">
                      ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewCustomerId(c._id)}
                          className="p-1.5 rounded-lg border theme-border hover:bg-[var(--bg-secondary)]"
                          title="View Details & Order History"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(c._id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            c.isActive ? 'text-red-500 hover:bg-red-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'
                          }`}
                        >
                          {c.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {viewCustomerId && detailData?.customer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl p-6 rounded-3xl theme-surface border theme-border shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b theme-border">
              <h3 className="font-bold text-base text-[var(--text-main)]">Customer Account Details</h3>
              <button onClick={() => setViewCustomerId(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] flex justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-main)]">
                    {detailData.customer.firstName} {detailData.customer.lastName}
                  </h4>
                  <p className="text-[var(--text-secondary)]">{detailData.customer.email}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[var(--accent-primary)]">
                    Total Spent: ₹{(detailData.stats?.totalSpent || 0).toLocaleString('en-IN')}
                  </span>
                  <p className="text-[10px] text-gray-400">{detailData.orders?.length || 0} orders recorded</p>
                </div>
              </div>

              {/* Addresses */}
              <div>
                <h4 className="font-bold text-xs mb-2">Saved Addresses ({detailData.addresses?.length || 0})</h4>
                <div className="space-y-2">
                  {detailData.addresses?.map((a: any) => (
                    <div key={a._id} className="p-3 rounded-xl border theme-border">
                      <p className="font-bold">{a.fullName} ({a.addressType})</p>
                      <p className="text-[var(--text-secondary)]">
                        {a.houseBuilding}, {a.street}, {a.city}, {a.state} - {a.pincode}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orders */}
              <div>
                <h4 className="font-bold text-xs mb-2">Orders History</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {detailData.orders?.map((ord: any) => (
                    <div key={ord._id} className="p-3 rounded-xl bg-[var(--bg-secondary)] flex justify-between items-center">
                      <div>
                        <span className="font-mono font-bold text-[var(--accent-primary)]">#{ord.orderNumber}</span>
                        <p className="text-[10px] text-[var(--text-secondary)]">{new Date(ord.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">₹{ord.totalAmount.toLocaleString('en-IN')}</span>
                        <p className="text-[10px] font-bold text-emerald-500">{ord.orderStatus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
