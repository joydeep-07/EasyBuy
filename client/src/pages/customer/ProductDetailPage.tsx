import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  Zap,
  MapPin,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  AlertCircle,
  Clock,
  Plus,
  Minus,
  Star,
  Share2,
  MessageSquarePlus,
  X,
} from 'lucide-react';
import { RatingStars } from '../../components/common/RatingStars';
import { ProductCard } from '../../components/common/ProductCard';
import {
  useGetProductBySlugQuery,
  useGetRelatedProductsQuery,
} from '../../redux/api/productApi';
import { useAddToCartMutation } from '../../redux/api/cartApi';
import { useAddToWishlistMutation, useRemoveFromWishlistMutation } from '../../redux/api/wishlistApi';
import { useGetProductReviewsQuery, useAddReviewMutation } from '../../redux/api/reviewApi';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setSelectedPincode } from '../../redux/slices/addressSlice';
import type { ProductVariant } from '../../types';
import { toast } from 'sonner';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const selectedPincode = useAppSelector((state) => state.address.selectedPincode);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const wishlistIds = useAppSelector((state) => state.wishlist.wishlistIds);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincodeInput, setPincodeInput] = useState(selectedPincode || '713301');
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  // Fetch product data with current pincode check
  const { data: productData, isLoading, refetch } = useGetProductBySlugQuery({
    slug: slug || '',
    pincode: selectedPincode,
  });

  const product = productData?.product;
  const variants = productData?.variants || [];
  const locationStatus = productData?.locationStatus;

  // Fetch related recommendation sets
  const { data: relatedData } = useGetRelatedProductsQuery(product?._id || '', {
    skip: !product?._id,
  });

  // Fetch verified reviews
  const { data: reviewsData } = useGetProductReviewsQuery(product?._id || '', {
    skip: !product?._id,
  });

  const [addToCart, { isLoading: isAddingCart }] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [submitReview, { isLoading: isSubmittingReview }] = useAddReviewMutation();

  const isWishlisted = product ? wishlistIds.includes(product._id) : false;

  // Determine available attribute keys across variants (e.g. ['Colour', 'Size'] or ['Flavour', 'Weight'])
  const variantAttributeKeys = useMemo(() => {
    const keys = new Set<string>();
    variants.forEach((v) => {
      if (v.attributes) {
        Object.keys(v.attributes).forEach((k) => keys.add(k));
      }
    });
    return Array.from(keys);
  }, [variants]);

  // Distinct values for each attribute key
  const attributeOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    variantAttributeKeys.forEach((key) => {
      const values = new Set<string>();
      variants.forEach((v) => {
        if (v.attributes?.[key]) values.add(v.attributes[key]);
      });
      map[key] = Array.from(values);
    });
    return map;
  }, [variants, variantAttributeKeys]);

  // Set default selected variant on load
  useEffect(() => {
    if (variants.length > 0) {
      const firstAvailable = variants.find((v) => v.stock > 0 && v.isAvailable) || variants[0];
      if (firstAvailable && firstAvailable.attributes) {
        setSelectedAttributes(firstAvailable.attributes);
      }
    }
  }, [variants]);

  // Current matched variant based on selected attributes
  const currentVariant: ProductVariant | undefined = useMemo(() => {
    if (!product?.hasVariants || variants.length === 0) return undefined;
    return variants.find((v) => {
      return variantAttributeKeys.every(
        (key) => v.attributes?.[key] === selectedAttributes[key]
      );
    });
  }, [product, variants, variantAttributeKeys, selectedAttributes]);

  // Active pricing, images, and stock
  const activePrice = currentVariant ? currentVariant.price : product?.basePrice || 0;
  const activeOriginalPrice = currentVariant
    ? currentVariant.originalPrice || currentVariant.price
    : product?.originalPrice || activePrice;
  const activeStock = currentVariant
    ? currentVariant.stock - (currentVariant.reservedStock || 0)
    : 25;
  const activeImages =
    currentVariant?.images && currentVariant.images.length > 0
      ? currentVariant.images
      : product?.images || [];

  const handleAttributeSelect = (key: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [key]: value,
    }));
    setActiveImageIndex(0);
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pincodeInput.trim())) {
      dispatch(setSelectedPincode(pincodeInput.trim()));
      refetch();
      toast.success(`Checking delivery for PIN ${pincodeInput.trim()}`);
    }
  };

  const handleAddToCart = async (goToCheckout = false) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to proceed');
      navigate('/login');
      return;
    }

    if (activeStock <= 0) {
      toast.error('This product / variant is currently out of stock');
      return;
    }

    try {
      await addToCart({
        productId: product!._id,
        variantId: currentVariant?._id,
        quantity,
        selectedAttributes,
      }).unwrap();

      if (goToCheckout) {
        navigate('/checkout');
      } else {
        toast.success('Added to Cart! 🛒');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to add to cart');
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to wishlist');
      navigate('/login');
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(product!._id).unwrap();
        toast.info('Removed from Wishlist');
      } else {
        await addToWishlist(product!._id).unwrap();
        toast.success('Added to Wishlist ❤️');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Wishlist operation failed');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to post a review');
      navigate('/login');
      return;
    }

    try {
      await submitReview({
        productId: product!._id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      }).unwrap();

      toast.success('Review submitted successfully! Thank you for your feedback.');
      setIsReviewModalOpen(false);
      setReviewTitle('');
      setReviewComment('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to submit review');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[1920px] mx-auto p-6 space-y-8 animate-pulse">
        <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 h-[480px] bg-gray-200 dark:bg-gray-800 rounded-3xl" />
          <div className="lg:col-span-6 space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <p className="text-sm text-[var(--text-secondary)]">The item you are looking for may have been moved or removed.</p>
        <Link to="/products" className="inline-block px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold">
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 py-6 space-y-12">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
        <Link to="/" className="hover:text-[var(--accent-primary)]">Home</Link>
        <span>/</span>
        <Link to={`/category/${product.category.slug}`} className="hover:text-[var(--accent-primary)]">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-[var(--text-main)] font-medium truncate max-w-xs">{product.title}</span>
      </nav>

      {/* 2. Main Product Layout (Gallery + Product Details + Buy Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 flex flex-col-reverse sm:flex-row gap-4 sticky top-28">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[500px] shrink-0 no-scrollbar">
            {activeImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all p-1 bg-white shrink-0 ${
                  activeImageIndex === idx
                    ? 'border-[var(--accent-primary)] shadow-md'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>

          {/* Main Display Image */}
          <div className="relative flex-1 aspect-square rounded-3xl theme-surface border theme-border overflow-hidden p-6 flex items-center justify-center shadow-sm">
            <img
              src={activeImages[activeImageIndex] || activeImages[0]}
              alt={product.title}
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-500 cursor-zoom-in"
            />
            {product.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-[var(--accent-primary)] text-white shadow-md">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Center Column: Product Information (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Brand & Title */}
          <div>
            <Link
              to={`/products?brand=${encodeURIComponent(product.brand)}`}
              className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] hover:underline"
            >
              Visit the {product.brand} Store
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] mt-1 leading-snug">
              {product.title}
            </h1>
          </div>

          {/* Rating Summary */}
          <div className="flex items-center gap-3 pb-3 border-b theme-border">
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={16} />
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span className="text-xs text-[var(--accent-primary)] font-medium">
              {product.salesCount || 100}+ bought in past month
            </span>
          </div>

          {/* Pricing */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-[var(--text-main)]">
                ₹{activePrice.toLocaleString('en-IN')}
              </span>
              {activeOriginalPrice > activePrice && (
                <>
                  <span className="text-base text-[var(--text-secondary)] line-through">
                    ₹{activeOriginalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-bold text-[var(--accent-primary)]">
                    Save ₹{(activeOriginalPrice - activePrice).toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">Inclusive of all taxes</p>
          </div>

          {/* Dynamic Variant Selectors - Apple Pill Styling */}
          {product.hasVariants && variantAttributeKeys.length > 0 && (
            <div className="space-y-4 pt-3 border-t border-[var(--border-light)]">
              {variantAttributeKeys.map((key) => {
                const options = attributeOptions[key] || [];
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[var(--text-main)]">
                        {key}: <span className="font-normal text-[var(--text-secondary)]">{selectedAttributes[key] || 'Select'}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {options.map((opt) => {
                        const isSelected = selectedAttributes[key] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => handleAttributeSelect(key, opt)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              isSelected
                                ? 'border-[var(--accent-primary)] bg-[var(--accent-surface)] text-[var(--accent-primary)]'
                                : 'border-[var(--border-light)] bg-[var(--bg-secondary)] hover:border-[var(--text-secondary)]/40 text-[var(--text-main)]'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* SKU & Variant Stock alert */}
              {currentVariant && (
                <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                  <span>SKU: <strong className="font-mono text-[var(--text-main)]">{currentVariant.sku}</strong></span>
                  <span>•</span>
                  {activeStock <= 0 ? (
                    <span className="text-rose-500 font-medium">Sold Out in this variation</span>
                  ) : activeStock <= 5 ? (
                    <span className="text-amber-500 font-medium">Only {activeStock} left in stock</span>
                  ) : (
                    <span className="text-emerald-500 font-medium">In Stock</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Highlights */}
          {product.highlights && product.highlights.length > 0 && (
            <div className="pt-3 border-t theme-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-2">
                About this item
              </h3>
              <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] list-disc pl-4">
                {product.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Buy Box & Location PIN Checker (3 cols) */}
        <div className="lg:col-span-3 p-5 rounded-3xl theme-surface border theme-border shadow-sm space-y-5 sticky top-28">
          <div className="text-2xl font-black text-[var(--text-main)]">
            ₹{activePrice.toLocaleString('en-IN')}
          </div>

          {/* Location PIN Checker */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border theme-border space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)]">
              <MapPin size={16} className="text-[var(--accent-primary)]" />
              <span>Deliver to {locationStatus?.city || 'Selected PIN'}</span>
            </div>

            <form onSubmit={handlePincodeSubmit} className="flex gap-1.5">
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="PIN Code"
                className="w-full px-2.5 py-1.5 rounded-xl border theme-border theme-surface text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Check
              </button>
            </form>

            {locationStatus && (
              <div
                className={`text-[11px] p-2 rounded-xl flex items-start gap-1.5 ${
                  locationStatus.isServiceable
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-500/10 text-red-500'
                }`}
              >
                {locationStatus.isServiceable ? <Check size={14} className="shrink-0 mt-0.5" /> : <AlertCircle size={14} className="shrink-0 mt-0.5" />}
                <p className="font-medium leading-tight">{locationStatus.message}</p>
              </div>
            )}
          </div>

          {/* Stock availability status */}
          <div>
            {product.status === 'SOLD_OUT' || activeStock <= 0 ? (
              <div className="text-red-500 text-sm font-bold flex items-center gap-1.5">
                <AlertCircle size={16} /> Currently Unavailable
              </div>
            ) : locationStatus && !locationStatus.isServiceable ? (
              <div className="text-amber-500 text-xs font-bold">
                Unavailable at this PIN code. Please select another delivery address.
              </div>
            ) : (
              <div className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-1.5">
                <Check size={16} /> In Stock ({activeStock} available)
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Quantity:</span>
            <div className="flex items-center border border-[var(--border-light)] rounded-full bg-[var(--bg-secondary)] overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-1.5 px-3 hover:bg-[var(--bg-tertiary)] text-[var(--text-main)] transition-colors"
                disabled={quantity <= 1}
              >
                <Minus size={12} />
              </button>
              <span className="px-3 text-xs font-semibold text-[var(--text-main)]">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(activeStock, q + 1))}
                className="p-1.5 px-3 hover:bg-[var(--bg-tertiary)] text-[var(--text-main)] transition-colors"
                disabled={quantity >= activeStock}
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* Action Buttons - Apple Pill CTA */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => handleAddToCart(false)}
              disabled={isAddingCart || activeStock <= 0 || (locationStatus && !locationStatus.isServiceable)}
              className="w-full py-3.5 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] hover:opacity-90 active:scale-95 disabled:opacity-40 font-medium text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag size={15} strokeWidth={2} />
              <span>Add to Bag</span>
            </button>

            <button
              onClick={() => handleAddToCart(true)}
              disabled={isAddingCart || activeStock <= 0 || (locationStatus && !locationStatus.isServiceable)}
              className="w-full py-3.5 rounded-full bg-[var(--accent-primary)] text-white hover:brightness-105 active:scale-95 disabled:opacity-40 font-medium text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap size={15} />
              <span>Order with Cash on Delivery</span>
            </button>

            <button
              onClick={handleWishlistToggle}
              className={`w-full py-2.5 rounded-full border border-[var(--border-light)] text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isWishlisted ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' : 'hover:bg-[var(--bg-secondary)] text-[var(--text-main)]'
              }`}
            >
              <Heart size={14} className={isWishlisted ? 'fill-current' : ''} />
              <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="pt-3 border-t theme-border space-y-2 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[var(--accent-primary)]" />
              <span>{product.warranty || '1 Year Manufacturer Warranty'}</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={16} className="text-[var(--accent-primary)]" />
              <span>{product.returnPolicy || '7 Days Replacement Policy'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Frequently Bought Together Module */}
      {relatedData?.frequentlyBoughtTogether && relatedData.frequentlyBoughtTogether.length > 0 && (
        <section className="p-6 sm:p-8 rounded-3xl theme-card border theme-border">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-main)] mb-4">
            Frequently Bought Together
          </h2>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Main Product */}
              <div className="w-24 h-24 rounded-2xl p-2 bg-white border shrink-0">
                <img src={activeImages[0]} alt={product.title} className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold text-[var(--accent-primary)]">+</span>
              {/* Complementary Product */}
              {relatedData.frequentlyBoughtTogether.map((item) => (
                <Link
                  key={item._id}
                  to={`/product/${item.slug}`}
                  className="w-24 h-24 rounded-2xl p-2 bg-white border shrink-0 group relative"
                  title={item.title}
                >
                  <img src={item.thumbnail || item.images[0]} alt={item.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                </Link>
              ))}
            </div>

            <div className="lg:border-l theme-border lg:pl-6 space-y-2 text-center lg:text-left">
              <p className="text-xs text-[var(--text-secondary)]">Buy these together:</p>
              <p className="text-lg font-bold text-[var(--text-main)]">
                Total Price: ₹{(activePrice + (relatedData.frequentlyBoughtTogether[0]?.basePrice || 0)).toLocaleString('en-IN')}
              </p>
              <button
                onClick={() => {
                  handleAddToCart();
                  addToCart({
                    productId: relatedData.frequentlyBoughtTogether[0]._id,
                    quantity: 1,
                  });
                  toast.success('Bundle added to Cart!');
                }}
                className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Add Both to Cart
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. Specifications & Description Tabs */}
      <section className="p-6 sm:p-8 rounded-3xl theme-surface border theme-border space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-main)] mb-3">Product Description</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {product.specifications && product.specifications.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-[var(--text-main)] mb-3">Technical Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
              {product.specifications.map((spec, i) => (
                <div key={i} className="flex justify-between py-2 border-b theme-border">
                  <span className="font-semibold text-[var(--text-secondary)]">{spec.name}</span>
                  <span className="text-[var(--text-main)] font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 5. Customer Reviews Section */}
      <section className="p-6 sm:p-8 rounded-3xl theme-surface border theme-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b theme-border">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-main)]">Customer Ratings & Reviews</h2>
            <div className="mt-1 flex items-center gap-2">
              <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={18} />
              <span className="text-xs text-[var(--text-secondary)]">({product.reviewCount} total verified customer reviews)</span>
            </div>
          </div>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 self-start sm:self-auto"
          >
            <MessageSquarePlus size={15} />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
            reviewsData.reviews.map((rev) => (
              <div key={rev._id} className="p-4 rounded-2xl theme-card border theme-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-[var(--accent-primary)] font-bold text-xs flex items-center justify-center uppercase">
                      {rev.user?.firstName?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-main)]">
                        {rev.user?.firstName} {rev.user?.lastName}
                      </p>
                      {rev.isVerifiedPurchase && (
                        <span className="text-[10px] text-[var(--accent-primary)] font-bold flex items-center gap-0.5">
                          <Check size={11} /> Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <RatingStars rating={rev.rating} size={14} showScore={false} />
                  {rev.title && <h4 className="text-xs font-bold text-[var(--text-main)]">{rev.title}</h4>}
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-[var(--text-secondary)] text-center py-4">
              No customer reviews yet. Be the first to share your thoughts on this item!
            </p>
          )}
        </div>
      </section>

      {/* 6. Customers Also Viewed */}
      {relatedData?.customersAlsoViewed && relatedData.customersAlsoViewed.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-main)]">Customers Also Viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedData.customersAlsoViewed.slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg p-6 rounded-3xl theme-surface border theme-border shadow-2xl space-y-4">
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--bg-secondary)]"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-[var(--text-main)]">Create Review</h3>
            <p className="text-xs text-[var(--text-secondary)]">Share your honest feedback with other shoppers</p>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              {/* Rating Star input */}
              <div>
                <label className="block font-bold text-[var(--text-main)] mb-1">Overall rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={24}
                        className={
                          star <= reviewRating
                            ? 'fill-amber-400 stroke-amber-500'
                            : 'text-gray-300 dark:text-gray-600'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[var(--text-main)] mb-1">Add a headline</label>
                <input
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="What's most important to know?"
                  className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--text-main)] mb-1">Written review</label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="What did you like or dislike? What did you use this product for?"
                  className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-card focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full py-3 rounded-xl bg-[var(--accent-primary)] text-white font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isSubmittingReview ? 'Submitting Review...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
