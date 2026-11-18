import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Heart, Loader2 } from "lucide-react";
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
        { scale: 0.8 },
        { scale: 1, duration: 0.45, ease: "back.out(2.2)" },
      );
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to save items");
      navigate("/login");
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id).unwrap();
        toast.info("Removed from Saved Items");
      } else {
        await addToWishlist(product._id).unwrap();
        toast.success("Saved");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update saved items");
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (cartBtnRef.current) {
      gsap.fromTo(
        cartBtnRef.current,
        { scale: 0.96 },
        { scale: 1, duration: 0.35, ease: "power3.out" },
      );
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your bag");
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
      toast.success("Added to Bag");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add to bag");
    }
  };

  const primaryImage =
    product.images?.[0] ||
    product.thumbnail ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";

  const isSoldOut = product.status === "SOLD_OUT";
  const hasDiscount = product.originalPrice > product.basePrice;

  // Single refined Apple-style eyebrow label
  const eyebrowLabel = isSoldOut
    ? "Unavailable"
    : product.isBestSeller
      ? "Bestseller"
      : product.discountPercentage > 0
        ? `${product.discountPercentage}% Off`
        : product.brand;

  return (
    <div
      ref={cardRef}
      className={`group relative flex flex-col rounded-[28px] overflow-hidden transition-all duration-500 ease-out ${className}`}
      style={{
        backgroundColor: "var(--bg-primary)",
        border:
          "1px solid color-mix(in srgb, var(--text-main) 7%, transparent)",
      }}
    >
      {/* Minimal Frosted Wishlist Button */}
      <button
        ref={wishlistBtnRef}
        type="button"
        onClick={handleWishlistToggle}
        aria-label={isWishlisted ? "Remove from saved" : "Save item"}
        className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300 cursor-pointer ${
          isWishlisted
            ? "opacity-100 scale-100"
            : "opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
        }`}
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--bg-primary) 75%, transparent)",
          color: isWishlisted ? "#ff3b30" : "var(--text-main)",
          border:
            "1px solid color-mix(in srgb, var(--text-main) 8%, transparent)",
        }}
      >
        <Heart
          size={14}
          strokeWidth={2}
          className={isWishlisted ? "fill-current" : ""}
        />
      </button>

      {/* Clean Studio Image Stage */}
      <Link
        to={`/product/${product.slug}`}
        className="relative block w-full aspect-[4/4] overflow-hidden focus:outline-none"
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

      {/* Editorial Content Body */}
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        {/* Eyebrow Status / Brand */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span
            className="text-[11px] font-semibold tracking-tight truncate"
            style={{
              color: isSoldOut
                ? "var(--text-secondary)"
                : product.isBestSeller || product.discountPercentage > 0
                  ? "#bf4800" // Signature Apple Store warm amber highlight
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

        {/* Bottom Price & Action Row */}
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
              ref={cartBtnRef}
              type="button"
              onClick={handleQuickAdd}
              disabled={isAddingCart}
              className="h-9 px-4 rounded-full text-[13px] font-medium tracking-tight flex items-center justify-center gap-1.5 transition-all duration-200 hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: "var(--accent-primary)",
                color: "#ffffff",
              }}
            >
              {isAddingCart ? (
                <Loader2 size={14} className="animate-spin" />
              ) : product.hasVariants ? (
                "Select"
              ) : (
                "Add to Bag"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
