import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  Zap,
  MapPin,
  ShieldCheck,
  RotateCcw,
  Check,
  AlertCircle,
  Plus,
  Minus,
  Star,
  MessageSquarePlus,
  X,
  ChevronRight,
} from "lucide-react";
import { RatingStars } from "../../components/common/RatingStars";
import { ProductCard } from "../../components/common/ProductCard";
import {
  useGetProductBySlugQuery,
  useGetRelatedProductsQuery,
} from "../../redux/api/productApi";
import { useAddToCartMutation } from "../../redux/api/cartApi";
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "../../redux/api/wishlistApi";
import {
  useGetProductReviewsQuery,
  useAddReviewMutation,
} from "../../redux/api/reviewApi";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setSelectedPincode } from "../../redux/slices/addressSlice";
import { ProductVariantSelector } from "../../components/common/variants/ProductVariantSelector";
import type { ProductVariant } from "../../types";
import { toast } from "sonner";

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const selectedPincode = useAppSelector(
    (state) => state.address.selectedPincode,
  );
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const wishlistIds = useAppSelector((state) => state.wishlist.wishlistIds);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincodeInput, setPincodeInput] = useState(selectedPincode || "713301");
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");

  const {
    data: productData,
    isLoading,
    refetch,
  } = useGetProductBySlugQuery({
    slug: slug || "",
    pincode: selectedPincode,
  });

  const product = productData?.product;
  const variants = productData?.variants || [];
  const locationStatus = productData?.locationStatus;

  const { data: relatedData } = useGetRelatedProductsQuery(product?._id || "", {
    skip: !product?._id,
  });

  const { data: reviewsData } = useGetProductReviewsQuery(product?._id || "", {
    skip: !product?._id,
  });

  const [addToCart, { isLoading: isAddingCart }] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [submitReview, { isLoading: isSubmittingReview }] =
    useAddReviewMutation();

  const isWishlisted = product ? wishlistIds.includes(product._id) : false;

  const variantAttributeKeys = useMemo(() => {
    const keys = new Set<string>();
    variants.forEach((v) => {
      if (v.attributes) {
        Object.keys(v.attributes).forEach((k) => keys.add(k));
      }
    });
    return Array.from(keys);
  }, [variants]);

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

  useEffect(() => {
    if (variants.length > 0) {
      const firstAvailable =
        variants.find((v) => v.stock > 0 && v.isAvailable) || variants[0];
      if (firstAvailable && firstAvailable.attributes) {
        setSelectedAttributes(firstAvailable.attributes);
      }
    }
  }, [variants]);

  const currentVariant: ProductVariant | undefined = useMemo(() => {
    if (!product?.hasVariants || variants.length === 0) return undefined;
    return variants.find((v) =>
      variantAttributeKeys.every(
        (key) => v.attributes?.[key] === selectedAttributes[key],
      ),
    );
  }, [product, variants, variantAttributeKeys, selectedAttributes]);

  const activePrice = currentVariant
    ? currentVariant.price
    : product?.basePrice || 0;
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
    setSelectedAttributes((prev) => ({ ...prev, [key]: value }));
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
      toast.error("Please sign in to proceed");
      navigate("/login");
      return;
    }

    if (product?.hasVariants && variants.length > 0 && !currentVariant) {
      toast.error("Please select a size or configuration before adding to bag");
      return;
    }

    if (activeStock <= 0) {
      toast.error("This item or selected variant is currently out of stock");
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
        navigate("/checkout");
      } else {
        toast.success("Added to Bag");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add to bag");
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save items");
      navigate("/login");
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(product!._id).unwrap();
        toast.info("Removed from Saved Items");
      } else {
        await addToWishlist(product!._id).unwrap();
        toast.success("Saved to Wishlist");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Wishlist update failed");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to post a review");
      navigate("/login");
      return;
    }

    try {
      await submitReview({
        productId: product!._id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      }).unwrap();

      toast.success("Review submitted. Thank you for your feedback.");
      setIsReviewModalOpen(false);
      setReviewTitle("");
      setReviewComment("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit review");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 sm:px-6 py-5 space-y-6 animate-pulse">
        <div className="h-3.5 w-48 bg-[var(--bg-secondary)] rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-[440px] bg-[var(--bg-secondary)] rounded-2xl" />
          <div className="lg:col-span-4 space-y-4">
            <div className="h-3.5 w-20 bg-[var(--bg-secondary)] rounded-full" />
            <div className="h-8 w-4/5 bg-[var(--bg-secondary)] rounded-xl" />
            <div className="h-7 w-1/3 bg-[var(--bg-secondary)] rounded-lg" />
            <div className="h-28 bg-[var(--bg-secondary)] rounded-xl" />
          </div>
          <div className="lg:col-span-3 h-[380px] bg-[var(--bg-secondary)] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 px-4 text-center max-w-md mx-auto space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--text-main)]">
          Product Not Found
        </h2>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          The item you’re looking for may have been moved or is no longer
          available.
        </p>
        <div className="pt-1">
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Explore All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-3 sm:px-6 py-4 space-y-10">
      {/* 1. Compact Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]"
      >
        <Link
          to="/"
          className="hover:text-[var(--text-main)] transition-colors"
        >
          Home
        </Link>
        <ChevronRight size={12} className="opacity-40" />
        <Link
          to={`/category/${product.category.slug}`}
          className="hover:text-[var(--text-main)] transition-colors"
        >
          {product.category.name}
        </Link>
        <ChevronRight size={12} className="opacity-40" />
        <span className="text-[var(--text-main)] font-medium truncate max-w-[200px] sm:max-w-md">
          {product.title}
        </span>
      </nav>

      {/* 2. Full-Width Compact Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        {/* Left Column: Full-Bleed Image Gallery (5 cols) */}
        <div className="lg:col-span-5 flex flex-col-reverse sm:flex-row gap-2.5 lg:sticky lg:top-24">
          {activeImages.length > 1 && (
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-[460px] shrink-0 no-scrollbar">
              {activeImages.map((img, idx) => {
                const isActive = activeImageIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden transition-all duration-200 shrink-0 cursor-pointer ${
                      isActive
                        ? "ring-2 ring-[var(--accent-primary)] opacity-100"
                        : "opacity-60 hover:opacity-100 border border-[var(--border-light)]/60"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Product Stage (Full-bleed object-cover) */}
          <div className="relative flex-1 aspect-square rounded-2xl bg-[var(--bg-secondary)]/50 border border-[var(--border-light)]/70 overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImages[activeImageIndex] || activeImages[0]}
                src={activeImages[activeImageIndex] || activeImages[0]}
                alt={product.title}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </AnimatePresence>

            {product.discountPercentage > 0 && (
              <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-tight bg-[var(--bg-main)]/85 backdrop-blur-md text-[var(--accent-primary)] border border-[var(--border-light)] shadow-xs">
                Save {product.discountPercentage}%
              </span>
            )}
          </div>
        </div>

        {/* Center Column: Product Info (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Brand & Title */}
          <div className="space-y-1">
            <Link
              to={`/products?brand=${encodeURIComponent(product.brand)}`}
              className="inline-block text-[11px] font-semibold tracking-wide text-[var(--accent-primary)] hover:opacity-80 transition-opacity"
            >
              {product.brand}
            </Link>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text-main)] leading-snug">
              {product.title}
            </h1>
          </div>

          {/* Ratings & Social Proof */}
          <div className="flex items-center gap-2.5 text-xs">
            <RatingStars
              rating={product.rating}
              reviewCount={product.reviewCount}
              size={14}
            />
            <span className="text-[var(--border-light)]">•</span>
            <span className="text-[var(--text-secondary)]">
              {product.salesCount || 100}+ bought recently
            </span>
          </div>

          {/* Compact Pricing Block */}
          <div className="pt-1 pb-4 border-b border-[var(--border-light)]/70 space-y-0.5">
            <div className="flex items-baseline gap-2.5 tabular-nums">
              <span className="text-2xl sm:text-[26px] font-semibold tracking-tight text-[var(--text-main)]">
                ₹{activePrice.toLocaleString("en-IN")}
              </span>
              {activeOriginalPrice > activePrice && (
                <>
                  <span className="text-xs text-[var(--text-secondary)] line-through">
                    ₹{activeOriginalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Save ₹
                    {(activeOriginalPrice - activePrice).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Inclusive of all taxes
            </p>
          </div>

          {/* Dynamic Variant Selector */}
          {product.hasVariants && variants.length > 0 && (
            <ProductVariantSelector
              variants={variants}
              selectedAttributes={selectedAttributes}
              onSelectAttribute={handleAttributeSelect}
              currentVariant={currentVariant}
            />
          )}

          {/* Key Highlights */}
          {product.highlights && product.highlights.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[var(--text-main)]">
                Highlights
              </h3>
              <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                {product.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)]/50 mt-2 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Compact Buy Box (3 cols) */}
        <div className="lg:col-span-3 lg:sticky lg:top-24">
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-secondary)]/55 backdrop-blur-xl border border-[var(--border-light)]/80 space-y-4">
            {/* Price & Stock Status */}
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-xl font-semibold tracking-tight text-[var(--text-main)] tabular-nums">
                ₹{activePrice.toLocaleString("en-IN")}
              </div>

              {product.status === "SOLD_OUT" || activeStock <= 0 ? (
                <span className="text-rose-500 text-xs font-medium flex items-center gap-1">
                  <AlertCircle size={13} /> Out of Stock
                </span>
              ) : locationStatus && !locationStatus.isServiceable ? (
                <span className="text-amber-600 dark:text-amber-400 text-[11px] font-medium">
                  Not deliverable
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-1">
                  <Check size={13} /> In Stock
                </span>
              )}
            </div>

            {/* Delivery Estimator */}
            <div className="pt-3 border-t border-[var(--border-light)]/70 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-main)]">
                <MapPin size={13} className="text-[var(--text-secondary)]" />
                <span className="truncate">
                  Deliver to {locationStatus?.city || "your location"}
                </span>
              </div>

              <form
                onSubmit={handlePincodeSubmit}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  maxLength={6}
                  value={pincodeInput}
                  onChange={(e) =>
                    setPincodeInput(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter PIN"
                  className="w-full pl-3 pr-14 py-1.5 rounded-full bg-[var(--bg-main)] border border-[var(--border-light)] text-xs font-medium tabular-nums focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {locationStatus && (
                <p
                  className={`text-[11px] leading-snug ${
                    locationStatus.isServiceable
                      ? "text-[var(--text-secondary)]"
                      : "text-rose-500"
                  }`}
                >
                  {locationStatus.message}
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-light)]/70">
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Quantity
              </span>
              <div className="flex items-center rounded-full bg-[var(--bg-main)] border border-[var(--border-light)] p-0.5">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[var(--bg-secondary)] disabled:opacity-30 text-[var(--text-main)] transition-colors cursor-pointer"
                >
                  <Minus size={11} />
                </button>
                <span className="w-7 text-center text-xs font-semibold tabular-nums text-[var(--text-main)]">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(activeStock, q + 1))
                  }
                  disabled={quantity >= activeStock}
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[var(--bg-secondary)] disabled:opacity-30 text-[var(--text-main)] transition-colors cursor-pointer"
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>

            {/* Primary Pill Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleAddToCart(false)}
                disabled={
                  isAddingCart ||
                  activeStock <= 0 ||
                  (locationStatus && !locationStatus.isServiceable)
                }
                className="w-full py-2.5 rounded-full bg-[var(--accent-primary)] text-white hover:brightness-105 active:scale-[0.99] disabled:opacity-40 font-medium text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ShoppingBag size={13} strokeWidth={2} />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={() => handleAddToCart(true)}
                disabled={
                  isAddingCart ||
                  activeStock <= 0 ||
                  (locationStatus && !locationStatus.isServiceable)
                }
                className="w-full py-2.5 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] hover:opacity-90 active:scale-[0.99] disabled:opacity-40 font-medium text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap size={13} />
                <span>Buy Now · Cash on Delivery</span>
              </button>

              <button
                onClick={handleWishlistToggle}
                className={`w-full py-2 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isWishlisted
                    ? "text-rose-500 bg-rose-500/10"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]/60"
                }`}
              >
                <Heart
                  size={12}
                  className={isWishlisted ? "fill-current" : ""}
                />
                <span>
                  {isWishlisted ? "Saved to Wishlist" : "Save for Later"}
                </span>
              </button>
            </div>

            {/* Minimal Guarantees */}
            <div className="pt-3 border-t border-[var(--border-light)]/70 space-y-2 text-[11px] text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={14}
                  className="text-[var(--text-main)] shrink-0 opacity-75"
                />
                <span>
                  {product.warranty || "1 Year Manufacturer Warranty"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw
                  size={14}
                  className="text-[var(--text-main)] shrink-0 opacity-75"
                />
                <span>{product.returnPolicy || "7 Days Easy Replacement"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Frequently Bought Together */}
      {relatedData?.frequentlyBoughtTogether &&
        relatedData.frequentlyBoughtTogether.length > 0 && (
          <section className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-secondary)]/45 border border-[var(--border-light)]/70">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-3">
                <h2 className="text-base font-semibold tracking-tight text-[var(--text-main)]">
                  Frequently Bought Together
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-[var(--bg-main)] border border-[var(--border-light)]/70 shrink-0">
                    <img
                      src={activeImages[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Plus size={14} className="text-[var(--text-secondary)]" />
                  {relatedData.frequentlyBoughtTogether.map((item) => (
                    <Link
                      key={item._id}
                      to={`/product/${item.slug}`}
                      className="w-20 h-20 rounded-xl overflow-hidden bg-[var(--bg-main)] border border-[var(--border-light)]/70 shrink-0 group"
                      title={item.title}
                    >
                      <img
                        src={item.thumbnail || item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[var(--border-light)]/70">
                <div className="lg:text-right">
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Combined Total
                  </p>
                  <p className="text-xl font-semibold tracking-tight text-[var(--text-main)] tabular-nums">
                    ₹
                    {(
                      activePrice +
                      (relatedData.frequentlyBoughtTogether[0]?.basePrice || 0)
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleAddToCart();
                    addToCart({
                      productId: relatedData.frequentlyBoughtTogether[0]._id,
                      quantity: 1,
                    });
                    toast.success("Bundle added to Bag");
                  }}
                  className="px-5 py-2.5 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Add Both to Bag
                </button>
              </div>
            </div>
          </section>
        )}

      {/* 4. Overview & Specifications */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-[var(--border-light)]/70">
        <div className="lg:col-span-5 space-y-2.5">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text-main)]">
            Overview
          </h2>
          <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {product.specifications && product.specifications.length > 0 && (
          <div className="lg:col-span-7 space-y-2.5">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text-main)]">
              Tech Specs
            </h2>
            <div className="divide-y divide-[var(--border-light)]/70 border-t border-b border-[var(--border-light)]/70">
              {product.specifications.map((spec, i) => (
                <div key={i} className="grid grid-cols-2 py-2.5 text-xs gap-4">
                  <span className="font-medium text-[var(--text-secondary)]">
                    {spec.name}
                  </span>
                  <span className="text-[var(--text-main)] font-medium">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 5. Customer Reviews */}
      <section className="space-y-5 pt-6 border-t border-[var(--border-light)]/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text-main)]">
              Ratings & Reviews
            </h2>
            <div className="flex items-center gap-2">
              <RatingStars
                rating={product.rating}
                reviewCount={product.reviewCount}
                size={15}
              />
              <span className="text-xs text-[var(--text-secondary)]">
                Based on {product.reviewCount} verified reviews
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]/80 text-[var(--text-main)] border border-[var(--border-light)] text-xs font-medium transition-colors self-start sm:self-auto cursor-pointer"
          >
            <MessageSquarePlus size={13} />
            <span>Write a Review</span>
          </button>
        </div>

        {reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviewsData.reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-4 rounded-2xl bg-[var(--bg-secondary)]/45 border border-[var(--border-light)]/70 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[var(--bg-main)] border border-[var(--border-light)] text-[var(--text-main)] font-semibold text-[11px] flex items-center justify-center uppercase">
                      {rev.user?.firstName?.[0] || "U"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-main)]">
                        {rev.user?.firstName} {rev.user?.lastName}
                      </p>
                      {rev.isVerifiedPurchase && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                          <Check size={10} /> Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <RatingStars
                    rating={rev.rating}
                    size={12}
                    showScore={false}
                  />
                  {rev.title && (
                    <h4 className="text-xs font-semibold text-[var(--text-main)] pt-0.5">
                      {rev.title}
                    </h4>
                  )}
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 rounded-2xl bg-[var(--bg-secondary)]/30 text-center">
            <p className="text-xs text-[var(--text-secondary)]">
              No reviews yet. Be the first to share your experience.
            </p>
          </div>
        )}
      </section>

      {/* 6. Related Products */}
      {relatedData?.customersAlsoViewed &&
        relatedData.customersAlsoViewed.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-[var(--border-light)]/70">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text-main)]">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {relatedData.customersAlsoViewed.slice(0, 5).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

      {/* Write Review Sheet / Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md p-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-light)] shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-[var(--text-main)]">
                    Write a Review
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Share your thoughts with other customers
                  </p>
                </div>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-1.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form
                onSubmit={handleReviewSubmit}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="block font-medium text-[var(--text-secondary)] mb-1.5">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          size={22}
                          className={
                            star <= reviewRating
                              ? "fill-amber-400 stroke-amber-400"
                              : "text-[var(--border-light)]"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[var(--text-secondary)] mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Summarize your experience"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-secondary)]/60 border border-[var(--border-light)] focus:outline-none focus:border-[var(--accent-primary)] text-xs transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[var(--text-secondary)] mb-1">
                    Review
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="What stood out about this product?"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)]/60 border border-[var(--border-light)] focus:outline-none focus:border-[var(--accent-primary)] text-xs transition-colors resize-none"
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-2.5 rounded-full bg-[var(--accent-primary)] text-white font-medium text-xs hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
