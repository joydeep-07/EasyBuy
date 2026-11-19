import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Package, ArrowRight } from 'lucide-react';
import { AdminBadge } from './AdminBadge';

interface TopSellingProductsProps {
  products: any[];
}

export const TopSellingProducts: React.FC<TopSellingProductsProps> = ({ products }) => {
  const fallbackImage =
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&auto=format&fit=crop&q=80';

  return (
    <div className="p-6 rounded-3xl theme-surface border theme-border shadow-xs space-y-4 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={17} className="text-amber-500" />
          <h3 className="font-bold text-sm text-[var(--text-main)] tracking-tight">
            Top Performing SKUs
          </h3>
        </div>
        <Link
          to="/admin/products"
          className="text-xs font-semibold text-[var(--accent-primary)] hover:underline inline-flex items-center gap-1"
        >
          <span>Catalog</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-xs text-[var(--text-secondary)] py-8 text-center">
          No product performance records found.
        </p>
      ) : (
        <div className="divide-y theme-border">
          {products.map((p: any, idx) => (
            <div
              key={p._id || idx}
              className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-[11px] font-bold text-[var(--text-secondary)] w-4 text-center shrink-0">
                  {idx + 1}
                </span>
                <img
                  src={p.images?.[0] || fallbackImage}
                  alt={p.title}
                  className="w-11 h-11 rounded-xl object-contain bg-white p-1 border theme-border shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackImage;
                  }}
                />
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text-main)] text-xs truncate max-w-[200px] sm:max-w-[280px]">
                    {p.title}
                  </p>
                  <p className="text-[11px] text-[var(--accent-primary)] font-bold mt-0.5">
                    ₹{(p.basePrice || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-[var(--text-main)] text-xs block">
                  {p.salesCount || 0} sold
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-0.5 mt-0.5">
                  <TrendingUp size={11} />
                  <span>High Demand</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
