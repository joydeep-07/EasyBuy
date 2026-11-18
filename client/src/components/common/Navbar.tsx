import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  MapPin,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Package,
  LogOut,
  Bell,
  ArrowUpRight,
  SlidersHorizontal,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useGetMeQuery, useLogoutMutation } from "../../redux/api/authApi";
import { useGetCartQuery } from "../../redux/api/cartApi";
import { useGetCategoriesQuery } from "../../redux/api/categoryApi";
import { useGetNotificationsQuery } from "../../redux/api/notificationApi";
import { useLazyGetSearchSuggestionsQuery } from "../../redux/api/productApi";
import { setCartData } from "../../redux/slices/cartSlice";
import { setUser, logoutSuccess } from "../../redux/slices/authSlice";
import { ThemeToggle } from "./ThemeToggle";
import { PincodeModal } from "./PincodeModal";
import { toast } from "sonner";

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Redux state
  const selectedPincode = useAppSelector(
    (state) => state.address.selectedPincode,
  );
  const cartCount = useAppSelector((state) => state.cart.itemCount);
  const wishlistCount = useAppSelector((state) => state.wishlist.items.length);
  const authUser = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // RTK Queries
  const { data: meData } = useGetMeQuery(undefined, {
    skip: isAuthenticated && !!authUser,
  });
  const { data: cartData } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: notificationData } = useGetNotificationsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [triggerSuggestions, { data: suggestionsData }] =
    useLazyGetSearchSuggestionsQuery();

  const [logoutUser] = useLogoutMutation();

  const unreadNotifications =
    notificationData?.notifications?.filter((n: any) => !n.isRead)?.length || 0;

  // Scroll detection for dynamic glass elevation
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global Cmd+K / Ctrl+K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        setIsAccountMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync user profile
  useEffect(() => {
    if (meData?.user) dispatch(setUser(meData.user));
  }, [meData, dispatch]);

  // Sync cart data
  useEffect(() => {
    if (cartData?.cart) dispatch(setCartData(cartData.cart));
  }, [cartData, dispatch]);

  // Debounced search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        triggerSuggestions(searchQuery.trim());
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [searchQuery, triggerSuggestions]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (!searchQuery.trim()) return;

    const catParam =
      selectedCategory !== "all" ? `&category=${selectedCategory}` : "";
    navigate(
      `/products?keyword=${encodeURIComponent(searchQuery.trim())}${catParam}`,
    );
  };

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(logoutSuccess());
      setIsAccountMenuOpen(false);
      toast.success("Signed out successfully");
      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full transition-all duration-300">
        {/* 1. Refined Editorial Top Bar */}
        <div className="w-full bg-zinc-950 text-zinc-300 text-[11px] tracking-wide py-1.5 px-4 sm:px-8 border-b border-white/10">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden whitespace-nowrap">
              <span className="truncate text-zinc-300">
                Complimentary Express Delivery above ₹499 - Code{" "}
                <span className="text-white font-semibold tracking-wider">
                  WELCOME10
                </span>{" "}
                for 10% off
              </span>
            </div>

            <div className="hidden md:flex items-center gap-5 text-[11px] text-zinc-400">
              <Link
                to="/track-order/EB-202611-1001"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Track Order</span>
              </Link>
              {/* <span className="h-3 w-[1px] bg-white/15" />
              <Link
                to="/admin/login"
                className="hover:text-emerald-400 transition-colors font-medium text-zinc-300"
              >
                Merchant Portal
              </Link> */}
            </div>
          </div>
        </div>

        {/* 2. Main Frosted Glass Navbar */}
        <div className="w-full bg-[var(--bg-main)] border-b border-[var(--border-light)] px-4 sm:px-8 py-3 transition-colors">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 lg:gap-8">
            {/* Left: Mobile Trigger, Brand Logo & Delivery Pill */}
            <div className="flex items-center gap-3 sm:gap-6 shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
                className="lg:hidden p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-main)] transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Brand Mark */}
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="flex flex-col">
                  <span className="text-xl font-normal tracking-wide font-mono text-[var(--text-main)] leading-none">
                    Easy
                    <span className="text-[var(--accent-primary)] font-normal">
                      Buy
                    </span>
                  </span>
                  <span className="text-[9px] font-medium tracking-[0.22em] uppercase text-[var(--text-secondary)] mt-1">
                    Curated Store
                  </span>
                </div>
              </Link>

              {/* Subtle Vertical Divider */}
              <div className="hidden xl:block h-6 w-[1px] bg-black/10 dark:bg-white/10" />

              {/* Minimal Delivery Location Pill */}
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="hidden xl:flex items-center gap-2 py-1.5 px-3 rounded-full bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors text-left group"
              >
                <MapPin className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0 group-hover:scale-110 transition-transform" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    Deliver to
                  </span>
                  <span className="text-xs font-semibold text-[var(--text-main)] tracking-tight">
                    {selectedPincode || "Select PIN"}
                  </span>
                </div>
              </button>
            </div>

            {/* Center: Sleek Pill Search Bar */}
            <div ref={searchContainerRef} className="relative flex-1 max-w-2xl">
              <form
                onSubmit={handleSearchSubmit}
                className="group flex items-center rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-transparent focus-within:border-[var(--accent-primary)]/40 focus-within:bg-[var(--bg-primary)] focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-200"
              >
                {/* Department Selector */}
                <div className="hidden md:flex items-center pl-4 pr-2 border-r border-black/10 dark:border-white/10">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    aria-label="Select department"
                    className="bg-transparent text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)] py-2 pr-1 focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="all">All</option>
                    {categoriesData?.categories?.map((cat) => (
                      <option key={cat._id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Input */}
                <div className="flex-1 flex items-center px-3.5">
                  <Search className="w-4 h-4 text-[var(--text-secondary)] shrink-0 mr-2.5 group-focus-within:text-[var(--accent-primary)] transition-colors" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() =>
                      searchQuery.length > 1 && setShowSuggestions(true)
                    }
                    placeholder="Search curated products, brands, models..."
                    className="w-full py-2 text-sm bg-transparent text-[var(--text-main)] placeholder-[var(--text-secondary)]/75 focus:outline-none"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setShowSuggestions(false);
                      }}
                      className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)] bg-black/[0.05] dark:bg-white/[0.08] rounded-md">
                      ⌘K
                    </kbd>
                  )}
                </div>

                {/* Search Action */}
                <button
                  type="submit"
                  aria-label="Search"
                  className="mr-1.5 px-4 py-1.5 rounded-full bg-[var(--accent-primary)] text-white text-xs font-semibold hover:brightness-110 active:scale-95 transition-all"
                >
                  Search
                </button>
              </form>

              {/* Elevated Autocomplete Dropdown */}
              {showSuggestions && suggestionsData?.success && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-[var(--bg-primary)]/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden z-50 p-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                  {suggestionsData.products.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] px-3 py-1">
                        Products
                      </p>
                      <div className="space-y-0.5">
                        {suggestionsData.products.map((p: any) => (
                          <Link
                            key={p._id}
                            to={`/product/${p.slug}`}
                            onClick={() => setShowSuggestions(false)}
                            className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={
                                  p.thumbnail ||
                                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100"
                                }
                                alt={p.title}
                                className="w-10 h-10 rounded-lg object-contain bg-white p-1 border border-black/5 shrink-0"
                              />
                              <div className="truncate">
                                <p className="text-xs font-medium text-[var(--text-main)] truncate group-hover:text-[var(--accent-primary)] transition-colors">
                                  {p.title}
                                </p>
                                <p className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5">
                                  ₹{p.basePrice?.toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {suggestionsData.brands.length > 0 && (
                    <div className="pt-2 border-t border-black/5 dark:border-white/5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] px-3 py-1">
                        Brands
                      </p>
                      <div className="flex flex-wrap gap-1.5 px-3 pt-1">
                        {suggestionsData.brands.map((b: string) => (
                          <Link
                            key={b}
                            to={`/products?brand=${encodeURIComponent(b)}`}
                            onClick={() => setShowSuggestions(false)}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-black/[0.04] dark:bg-white/[0.06] text-[var(--text-main)] hover:bg-[var(--accent-primary)] hover:text-white transition-colors"
                          >
                            {b}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Clean, Borderless Utility Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <ThemeToggle />

              {/* Wishlist */}
              <Link
                to="/wishlist"
                title="Wishlist"
                className="relative p-2.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[var(--text-main)] transition-colors"
              >
                <Heart className="w-[19px] h-[19px] stroke-[1.8]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Pill */}
              <Link
                to="/cart"
                className="relative flex items-center gap-2.5 py-2 px-3.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 transition-all shadow-sm group"
              >
                <div className="relative flex items-center">
                  <ShoppingBag className="w-4 h-4 stroke-[2.2] group-hover:scale-105 transition-transform" />
                  {cartCount > 0 && (
                    <span className="ml-1.5 text-xs font-bold">
                      {cartCount}
                    </span>
                  )}
                </div>
                {Boolean(
                  cartData?.cart?.grandTotal && cartData.cart.grandTotal > 0,
                ) && (
                  <>
                    <span className="hidden xl:block h-3.5 w-[1px] bg-white/25 dark:bg-black/20" />
                    <span className="hidden xl:block text-xs font-semibold tracking-tight">
                      ₹{cartData?.cart?.grandTotal?.toLocaleString("en-IN")}
                    </span>
                  </>
                )}
              </Link>

              {/* Account Dropdown */}
              <div ref={accountMenuRef} className="relative ml-1">
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="flex items-center gap-2 p-1 pr-2.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-emerald-700 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                    {isAuthenticated && authUser?.firstName ? (
                      authUser.firstName.charAt(0).toUpperCase()
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="hidden lg:flex flex-col leading-none">
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {isAuthenticated
                        ? `Hi, ${authUser?.firstName}`
                        : "Welcome"}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-0.5 mt-0.5">
                      Account <ChevronDown className="w-3 h-3 opacity-70" />
                    </span>
                  </div>
                </button>

                {/* Refined Account Popover */}
                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-[var(--bg-primary)]/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 z-50">
                    {isAuthenticated ? (
                      <div>
                        <div className="px-3 py-2.5 mb-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05]">
                          <p className="text-xs font-bold text-[var(--text-main)]">
                            {authUser?.firstName} {authUser?.lastName}
                          </p>
                          <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                            {authUser?.email}
                          </p>
                          {authUser?.role === "ADMIN" && (
                            <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]">
                              Administrator
                            </span>
                          )}
                        </div>

                        <div className="space-y-0.5 text-xs">
                          <Link
                            to="/account"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[var(--text-main)] transition-colors"
                          >
                            <UserIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                            Profile & Addresses
                          </Link>
                          <Link
                            to="/orders"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[var(--text-main)] transition-colors"
                          >
                            <Package className="w-4 h-4 text-[var(--text-secondary)]" />
                            Orders & Tracking
                          </Link>
                          <Link
                            to="/wishlist"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[var(--text-main)] transition-colors"
                          >
                            <Heart className="w-4 h-4 text-[var(--text-secondary)]" />
                            Saved Wishlist
                          </Link>
                          {authUser?.role === "ADMIN" && (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setIsAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-semibold transition-colors"
                            >
                              <Sparkles className="w-4 h-4" />
                              Admin Dashboard
                            </Link>
                          )}
                        </div>

                        <div className="mt-1.5 pt-1.5 border-t border-black/5 dark:border-white/5">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-medium transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 text-center">
                        <p className="text-xs font-medium text-[var(--text-main)] mb-1">
                          Your EasyBuy Account
                        </p>
                        <p className="text-[11px] text-[var(--text-secondary)] mb-3.5 leading-relaxed">
                          Access saved items, express checkout, and live order
                          tracking.
                        </p>
                        <Link
                          to="/login"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="block w-full py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 transition-opacity mb-2.5"
                        >
                          Sign In
                        </Link>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          New here?{" "}
                          <Link
                            to="/register"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="text-[var(--accent-primary)] font-semibold hover:underline"
                          >
                            Create an account
                          </Link>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-[var(--bg-primary)] h-full shadow-2xl p-5 flex flex-col justify-between z-10 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                <span className="text-lg font-bold tracking-tight text-[var(--text-main)]">
                  Easy<span className="text-[var(--accent-primary)]">Buy</span>
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-main)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile PIN Selector */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsPinModalOpen(true);
                }}
                className="mt-4 w-full flex items-center justify-between p-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] text-left"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[var(--accent-primary)]" />
                  <div>
                    <p className="text-[10px] text-[var(--text-secondary)]">
                      Delivering to
                    </p>
                    <p className="text-xs font-semibold text-[var(--text-main)]">
                      PIN {selectedPincode || "Set Location"}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[var(--accent-primary)]">
                  Change
                </span>
              </button>

              {/* Categories List */}
              <div className="mt-6 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] px-2 mb-2">
                  Departments
                </p>
                <Link
                  to="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
                >
                  All Collections
                </Link>
                {categoriesData?.categories?.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/category/${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-2">
              <Link
                to="/products?isBestSeller=true"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400"
              >
                <Sparkles className="w-4 h-4" /> Best Sellers
              </Link>
              <Link
                to="/track-order/EB-202611-1001"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)]"
              >
                <Package className="w-4 h-4" /> Track Orders
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Pincode Selection Dialog */}
      <PincodeModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
      />
    </>
  );
};
