import React from 'react';
import { Star, Check, Eye, EyeOff, Trash2, ShieldCheck, MessageSquare } from 'lucide-react';
import {
  useGetAdminReviewsQuery,
  useToggleReviewVisibilityMutation,
  useDeleteReviewMutation,
} from '../../redux/api/adminApi';
import { AdminBadge } from '../../components/admin/AdminBadge';
import { EmptyState } from '../../components/admin/EmptyState';
import { toast } from 'sonner';

export const AdminReviewsPage: React.FC = () => {
  const { data: reviewsData, isLoading, refetch } = useGetAdminReviewsQuery();
  const [toggleVisibility] = useToggleReviewVisibilityMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const handleToggle = async (id: string) => {
    try {
      const res = await toggleVisibility(id).unwrap();
      toast.success(res.message);
      refetch();
    } catch (e) {
      toast.error('Failed to update visibility');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this customer review permanently?')) {
      try {
        await deleteReview(id).unwrap();
        toast.success('Review deleted');
        refetch();
      } catch (e) {
        toast.error('Delete failed');
      }
    }
  };

  const reviews = reviewsData?.reviews || [];

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
              Customer Reviews Moderation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
              {reviews.length} Feedback Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Audit product feedback, hide suspicious reviews, and maintain authentic customer ratings.
          </p>
        </div>
      </div>

      {/* 2. Reviews Full-Width Table */}
      <div className="rounded-3xl theme-surface border theme-border overflow-hidden shadow-xs w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="bg-[var(--bg-secondary)]/50 border-b theme-border text-[var(--text-secondary)] text-[11px] font-semibold uppercase tracking-wider">
                <th className="p-4 font-semibold">Product SKU</th>
                <th className="p-4 font-semibold">Reviewer</th>
                <th className="p-4 font-semibold">Rating & Feedback</th>
                <th className="p-4 font-semibold">Verification</th>
                <th className="p-4 font-semibold">Visibility</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-xs text-[var(--text-secondary)]">
                    Loading customer reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={MessageSquare}
                      title="No customer reviews"
                      description="No reviews have been submitted for moderation yet."
                    />
                  </td>
                </tr>
              ) : (
                reviews.map((rev: any) => (
                  <tr key={rev._id} className="hover:bg-[var(--bg-secondary)]/60 transition-colors">
                    {/* Product */}
                    <td className="p-4 max-w-[200px]">
                      <p className="font-semibold text-[var(--text-main)] text-xs truncate">
                        {rev.product?.title || 'Catalog Product'}
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                        {rev.product?.brand || 'EasyBuy'}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="p-4 whitespace-nowrap">
                      <p className="font-semibold text-[var(--text-main)]">
                        {rev.user?.firstName} {rev.user?.lastName}
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>

                    {/* Rating & Review */}
                    <td className="p-4 max-w-sm">
                      <div className="flex items-center gap-1 text-amber-500 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < rev.rating ? 'currentColor' : 'none'}
                            stroke="currentColor"
                          />
                        ))}
                        <span className="font-bold text-[11px] ml-1 text-[var(--text-main)]">
                          {rev.rating}.0
                        </span>
                      </div>
                      {rev.title && (
                        <p className="font-bold text-[var(--text-main)] text-xs mb-0.5 truncate">
                          {rev.title}
                        </p>
                      )}
                      <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                        {rev.comment}
                      </p>
                    </td>

                    {/* Verified */}
                    <td className="p-4 whitespace-nowrap">
                      {rev.isVerifiedPurchase ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck size={14} />
                          <span>Verified Purchase</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400">Unverified</span>
                      )}
                    </td>

                    {/* Visibility */}
                    <td className="p-4 whitespace-nowrap">
                      <AdminBadge variant={rev.isApproved !== false ? 'success' : 'neutral'}>
                        {rev.isApproved !== false ? 'Published' : 'Hidden'}
                      </AdminBadge>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggle(rev._id)}
                          className="px-2.5 py-1 rounded-lg border theme-border font-semibold text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition-colors inline-flex items-center gap-1"
                          title="Toggle public visibility"
                        >
                          {rev.isApproved !== false ? <EyeOff size={12} /> : <Eye size={12} />}
                          <span>{rev.isApproved !== false ? 'Hide' : 'Show'}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(rev._id)}
                          className="p-1.5 rounded-lg border theme-border text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Delete review"
                        >
                          <Trash2 size={13} />
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
    </div>
  );
};

export default AdminReviewsPage;
