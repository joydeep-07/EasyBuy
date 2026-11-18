import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, X, Loader2, ArrowUpRight } from "lucide-react";
import {
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from "../../redux/api/wishlistApi";
import { useAddToCartMutation } from "../../redux/api/cartApi";
import { useAppSelector } from "../../redux/hooks";
import { RatingStars } from "../../components/common/RatingStars";
import { toast } from "sonner";

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const { data: wishlistData, isLoading } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [addToCart] = useAddToCartMutation();

  const [movingId, setMovingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleMoveToBag = async (product: any) => {
    if (product.hasVariants) {
      navigate(`/product/${product.slug}`);
      return;
    }

    setMovingId(product._id);
    try {
      await addToCart({ productId: product._id, quantity: 1 }).unwrap();
      await removeFromWishlist(product._id).unwrap();
      toast.success("Moved to Bag");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to move item to bag");
    } finally {
      setMovingId(null);
    }
  };

  const handleRemove = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();

    setRemovingId(productId);
    try {
      await removeFromWishlist(productId).unwrap();
      toast.info("Removed from Saved Items");
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  // Signed-Out State
  if (!isAuthenticated) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center px-4 py-16">
        <div
          className="max-w-md w-full rounded-[32px] p-8 sm:p-10 text-center space-y-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]"
          style={{
            backgroundColor: "var(--bg-primary)",
            border:
              "1px solid color-mix(in srgb, var(--text-main) 8%, transparent)",
          }}
        >
          <div
            className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--text-main) 5%, transparent)",
            }}
          >
            <Heart size={20} style={{ color: "var(--text-main)" }} />
          </div>
          <div className="space-y-2">
            <h2
              className="text-2xl font-semibold tracking-[-0.02em]"
              style={{ color: "var(--text-main)" }}
            >
              Sign in to view your saved items
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Keep track of the products you love across all your devices.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center justify-center h-10 px-7 rounded-full text-[13px] font-medium text-white transition-all hover:brightness-110 active:scale-95"
            style={{ backgroundColor: "var(--accent-primary)" }}
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Skeleton Loading State
  if (isLoading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto space-y-10 animate-pulse">
        <div className="space-y-2">
          <div
            className="h-9 w-48 rounded-full"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--text-main) 8%, transparent)",
            }}
          />
          <div
            className="h-4 w-32 rounded-full"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--text-main) 5%, transparent)",
            }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-[390px] rounded-[28px]"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--text-main) 5%, transparent)",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  const items = wishlistData?.wishlist || [];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 mx-auto space-y-10">
      {/* Editorial Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6"
        style={{
          borderBottom:
            "1px solid color-mix(in srgb, var(--text-main) 8%, transparent)",
        }}
      >
        <div>
          <h1
            className="text-3xl sm:text-5xl font-normal tracking-[-0.025em]"
            style={{ color: "var(--text-main)" }}
          >
           Wishlist Items
          </h1>
          <p
            className="text-sm mt-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            {items.length === 0
              ? "No items saved yet"
              : `${items.length} ${items.length === 1 ? "item" : "items"} ready when you are`}
          </p>
        </div>

        {items.length > 0 && (
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-[13px] font-medium transition-opacity hover:opacity-75"
            style={{ color: "var(--accent-primary)" }}
          >
            <span>Continue Shopping</span>
            <ArrowUpRight size={15} />
          </Link>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div
          className="py-24 px-6 text-center rounded-[32px] space-y-5"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--bg-secondary, var(--bg-primary)) 55%, var(--text-main) 2%)",
            border:
              "1px solid color-mix(in srgb, var(--text-main) 7%, transparent)",
          }}
        >
          <div
            className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--text-main) 6%, transparent)",
            }}
          >
            <Heart
              size={20}
              strokeWidth={1.75}
              style={{ color: "var(--text-secondary)" }}
            />
          </div>
          <div className="max-w-sm mx-auto space-y-1.5">
            <h3
              className="text-xl font-semibold tracking-tight"
              style={{ color: "var(--text-main)" }}
            >
              Your Saved list is empty
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Tap the heart on any product while browsing to save it here for
              later.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center justify-center h-10 px-7 rounded-full text-[13px] font-medium text-white transition-all hover:brightness-110 active:scale-95"
            style={{ backgroundColor: "var(--accent-primary)" }}
          >
            Explore Products
          </Link>
        </div>
      ) : (
        /* Product Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(({ product }) => {
            if (!product) return null;

            const isSoldOut = product.status === "SOLD_OUT";
            const hasDiscount = product.originalPrice > product.basePrice;
            const isMoving = movingId === product._id;
            const isRemoving = removingId === product._id;

            const primaryImage =
              product.images?.[0] ||
              product.thumbnail ||
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";

            const eyebrowLabel = isSoldOut
              ? "Unavailable"
              : product.isBestSeller
                ? "Bestseller"
                : product.discountPercentage > 0
                  ? `${product.discountPercentage}% Off`
                  : product.brand;

            return (
              <div
                key={product._id}
                className="group relative flex flex-col rounded-[28px] overflow-hidden transition-all duration-500 ease-out hover:-translate-y-1 shadow-[0_2px_20px_-6px_rgba(0,0,0,0.05)] hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_24px_-6px_rgba(0,0,0,0.4)]"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  border:
                    "1px solid color-mix(in srgb, var(--text-main) 7%, transparent)",
                }}
              >
                {/* Frosted Dismiss Button */}
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, product._id)}
                  disabled={isRemoving}
                  aria-label="Remove from saved items"
                  title="Remove"
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300 opacity-85 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--bg-primary) 78%, transparent)",
                    color: "var(--text-main)",
                    border:
                      "1px solid color-mix(in srgb, var(--text-main) 8%, transparent)",
                  }}
                >
                  {isRemoving ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <X size={14} strokeWidth={2} />
                  )}
                </button>

                {/* Studio Image Stage */}
                <Link
                  to={`/product/${product.slug}`}
                  className="relative block w-full aspect-square overflow-hidden focus:outline-none"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--bg-secondary, var(--bg-primary)) 50%, var(--text-main) 3%)",
                  }}
                >
                  <img
                    src={primaryImage}
                    alt={product.title}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] ${
                      isSoldOut ? "grayscale opacity-50" : ""
                    }`}
                  />
                </Link>

                {/* Card Content */}
                <div className="flex flex-col flex-1 p-5 sm:p-6">
                  {/* Eyebrow & Rating */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className="text-[11px] font-semibold tracking-tight truncate"
                      style={{
                        color: isSoldOut
                          ? "var(--text-secondary)"
                          : product.isBestSeller ||
                              product.discountPercentage > 0
                            ? "#bf4800"
                            : "var(--text-secondary)",
                      }}
                    >
                      {eyebrowLabel}
                    </span>

                    {product.rating > 0 && (
                      <div className="opacity-80 scale-90 origin-right">
                        <RatingStars
                          rating={product.rating}
                          reviewCount={product.reviewCount}
                          size={11}
                        />
                      </div>
                    )}
                  </div>

                  {/* Product Title */}
                  <Link
                    to={`/product/${product.slug}`}
                    className="block focus:outline-none"
                  >
                    <h3
                      className="text-[16px] sm:text-[17px] font-semibold tracking-[-0.015em] leading-[1.3] line-clamp-2 transition-opacity group-hover:opacity-80"
                      style={{ color: "var(--text-main)" }}
                    >
                      {product.title}
                    </h3>
                  </Link>

                  {/* Price & Action Bar */}
                  <div className="mt-auto pt-5 flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span
                        className="text-[15px] font-medium tracking-tight"
                        style={{ color: "var(--text-main)" }}
                      >
                        ₹{product.basePrice.toLocaleString("en-IN")}
                      </span>
                      {hasDiscount && (
                        <span
                          className="text-[12px] line-through opacity-55"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          ₹{product.originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    {isSoldOut ? (
                      <span
                        className="px-4 py-2 rounded-full text-[13px] font-medium opacity-50"
                        style={{
                          backgroundColor:
                            "color-mix(in srgb, var(--text-main) 8%, transparent)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Sold Out
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMoveToBag(product)}
                        disabled={isMoving}
                        className="h-9 px-4 rounded-full text-[13px] font-medium tracking-tight text-white flex items-center justify-center gap-1.5 transition-all duration-200 hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-50"
                        style={{ backgroundColor: "var(--accent-primary)" }}
                      >
                        {isMoving ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : product.hasVariants ? (
                          "Select"
                        ) : (
                          "Move to Bag"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
