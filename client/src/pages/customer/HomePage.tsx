import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  TrendingUp,
  Tag,
  ArrowRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { ProductCard } from '../../components/common/ProductCard';
import {
  useGetProductsQuery,
  useGetPersonalizedRecommendationsQuery,
} from '../../redux/api/productApi';
import { useGetCategoriesQuery } from '../../redux/api/categoryApi';
import { useGetActiveCouponsQuery } from '../../redux/api/couponApi';

const HERO_SLIDES = [
  {
    id: 1,
    title: 'Next-Gen Performance Devices',
    subtitle: 'Up to 25% Off Premium Laptops & Smartphones with Instant Bank Discount',
    badge: 'Exclusive Tech Fest',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80',
    link: '/category/electronics',
    buttonText: 'Shop Electronics',
  },
  {
    id: 2,
    title: 'The Autumn & Winter Fashion Edit',
    subtitle: 'Explore curated streetwear, designer dresses & athletic sportswear',
    badge: 'Trending Styles',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80',
    link: '/category/fashion',
    buttonText: 'Explore Fashion',
  },
  {
    id: 3,
    title: 'Fuel Your Peak Performance',
    subtitle: 'Authentic 100% Whey Proteins, BCAAs & Gym Gear at Unmatched Prices',
    badge: 'Fitness Essentials',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1600&auto=format&fit=crop&q=80',
    link: '/category/sports-fitness',
    buttonText: 'Shop Nutrition',
  },
];

export const HomePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // RTK Queries for real backend data
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: bestSellersData } = useGetProductsQuery({ isBestSeller: 'true', limit: 8 });
  const { data: trendingData } = useGetProductsQuery({ isTrending: 'true', limit: 8 });
  const { data: recommendationsData } = useGetPersonalizedRecommendationsQuery({ limit: 8 });
  const { data: couponsData } = useGetActiveCouponsQuery();

  // Hero carousel auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="w-full space-y-10 pb-16">
      {/* 1. Full-Width Hero Carousel */}
      <section className="relative w-full h-[380px] sm:h-[480px] lg:h-[540px] overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover opacity-70"
            />
            {/* Dark green gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Slide Content */}
        <div className="relative z-10 h-full max-w-[1920px] mx-auto px-6 sm:px-12 flex flex-col justify-center max-w-2xl text-white">
          <motion.div
            key={`content-${slide.id}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--accent-primary)] text-white shadow-md">
              <Sparkles size={14} />
              {slide.badge}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {slide.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-200 line-clamp-2 max-w-xl">
              {slide.subtitle}
            </p>
            <div className="pt-2">
              <Link
                to={slide.link}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all hover:gap-3"
              >
                <span>{slide.buttonText}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Carousel Controls */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentSlide ? 'w-8 bg-[var(--accent-primary)]' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. Promotional Coupon Strip */}
      {couponsData?.coupons && couponsData.coupons.length > 0 && (
        <section className="px-4 sm:px-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md">
                <Tag size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg">Special Savings Unlocked!</h3>
                <p className="text-xs sm:text-sm text-emerald-100">
                  Use code <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">{couponsData.coupons[0].code}</span> for {couponsData.coupons[0].discountType === 'PERCENTAGE' ? `${couponsData.coupons[0].discountValue}%` : `₹${couponsData.coupons[0].discountValue}`} instant discount at checkout!
                </p>
              </div>
            </div>
            <Link
              to="/products"
              className="px-5 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm shrink-0"
            >
              Shop Qualifying Items
            </Link>
          </div>
        </section>
      )}

      {/* 3. Shop by Top Categories Grid */}
      <section className="px-4 sm:px-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)]">Shop by Category</h2>
            <p className="text-xs text-[var(--text-secondary)]">Explore top departments curated with verified quality</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1"
          >
            <span>See all</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categoriesData?.categories?.map((cat) => (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              className="group flex flex-col items-center p-3 rounded-2xl theme-surface border theme-border hover:border-[var(--accent-primary)] hover:shadow-md transition-all text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[var(--bg-secondary)] mb-2 p-1">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200'}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-semibold text-[var(--text-main)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Best Selling Products Row */}
      <section className="px-4 sm:px-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Flame size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)]">Best Sellers</h2>
              <p className="text-xs text-[var(--text-secondary)]">Most popular products bought by thousands of customers</p>
            </div>
          </div>
          <Link
            to="/products?isBestSeller=true"
            className="text-xs font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1"
          >
            <span>View more</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellersData?.products?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Trending Deals Row */}
      <section className="px-4 sm:px-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-[var(--accent-primary)]">
              <TrendingUp size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)]">Trending Offers & Deals</h2>
              <p className="text-xs text-[var(--text-secondary)]">Handpicked price drops and limited time discounts</p>
            </div>
          </div>
          <Link
            to="/products?isTrending=true"
            className="text-xs font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1"
          >
            <span>View all deals</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {trendingData?.products?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Personalized Recommendations Section */}
      {recommendationsData?.recommendations && recommendationsData.recommendations.length > 0 && (
        <section className="px-4 sm:px-6">
          <div className="p-6 sm:p-8 rounded-3xl theme-card border theme-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-[var(--accent-primary)] text-white shadow-sm">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)]">
                    Recommended For You
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Based on your preferences, browsing trends, and past orders
                  </p>
                </div>
              </div>
              <Link
                to="/products"
                className="text-xs font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1"
              >
                <span>Explore catalogue</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {recommendationsData.recommendations.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Newsletter Subscription Banner */}
      <section className="px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl theme-surface border theme-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-main)]">
              Stay in the loop with EasyBuy Deals
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Subscribe to get secret discount codes, flash sale alerts, and new product releases directly to your inbox.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for subscribing to EasyBuy updates!');
            }}
            className="flex w-full md:w-auto max-w-md gap-2"
          >
            <input
              type="email"
              required
              placeholder="Enter your email address..."
              className="flex-1 px-4 py-3 rounded-xl border theme-border theme-card text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[var(--accent-primary)] hover:opacity-90 text-white font-bold text-xs sm:text-sm shrink-0 transition-opacity"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
