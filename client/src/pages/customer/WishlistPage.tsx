import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from '../../redux/api/wishlistApi';
import { useAddToCartMutation } from '../../redux/api/cartApi';
import { useAppSelector } from '../../redux/hooks';
import { RatingStars } from '../../components/common/RatingStars';
import { toast } from 'sonner';

export const WishlistPage: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data: wishlistData, isLoading } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [addToCart] = useAddToCartMutation();

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4 px-4">
        <Heart size={40} className="mx-auto text-red-500" />
        <h2 className="text-xl font-bold">Please sign in to view your Wishlist</h2>
        <Link to="/login" className="inline-block px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold">
          Sign In
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  const items = wishlistData?.wishlist || [];

  const handleMoveToCart = async (productId: string) => {
    try {
      await addToCart({ productId, quantity: 1 }).unwrap();
      await removeFromWishlist(productId).unwrap();
      toast.success('Moved to Cart! 🛒');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to move to cart');
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId).unwrap();
      toast.info('Item removed from wishlist');
    } catch (err: any) {
      toast.error('Failed to remove item');
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 py-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b theme-border">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-main)]">My Wishlist</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {items.length} items saved for later
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center space-y-3 theme-card rounded-3xl p-8 border theme-border">
          <Heart size={40} className="mx-auto text-gray-400" />
          <h3 className="font-bold text-base text-[var(--text-main)]">Your Wishlist is empty</h3>
          <p className="text-xs text-[var(--text-secondary)]">Explore products and tap the heart icon to save items here.</p>
          <Link
            to="/products"
            className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map(({ product }) => (
            <div
              key={product._id}
              className="group rounded-3xl theme-surface border theme-border overflow-hidden p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
            >
              <div>
                <Link
                  to={`/product/${product.slug}`}
                  className="block w-full pt-[85%] relative bg-[var(--bg-secondary)] rounded-2xl overflow-hidden mb-3 p-3"
                >
                  <img
                    src={product.images[0] || product.thumbnail}
                    alt={product.title}
                    className="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                  />
                </Link>

                <p className="text-[10px] font-bold uppercase text-[var(--accent-primary)]">{product.brand}</p>
                <Link to={`/product/${product.slug}`}>
                  <h3 className="text-xs font-semibold text-[var(--text-main)] line-clamp-2 hover:text-[var(--accent-primary)] mt-1">
                    {product.title}
                  </h3>
                </Link>

                <div className="mt-2 flex items-center gap-1.5">
                  <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={13} />
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-base font-bold text-[var(--text-main)]">
                    ₹{product.basePrice.toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice > product.basePrice && (
                    <span className="text-xs text-[var(--text-secondary)] line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t theme-border flex items-center gap-2 mt-3">
                <button
                  onClick={() => handleMoveToCart(product._id)}
                  className="flex-1 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag size={14} />
                  <span>Move to Cart</span>
                </button>
                <button
                  onClick={() => handleRemove(product._id)}
                  className="p-2 rounded-xl border theme-border hover:bg-red-500/10 text-red-500"
                  title="Remove from Wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
