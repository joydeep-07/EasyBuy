import React from 'react';
import { Star, Check, Eye, EyeOff, Trash2 } from 'lucide-react';
import {
  useGetAdminReviewsQuery,
  useToggleReviewVisibilityMutation,
  useDeleteReviewMutation,
} from '../../redux/api/adminApi';
import { RatingStars } from '../../components/common/RatingStars';
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-main)]">Customer Reviews Moderation</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Audit product feedback, hide suspicious reviews, and protect ratings authenticity
          </p>
        </div>
      </div>

      <div className="rounded-3xl theme-surface border theme-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b theme-border text-[var(--text-secondary)]">
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Rating & Review</th>
                <th className="p-4 font-semibold">Verified?</th>
                <th className="p-4 font-semibold">Visibility</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">Loading reviews...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">No reviews to moderate.</td>
                </tr>
              ) : (
                reviews.map((rev: any) => (
                  <tr key={rev._id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="p-4 max-w-xs truncate font-bold text-[var(--text-main)]">
                      {rev.product?.title || 'Unknown Product'}
                    </td>
                    <td className="p-4 text-[var(--text-secondary)]">
                      {rev.user?.firstName} {rev.user?.lastName}
                    </td>
                    <td className="p-4 max-w-md">
                      <div className="space-y-1">
                        <RatingStars rating={rev.rating} size={13} showScore={false} />
                        {rev.title && <p className="font-bold text-[var(--text-main)]">{rev.title}</p>}
                        <p className="text-[var(--text-secondary)] line-clamp-2">{rev.comment}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {rev.isVerifiedPurchase ? (
                        <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                          <Check size={12} /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">Unverified</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rev.isHidden
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {rev.isHidden ? 'Hidden' : 'Visible'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(rev._id)}
                          className="p-1.5 rounded-lg border theme-border hover:bg-[var(--bg-secondary)]"
                          title={rev.isHidden ? 'Show Review' : 'Hide Review'}
                        >
                          {rev.isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          onClick={() => handleDelete(rev._id)}
                          className="p-1.5 rounded-lg border theme-border text-red-500 hover:bg-red-500/10"
                          title="Delete Review"
                        >
                          <Trash2 size={14} />
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
