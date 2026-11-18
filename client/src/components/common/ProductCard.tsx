import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye, Check, ShieldCheck } from 'lucide-react';
import type { Product } from '../../types';
import { RatingStars } from './RatingStars';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { useAddToCartMutation } from '../../redux/api/cartApi';
import { useAddToWishlistMutation, useRemoveFromWishlistMutation } from '../../redux/api/wishlistApi';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const wishlistIds = useAppSelector((state) => state.wishlist.wishlistIds);
  const isWishlisted = wishlistIds.includes(product._id);

  const [addToCart, { isLoading: isAddingCart }] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please sign in to add items to your wishlist');
      navigate('/login');
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id).unwrap();
        toast.info('Removed from Wishlist');
      } else {
        await addToWishlist(product._id).unwrap();
        toast.success('Added to Wishlist ❤️');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update wishlist');
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please sign in to add products to your cart');
      navigate('/login');
      return;
    }

    if (product.hasVariants) {
      navigate(`/product/${product.slug}`);
      return;
    }

    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
      }).unwrap();
      toast.success('Added to Cart! 🛒');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to add to cart');
    }
  };

  const primaryImage = product.images?.[currentImgIndex] || product.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
  const secondaryImage = product.images?.[1] || primaryImage;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex flex-col rounded-2xl theme-surface border theme-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {/* Badge container */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.discountPercentage > 0 && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--accent-primary)] text-white shadow-sm">
            {product.discountPercentage}% OFF
          </span>
        )}
        {product.isBestSeller && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm">
            #1 Best Seller
          </span>
        )}
        {product.status === 'SOLD_OUT' && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-sm">
            Sold Out
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        aria-label="Wishlist"
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all ${
          isWishlisted
            ? 'bg-red-500 text-white shadow-md'
            : 'bg-white/80 dark:bg-black/60 text-gray-600 dark:text-gray-300 hover:text-red-500'
        }`}
      >
        <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
      </button>

      {/* Product Image Gallery with hover switch */}
      <Link
        to={`/product/${product.slug}`}
        className="relative block w-full pt-[90%] bg-[var(--bg-secondary)] overflow-hidden"
        onMouseEnter={() => product.images?.length > 1 && setCurrentImgIndex(1)}
        onMouseLeave={() => setCurrentImgIndex(0)}
      >
        <img
          src={primaryImage}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Brand */}
        <p className="text-xs font-semibold tracking-wider uppercase text-[var(--accent-primary)]">
          {product.brand}
        </p>

        {/* Title */}
        <Link to={`/product/${product.slug}`} className="mt-1">
          <h3 className="text-sm font-medium text-[var(--text-main)] line-clamp-2 hover:text-[var(--accent-primary)] transition-colors leading-snug">
            {product.title}
          </h3>
        </Link>

        {/* Ratings */}
        <div className="mt-2 flex items-center gap-1.5">
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={14} />
        </div>

        {/* Price & Delivery */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-[var(--text-main)]">
            ₹{product.basePrice.toLocaleString('en-IN')}
          </span>
          {product.originalPrice > product.basePrice && (
            <span className="text-xs text-[var(--text-secondary)] line-through">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Prime / Free Delivery badge */}
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--accent-primary)] font-medium">
          <ShieldCheck size={13} />
          <span>FREE Delivery by EasyBuy</span>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-2 border-t theme-border">
          {product.status === 'SOLD_OUT' ? (
            <button
              disabled
              className="w-full py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-500 text-xs font-semibold cursor-not-allowed"
            >
              Out of Stock
            </button>
          ) : (
            <button
              onClick={handleQuickAdd}
              disabled={isAddingCart}
              className="w-full py-2.5 px-3 rounded-xl bg-[var(--accent-primary)] hover:opacity-90 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <ShoppingBag size={14} />
              <span>{product.hasVariants ? 'Select Options' : 'Add to Cart'}</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
