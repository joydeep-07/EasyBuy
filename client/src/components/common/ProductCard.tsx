import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Heart,
  ShoppingBag,
  Eye,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";
import type { Product } from "../../types";
import { RatingStars } from "./RatingStars";
import { useAppSelector } from "../../redux/hooks";
import { useAddToCartMutation } from "../../redux/api/cartApi";
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "../../redux/api/wishlistApi";
import { toast } from "sonner";

gsap.registerPlugin(useGSAP);

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = "",
}) => {
  const navigate = useNavigate();

  // GSAP Refs
  const cardRef = useRef<HTMLDivElement>(null);
  const wishlistBtnRef = useRef<HTMLButtonElement>(null);
  const cartBtnRef = useRef<HTMLButtonElement>(null);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const wishlistIds = useAppSelector((state) => state.wishlist.wishlistIds);
  const isWishlisted = wishlistIds.includes(product._id);

  const [addToCart, { isLoading: isAddingCart }] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  useGSAP({ scope: cardRef });

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (wishlistBtnRef.current) {
      gsap.fromTo(
        wishlistBtnRef.current,
        { scale: 0.75 },
        { scale: 1, duration: 0.5, ease: "back.out(2.4)" },
      );
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your wishlist");
      navigate("/login");
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id).unwrap();
        toast.info("Removed from Wishlist");
      } else {
        await addToWishlist(product._id).unwrap();
        toast.success("Saved to Wishlist");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update wishlist");
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (cartBtnRef.current) {
      gsap.fromTo(
        cartBtnRef.current,
        { scale: 0.94 },
        { scale: 1, duration: 0.4, ease: "power3.out" },
      );
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to add products to your cart");
      navigate("/login");
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
      toast.success("Added to Cart");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add to cart");
    }
  };

  const primaryImage =
    product.images?.[0] ||
    product.thumbnail ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
  const isSoldOut = product.status === "SOLD_OUT";
  const savingsAmount =
    product.originalPrice > product.basePrice
      ? product.originalPrice - product.basePrice
      : 0;

  return (
    <div
      ref={cardRef}
      className={`relative flex flex-col rounded-3xl overflow-hidden shadow-[0_6px_24px_-8px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.45)] ${className}`}
      style={{
        backgroundColor: "var(--bg-primary)",
        border:
          "1px solid color-mix(in srgb, var(--text-main) 8%, transparent)",
      }}
    >
      {/* Top Floating Badges */}
      <div className="absolute top-3.5 left-3.5 z-20 flex flex-col items-start gap-1.5 pointer-events-none">
        {isSoldOut ? (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-900/90 text-zinc-200 backdrop-blur-md border border-white/10">
            Sold Out
          </span>
        ) : (
          <>
            {product.discountPercentage > 0 && (
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide text-zinc-950 shadow-sm"
                style={{ backgroundColor: "var(--accent-primary)" }}
              >
                -{product.discountPercentage}%
              </span>
            )}
            {product.isBestSeller && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide backdrop-blur-md shadow-sm"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--bg-primary) 88%, transparent)",
                  color: "var(--text-main)",
                  border:
                    "1px solid color-mix(in srgb, var(--accent-primary) 30%, transparent)",
                }}
              >
                <Sparkles
                  className="w-2.5 h-2.5"
                  style={{ color: "var(--accent-primary)" }}
                />
                Best Seller
              </span>
            )}
          </>
        )}
      </div>

      {/* Floating Glass Wishlist Button */}
      <button
        ref={wishlistBtnRef}
        type="button"
        onClick={handleWishlistToggle}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer shadow-sm"
        style={
          isWishlisted
            ? {
                backgroundColor: "#ef4444",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.2)",
              }
            : {
                backgroundColor:
                  "color-mix(in srgb, var(--bg-primary) 82%, transparent)",
                color: "var(--text-main)",
                border:
                  "1px solid color-mix(in srgb, var(--text-main) 10%, transparent)",
              }
        }
      >
        <Heart
          size={15}
          className={isWishlisted ? "fill-current scale-110" : ""}
        />
      </button>

      {/* Product Image Stage */}
      <div
        className="relative w-full pt-[94%] overflow-hidden"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--bg-secondary, var(--bg-primary)) 65%, var(--text-main) 3%)",
        }}
      >
        <Link
          to={`/product/${product.slug}`}
          className="absolute inset-0 block focus:outline-none"
        >
          <img
            src={primaryImage}
            alt={product.title}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover ${
              isSoldOut ? "grayscale opacity-60" : ""
            }`}
          />
        </Link>
      </div>

      {/* Card Details Body */}
      <div className="relative z-10 flex flex-col flex-1 p-4 sm:p-5">
        {/* Brand & Rating Row */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[10px] font-extrabold tracking-[0.14em] uppercase truncate"
            style={{ color: "var(--accent-primary)" }}
          >
            {product.brand}
          </span>
          <RatingStars
            rating={product.rating}
            reviewCount={product.reviewCount}
            size={12}
          />
        </div>

        {/* Product Title */}
        <Link
          to={`/product/${product.slug}`}
          className="mt-1.5 block focus:outline-none"
        >
          <h3
            className="text-sm sm:text-[15px] font-semibold line-clamp-2 leading-snug"
            style={{ color: "var(--text-main)" }}
          >
            {product.title}
          </h3>
        </Link>

        {/* Price, Delivery & Bottom Action Bar */}
        <div className="mt-auto pt-3.5">
          <div className="flex items-baseline flex-wrap gap-2">
            <span
              className="text-lg sm:text-xl font-extrabold tracking-tight"
              style={{ color: "var(--text-main)" }}
            >
              ₹{product.basePrice.toLocaleString("en-IN")}
            </span>

            {product.originalPrice > product.basePrice && (
              <span
                className="text-xs line-through opacity-65"
                style={{ color: "var(--text-secondary)" }}
              >
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}

            {savingsAmount > 0 && (
              <span
                className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--accent-primary) 12%, transparent)",
                  color: "var(--accent-primary)",
                }}
              >
                Save ₹{savingsAmount.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Delivery Assurance */}
          <div
            className="mt-2 flex items-center gap-1.5 text-[11px] font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            <ShieldCheck
              size={13}
              className="shrink-0"
              style={{ color: "var(--accent-primary)" }}
            />
            <span className="truncate">Free Insured Delivery</span>
          </div>

          {/* Bottom Action Bar */}
          <div className="mt-3.5 flex items-center gap-2">
            {isSoldOut ? (
              <button
                disabled
                className="w-full h-10 rounded-full text-xs font-semibold opacity-50 cursor-not-allowed"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--text-main) 10%, transparent)",
                  color: "var(--text-secondary)",
                }}
              >
                Out of Stock
              </button>
            ) : (
              <>
                <button
                  ref={cartBtnRef}
                  type="button"
                  onClick={handleQuickAdd}
                  disabled={isAddingCart}
                  className="flex-1 h-10 px-4 rounded-full font-bold text-xs text-zinc-950 flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer disabled:opacity-60"
                  style={{ backgroundColor: "var(--accent-primary)" }}
                >
                  {isAddingCart ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ShoppingBag size={14} />
                  )}
                  <span>
                    {isAddingCart
                      ? "Adding..."
                      : product.hasVariants
                        ? "Select Options"
                        : "Add to Cart"}
                  </span>
                </button>

                <Link
                  to={`/product/${product.slug}`}
                  aria-label={`View ${product.title}`}
                  className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--text-main) 6%, transparent)",
                    color: "var(--text-main)",
                    border:
                      "1px solid color-mix(in srgb, var(--text-main) 10%, transparent)",
                  }}
                >
                  <Eye size={15} />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
