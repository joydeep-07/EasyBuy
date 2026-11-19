import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Copy,
  Check,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "../../components/common/ProductCard";
import {
  useGetProductsQuery,
  useGetPersonalizedRecommendationsQuery,
} from "../../redux/api/productApi";
import { useGetCategoriesQuery } from "../../redux/api/categoryApi";
import { useGetActiveCouponsQuery } from "../../redux/api/couponApi";

gsap.registerPlugin(ScrollTrigger, Draggable, useGSAP);

const HERO_SLIDES = [
  {
    id: 1,
    eyebrow: "Exclusive Tech Fest • 2026 Edition",
    title: "Next Gen Performance Devices",
    subtitle:
      "Experience flagship laptops, studio audio, and pro smartphones with up to 25% instant bank privilege.",
    image:
      "https://i.pinimg.com/1200x/f4/10/5c/f4105c20d13d1951523117c24a129170.jpg",
    link: "/category/electronics",
    buttonText: "Explore Electronics",
    secondaryLink: "/products?isBestSeller=true",
    secondaryText: "View Flagships",
  },
  {
    id: 2,
    eyebrow: "Curated Seasonal Drop",
    title: "The Autumn & Winter Fashion Edit",
    subtitle:
      "Architectural silhouettes, elevated streetwear, and performance outerwear crafted for everyday luxury.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&auto=format&fit=crop&q=85",
    link: "/category/fashion",
    buttonText: "Shop The Collection",
    secondaryLink: "/products?isTrending=true",
    secondaryText: "Trending Lookbook",
  },
  {
    id: 3,
    eyebrow: "Lab-Tested Purity",
    title: "Fuel Your Peak Performance",
    subtitle:
      "100% authentic isolates, recovery formulas, and precision training gear verified at the source.",
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1800&auto=format&fit=crop&q=85",
    link: "/category/sports-fitness",
    buttonText: "Shop Nutrition & Gear",
    secondaryLink: "/products",
    secondaryText: "All Essentials",
  },
];

const SLIDE_DURATION = 6; // seconds

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  "electronics": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80",
  "smartphones": "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80",
  "laptops": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
  "headphones-audio": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
  "fashion": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80",
  "mens-clothing": "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80",
  "womens-clothing": "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80",
  "grocery": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80",
  "beauty": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80",
  "home-kitchen": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80",
  "sports-fitness": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
  "supplements-protein": "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80",
  "footwear": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
  "accessories": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80",
  "books": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
};

const getCategoryPhoto = (cat: { slug?: string; name?: string; image?: string }) => {
  // If the DB image is set and NOT the old repeated laptop/desk image
  if (cat.image && cat.image.trim() !== "" && !cat.image.includes("1498049794561")) {
    return cat.image;
  }
  if (cat.slug && CATEGORY_FALLBACK_IMAGES[cat.slug]) {
    return CATEGORY_FALLBACK_IMAGES[cat.slug];
  }
  const lowerName = (cat.name || "").toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
    if (lowerName.includes(key.replace("-", " ")) || key.includes(lowerName)) {
      return url;
    }
  }
  return "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80";
};

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
    {[...Array(4)].map((_, idx) => (
      <div
        key={idx}
        className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] p-4 space-y-3 animate-pulse bg-black/[0.02] dark:bg-white/[0.02]"
      >
        <div className="w-full h-52 rounded-xl bg-black/[0.06] dark:bg-white/[0.06]" />
        <div className="h-3 w-1/3 rounded bg-black/[0.06] dark:bg-white/[0.06]" />
        <div className="h-4 w-3/4 rounded bg-black/[0.06] dark:bg-white/[0.06]" />
        <div className="h-5 w-1/2 rounded bg-black/[0.06] dark:bg-white/[0.06]" />
      </div>
    ))}
  </div>
);

export const HomePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [canScrollCat, setCanScrollCat] = useState({
    left: false,
    right: true,
  });

  // GSAP Scope & Element Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRefs = useRef<(HTMLDivElement | null)[]>([]);
  const couponBtnRef = useRef<HTMLButtonElement>(null);
  const isFirstRender = useRef(true);

  // Category Draggable Refs
  const catViewportRef = useRef<HTMLDivElement>(null);
  const catTrackRef = useRef<HTMLDivElement>(null);
  const catDraggableRef = useRef<Draggable[] | null>(null);
  const isDraggingCatRef = useRef(false);

  // RTK Queries
  const { data: categoriesData, isLoading: loadingCategories } =
    useGetCategoriesQuery();
  const { data: bestSellersData, isLoading: loadingBestSellers } =
    useGetProductsQuery({
      isBestSeller: "true",
      limit: 8,
    });
  const { data: trendingData, isLoading: loadingTrending } =
    useGetProductsQuery({
      isTrending: "true",
      limit: 8,
    });
  const { data: recommendationsData } = useGetPersonalizedRecommendationsQuery({
    limit: 8,
  });
  const { data: couponsData } = useGetActiveCouponsQuery();

  const featuredCoupon = couponsData?.coupons?.[0];

  // Auto-advance hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION * 1000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  // Category Slider Helpers
  const updateCatNavState = () => {
    const viewport = catViewportRef.current;
    const track = catTrackRef.current;
    if (!viewport || !track) return;

    const maxScroll = Math.min(0, viewport.offsetWidth - track.scrollWidth);
    const currentX = (gsap.getProperty(track, "x") as number) || 0;

    setCanScrollCat({
      left: currentX < -4,
      right: currentX > maxScroll + 4,
    });
  };

  const slideCategories = (direction: "left" | "right") => {
    const viewport = catViewportRef.current;
    const track = catTrackRef.current;
    if (!viewport || !track) return;

    const maxScroll = Math.min(0, viewport.offsetWidth - track.scrollWidth);
    const currentX = (gsap.getProperty(track, "x") as number) || 0;
    const step = Math.max(260, viewport.offsetWidth * 0.65);

    const targetX =
      direction === "left"
        ? Math.min(0, currentX + step)
        : Math.max(maxScroll, currentX - step);

    gsap.to(track, {
      x: targetX,
      duration: 0.75,
      ease: "power3.out",
      overwrite: "auto",
      onUpdate: () => {
        catDraggableRef.current?.[0]?.update();
        updateCatNavState();
      },
      onComplete: updateCatNavState,
    });
  };

  // 1. HERO CAROUSEL & PROGRESS BAR ANIMATION
  useGSAP(
    () => {
      const track = sliderTrackRef.current;
      const activeSlide = slideRefs.current[currentSlide];

      if (track) {
        gsap.to(track, {
          xPercent: -currentSlide * 100,
          duration: isFirstRender.current ? 0 : 0.95,
          ease: "expo.out",
          overwrite: "auto",
        });
      }

      slideRefs.current.forEach((slide, idx) => {
        if (!slide) return;
        const img = slide.querySelector(".hero-bg-img");
        if (img && idx !== currentSlide) {
          gsap.to(img, {
            scale: 1.08,
            duration: 0.8,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      });

      if (activeSlide) {
        const img = activeSlide.querySelector(".hero-bg-img");
        const contentItems = activeSlide.querySelectorAll(".hero-stagger");

        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.08 },
            {
              scale: 1,
              duration: 1.6,
              ease: "power2.out",
              overwrite: "auto",
            },
          );
        }

        if (contentItems.length) {
          gsap.fromTo(
            contentItems,
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.75,
              stagger: 0.08,
              delay: isFirstRender.current ? 0.1 : 0.22,
              ease: "power2.out",
              overwrite: "auto",
            },
          );
        }
      }

      progressRefs.current.forEach((bar, idx) => {
        if (!bar) return;
        gsap.killTweensOf(bar);

        if (idx === currentSlide) {
          gsap.fromTo(
            bar,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: SLIDE_DURATION,
              ease: "none",
            },
          );
        } else {
          gsap.set(bar, { scaleX: idx < currentSlide ? 1 : 0 });
        }
      });

      isFirstRender.current = false;
    },
    { dependencies: [currentSlide], scope: containerRef },
  );

  // 2. STATIC SCROLL SECTIONS (Trust Bar, Coupon Ticket, Newsletter)
  useGSAP(
    () => {
      gsap.from(".trust-item", {
        y: 22,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: ".trust-bar",
          start: "top 90%",
          once: true,
        },
      });

      if (featuredCoupon) {
        gsap.from(".coupon-banner", {
          y: 28,
          opacity: 0,
          scale: 0.985,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: ".coupon-banner",
            start: "top 88%",
            once: true,
          },
        });
      }

      gsap.from(".newsletter-box", {
        y: 32,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: ".newsletter-box",
          start: "top 88%",
          once: true,
        },
      });
    },
    { dependencies: [Boolean(featuredCoupon)], scope: containerRef },
  );

  // 3. CATEGORIES: ENTRANCE + GSAP DRAGGABLE SINGLE-LINE SLIDER
  useGSAP(
    () => {
      if (
        loadingCategories ||
        !categoriesData?.categories?.length ||
        !catViewportRef.current ||
        !catTrackRef.current
      ) {
        return;
      }

      const viewport = catViewportRef.current;
      const track = catTrackRef.current;

      gsap.from(".category-card", {
        y: 24,
        opacity: 0,
        scale: 0.94,
        duration: 0.65,
        stagger: 0.05,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: viewport,
          start: "top 88%",
          once: true,
        },
      });

      const getBounds = () => ({
        minX: Math.min(0, viewport.offsetWidth - track.scrollWidth),
        maxX: 0,
      });

      catDraggableRef.current = Draggable.create(track, {
        type: "x",
        bounds: getBounds(),
        edgeResistance: 0.72,
        dragClickables: true,
        allowNativeTouchScrolling: false,
        onDragStart() {
          isDraggingCatRef.current = true;
          gsap.killTweensOf(track);
        },
        onDrag() {
          updateCatNavState();
        },
        onDragEnd() {
          const { minX, maxX } = getBounds();
          const currentX = (gsap.getProperty(track, "x") as number) || 0;
          if (currentX < minX || currentX > maxX) {
            gsap.to(track, {
              x: Math.max(minX, Math.min(maxX, currentX)),
              duration: 0.5,
              ease: "power3.out",
              onUpdate: updateCatNavState,
            });
          } else {
            updateCatNavState();
          }
          setTimeout(() => {
            isDraggingCatRef.current = false;
          }, 60);
        },
      });

      updateCatNavState();

      const handleResize = () => {
        const bounds = getBounds();
        catDraggableRef.current?.[0]?.applyBounds(bounds);
        const currentX = (gsap.getProperty(track, "x") as number) || 0;
        if (currentX < bounds.minX) {
          gsap.set(track, { x: bounds.minX });
        }
        updateCatNavState();
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        catDraggableRef.current?.[0]?.kill();
      };
    },
    {
      dependencies: [loadingCategories, categoriesData?.categories?.length],
      scope: containerRef,
    },
  );

  // 4. PRODUCT GRIDS SCROLL REVEALS
  useGSAP(
    () => {
      if (!loadingBestSellers && bestSellersData?.products?.length) {
        gsap.from(".bestseller-item", {
          y: 28,
          opacity: 0,
          duration: 0.65,
          stagger: 0.06,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: ".bestsellers-grid",
            start: "top 86%",
            once: true,
          },
        });
      }
    },
    {
      dependencies: [loadingBestSellers, bestSellersData?.products?.length],
      scope: containerRef,
    },
  );

  useGSAP(
    () => {
      if (!loadingTrending && trendingData?.products?.length) {
        gsap.from(".trending-item", {
          y: 28,
          opacity: 0,
          duration: 0.65,
          stagger: 0.06,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: ".trending-grid",
            start: "top 86%",
            once: true,
          },
        });
      }
    },
    {
      dependencies: [loadingTrending, trendingData?.products?.length],
      scope: containerRef,
    },
  );

  useGSAP(
    () => {
      if (recommendationsData?.recommendations?.length) {
        gsap.from(".recommended-item", {
          y: 28,
          opacity: 0,
          duration: 0.65,
          stagger: 0.06,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: ".recommended-grid",
            start: "top 86%",
            once: true,
          },
        });
      }
    },
    {
      dependencies: [recommendationsData?.recommendations?.length],
      scope: containerRef,
    },
  );

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied to clipboard!`);

    if (couponBtnRef.current) {
      gsap.fromTo(
        couponBtnRef.current,
        { scale: 0.94 },
        { scale: 1, duration: 0.45, ease: "elastic.out(1, 0.5)" },
      );
    }

    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    toast.success(
      "Welcome to EasyBuy Insider! Check your inbox for early access.",
    );
    setNewsletterEmail("");
  };

  return (
    <div ref={containerRef} className="w-full space-y-14 overflow-x-clip">
      {/* 1. ATTACHED CONTINUOUS SLIDING HERO SHOWCASE */}
      <section className="relative w-full h-[460px] sm:h-[540px] lg:h-[620px] overflow-hidden bg-zinc-950">
        {/* Attached Horizontal Track */}
        <div
          ref={sliderTrackRef}
          className="flex h-full w-full will-change-transform"
        >
          {HERO_SLIDES.map((item, idx) => (
            <div
              key={item.id}
              ref={(el) => {
                slideRefs.current[idx] = el;
              }}
              className="relative w-full h-full shrink-0 overflow-hidden"
            >
              {/* Slide Background Image */}
              <img
                src={item.image}
                alt={item.title}
                className="hero-bg-img absolute inset-0 w-full h-full object-cover object-center opacity-65 will-change-transform"
              />

              {/* Slide Foreground Content */}
              <div className="relative z-10 h-full max-w-[1600px] mx-auto px-6 sm:px-12 flex flex-col justify-center">
                <div className="max-w-2xl space-y-5">
                  <div className="hero-stagger inline-flex items-center gap-2 text-xs font-medium text-zinc-200">
                    <span className="tracking-wide">{item.eyebrow}</span>
                  </div>

                  <h1 className="hero-stagger text-4xl sm:text-5xl lg:text-6xl font-medium font-mono uppercase tracking-tight text-white leading-[1.08]">
                    {item.title}
                  </h1>

                  <p className="hero-stagger text-sm sm:text-base lg:text-lg text-zinc-300 max-w-xl leading-relaxed font-normal">
                    {item.subtitle}
                  </p>

                  <div className="hero-stagger pt-3 flex flex-wrap items-center gap-3.5">
                    <Link
                      to={item.link}
                      className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white text-zinc-950 hover:bg-emerald-400 hover:text-zinc-950 font-semibold text-sm shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-colors duration-300"
                    >
                      <span>{item.buttonText}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>

                    <Link
                      to={item.secondaryLink}
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white font-medium text-sm transition-colors duration-300"
                    >
                      <span>{item.secondaryText}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Glass Bar: Progress Indicators + Controls */}
        <div className="absolute bottom-6 left-0 right-0 z-20 px-6 sm:px-12">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
            {/* GPU-Accelerated Slide Progress Bars */}
            <div className="flex items-center gap-2.5">
              {HERO_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className="group py-2 focus:outline-none cursor-pointer"
                >
                  <div className="h-1 w-10 sm:w-14 rounded-full bg-white/25 overflow-hidden">
                    <div
                      ref={(el) => {
                        progressRefs.current[idx] = el;
                      }}
                      className={`h-full w-full origin-left rounded-full will-change-transform ${
                        idx === currentSlide ? "bg-emerald-400" : "bg-white/60"
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>

            {/* Minimal Prev/Next Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setCurrentSlide((prev) =>
                    prev === 0 ? HERO_SLIDES.length - 1 : prev - 1,
                  )
                }
                aria-label="Previous slide"
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white backdrop-blur-md transition-all duration-200 active:scale-90 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
                }
                aria-label="Next slide"
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white backdrop-blur-md transition-all duration-200 active:scale-90 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* 2. MINIMAL TRUST & PRIVILEGE BAR */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8 -mt-6">
        <div className="trust-bar grid grid-cols-1 md:grid-cols-3 gap-4 p-4 sm:p-5 rounded-2xl bg-[var(--bg-primary)] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="trust-item flex items-center gap-3.5 px-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-[var(--accent-primary)] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[var(--text-main)]">
                100% Verified Authentic
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Direct brand-authorized inventory with warranty
              </p>
            </div>
          </div>

          <div className="trust-item flex items-center gap-3.5 px-2 md:border-x border-black/[0.06] dark:border-white/[0.08]">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-[var(--accent-primary)] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[var(--text-main)]">
                Express Insured Dispatch
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Complimentary priority shipping on orders over ₹499
              </p>
            </div>
          </div>

          <div className="trust-item flex items-center gap-3.5 px-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-[var(--accent-primary)] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[var(--text-main)]">
                Effortless 7-Day Returns
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Instant doorstep pickup & zero-hassle refunds
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* 3. INTERACTIVE CLICK-TO-COPY COUPON TICKET */}
      {featuredCoupon && (
        <section className="coupon-banner max-w-[1600px] mx-auto px-4 sm:px-8">
          <div
            className="relative overflow-hidden rounded-md p-6 border border-[var(--border-light)]/50 sm:p-8 transition-all duration-300 shadow-sm"
            style={{
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-main)",
            }}
          >
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Left Side: Offer Copy */}
              <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                <div>
                  <div className="inline-flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: "var(--accent-primary)" }}
                      />
                      Limited Privilege Pass
                    </span>
                  </div>

                  <h3
                    className="text-lg sm:text-4xl py-2 font-semibold tracking-tight"
                    style={{ color: "var(--text-main)" }}
                  >
                    Unlock{" "}
                    <span style={{ color: "var(--accent-primary)" }}>
                      {featuredCoupon.discountType === "PERCENTAGE"
                        ? `${featuredCoupon.discountValue}% Instant Savings`
                        : `₹${featuredCoupon.discountValue} Off`}
                    </span>{" "}
                    on Your Order
                  </h3>

                  <p
                    className="text-xs sm:text-sm mt-1 leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Apply the voucher code at checkout to redeem your exclusive
                    member discount.
                  </p>
                </div>
              </div>

              {/* Perforated Divider + Action Controls */}
              <div
                className="flex flex-wrap items-center gap-3 w-full lg:w-auto pt-4 lg:pt-0 lg:pl-8 border-t lg:border-t-0 lg:border-l border-dashed"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--accent-primary) 28%, transparent)",
                }}
              >
                {/* Click-to-Copy Code Pill */}
                <button
                  ref={couponBtnRef}
                  onClick={() => handleCopyCoupon(featuredCoupon.code)}
                  className="flex-1 sm:flex-initial flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-dashed transition-all duration-200 group cursor-pointer hover:brightness-105"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--accent-primary) 7%, transparent)",
                    borderColor:
                      "color-mix(in srgb, var(--accent-primary) 45%, transparent)",
                  }}
                >
                  <span
                    className="font-mono text-sm font-extrabold tracking-widest uppercase"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    {featuredCoupon.code}
                  </span>

                  {copiedCode === featuredCoupon.code ? (
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-bold"
                      style={{ color: "var(--accent-primary)" }}
                    >
                      <Check className="w-3.5 h-3.5" /> Copied
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-medium opacity-80 group-hover:opacity-100 transition-opacity"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </span>
                  )}
                </button>

                {/* Primary CTA */}
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-zinc-950 shadow-sm hover:opacity-90 active:scale-[0.98] transition-all shrink-0"
                  style={{
                    backgroundColor: "var(--accent-primary)",
                  }}
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
      {/* 4. CURATED DEPARTMENTS (SINGLE-LINE DRAGGABLE CIRCULAR SLIDER) */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8">
        {/* Header + Circular Navigation Arrows */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 mb-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "var(--accent-primary)" }}
              />
              <span
                className="text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "var(--accent-primary)" }}
              >
                Curated Departments
              </span>
            </div>
            <h2
              className="text-2xl sm:text-4xl font-semibold tracking-tight"
              style={{ color: "var(--text-main)" }}
            >
              Shop by Category
            </h2>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--accent-primary) 8%, transparent)",
                color: "var(--text-main)",
                border:
                  "1px solid color-mix(in srgb, var(--accent-primary) 22%, transparent)",
              }}
            >
              <span>All Collections</span>
              <ArrowUpRight
                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                style={{ color: "var(--accent-primary)" }}
              />
            </Link>

            {/* Circular Slider Arrows */}
            {!loadingCategories &&
              (categoriesData?.categories?.length ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 pl-1">
                  <button
                    type="button"
                    onClick={() => slideCategories("left")}
                    disabled={!canScrollCat.left}
                    aria-label="Scroll categories left"
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-main)",
                      border:
                        "1px solid color-mix(in srgb, var(--text-main) 12%, transparent)",
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => slideCategories("right")}
                    disabled={!canScrollCat.right}
                    aria-label="Scroll categories right"
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-main)",
                      border:
                        "1px solid color-mix(in srgb, var(--text-main) 12%, transparent)",
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* Single-Line Draggable Circular Track */}
        {loadingCategories ? (
          <div className="flex items-center gap-6 overflow-hidden py-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-28 sm:w-36 flex flex-col items-center gap-3"
              >
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-black/[0.05] dark:bg-white/[0.05] animate-pulse" />
                <div className="h-3.5 w-20 rounded-full bg-black/[0.06] dark:bg-white/[0.06] animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={catViewportRef}
            className="relative w-full overflow-hidden py-2 select-none"
          >
            <div
              ref={catTrackRef}
              className="flex items-start gap-5 sm:gap-7 w-max will-change-transform cursor-grab active:cursor-grabbing"
            >
              {categoriesData?.categories?.map((cat) => (
                <div
                  key={cat._id}
                  className="category-card shrink-0 w-28 sm:w-36"
                >
                  <Link
                    to={`/category/${cat.slug}`}
                    draggable={false}
                    onClick={(e) => {
                      if (isDraggingCatRef.current) {
                        e.preventDefault();
                      }
                    }}
                    className="group flex flex-col items-center text-center focus:outline-none"
                  >
                    {/* Circular Medallion Frame */}
                    <div
                      className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5 transition-transform duration-500 ease-out group-hover:-translate-y-1.5"
                      style={{
                        background:
                          "linear-gradient(145deg, color-mix(in srgb, var(--accent-primary) 35%, transparent), color-mix(in srgb, var(--text-main) 10%, transparent))",
                      }}
                    >
                      {/* Hover Aura */}
                      <div
                        className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
                        style={{
                          backgroundColor:
                            "color-mix(in srgb, var(--accent-primary) 28%, transparent)",
                        }}
                      />

                      {/* Circular Photo */}
                      <div
                        className="relative w-full h-full rounded-full overflow-hidden shadow-sm"
                        style={{ backgroundColor: "var(--bg-primary)" }}
                      >
                        <img
                          src={getCategoryPhoto(cat)}
                          alt={cat.name}
                          draggable={false}
                          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/15 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-500" />
                      </div>
                    </div>

                    {/* Clean Category Name Below */}
                    <span
                      className="mt-3 text-xs sm:text-sm font-semibold tracking-tight line-clamp-1 px-1 transition-colors duration-300 group-hover:text-[var(--accent-primary)]"
                      style={{ color: "var(--text-main)" }}
                    >
                      {cat.name}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      {/* 5. BEST SELLERS SHOWCASE */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8">
        <div className="flex items-end justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
                Best Sellers
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Most coveted essentials rated highest by verified buyers
              </p>
            </div>
          </div>
          <Link
            to="/products?isBestSeller=true"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-primary)] hover:opacity-80 transition-opacity"
          >
            <span>Explore all</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {loadingBestSellers ? (
          <ProductGridSkeleton />
        ) : (
          <div className="bestsellers-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {bestSellersData?.products?.map((product) => (
              <div key={product._id} className="bestseller-item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>
      {/* 6. TRENDING DEALS & DROPS */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8">
        <div className="flex items-end justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-[var(--accent-primary)] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
                Trending Offers
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Limited-time price drops and high-demand arrivals
              </p>
            </div>
          </div>
          <Link
            to="/products?isTrending=true"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-primary)] hover:opacity-80 transition-opacity"
          >
            <span>View all deals</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {loadingTrending ? (
          <ProductGridSkeleton />
        ) : (
          <div className="trending-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {trendingData?.products?.map((product) => (
              <div key={product._id} className="trending-item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>
      {/* 7. PERSONALIZED RECOMMENDATIONS */}
      {recommendationsData?.recommendations &&
        recommendationsData.recommendations.length > 0 && (
          <section className="max-w-[1600px] mx-auto px-4 sm:px-8">
            <div className="p-6 sm:p-10 rounded-[2rem] bg-black/[0.025] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]">
                      Tailored Selection
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
                      Curated For You
                    </h2>
                  </div>
                </div>
                <Link
                  to="/products"
                  className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)] hover:text-[var(--accent-primary)] transition-colors"
                >
                  <span>Browse full catalogue</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </Link>
              </div>

              <div className="recommended-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {recommendationsData.recommendations
                  .slice(0, 4)
                  .map((product) => (
                    <div key={product._id} className="recommended-item">
                      <ProductCard product={product} />
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}
      
      {/* 8. NEWSLETTER SECTION */}
      <section className="newsletter-box max-w-[1600px] mx-auto px-4 sm:px-8 py-8">
        <div
          className="relative overflow-hidden rounded-3xl px-6 py-12 sm:px-12 sm:py-16 border"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Newsletter Content */}
            <div className="max-w-xl text-center lg:text-left space-y-4">
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider"
                style={{ color: "var(--accent-primary)" }}
              >
                <Mail className="w-4 h-4" />
                <span>MEMBER EXCLUSIVE</span>
              </div>

              <h3
                className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1]"
                style={{ color: "var(--text-main)" }}
              >
                Something good is
                <br className="hidden sm:block" />
                <span style={{ color: "var(--text-secondary)" }}>
                  coming to your inbox.
                </span>
              </h3>

              <p
                className="text-sm sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0"
                style={{ color: "var(--text-secondary)" }}
              >
                Get early access to exclusive drops, special offers, and
                carefully curated collections. No clutter, just the good stuff.
              </p>
            </div>

            {/* Newsletter Form */}
            <form
              onSubmit={handleNewsletterSubmit}
              className="w-full lg:max-w-md space-y-3"
            >
              <div
                className="flex flex-col sm:flex-row gap-2 p-1.5 rounded-2xl border transition-all duration-200"
                style={{
                  background: "var(--bg-main)",
                  borderColor: "var(--border-light)",
                  boxShadow: "var(--shadow-subtle)",
                }}
              >
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 min-w-0 px-4 py-3 bg-transparent text-sm outline-none"
                  style={{
                    color: "var(--text-main)",
                  }}
                />

                <button
                  type="submit"
                  className="apple-btn-primary px-7 py-3 text-sm cursor-pointer whitespace-nowrap"
                >
                  Subscribe
                  <span className="ml-1.5">→</span>
                </button>
              </div>

              <p
                className="text-[11px] text-center lg:text-left"
                style={{ color: "var(--text-tertiary)" }}
              >
                By subscribing, you agree to receive occasional updates.
                Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </section>
      
    </div>
  );
};
