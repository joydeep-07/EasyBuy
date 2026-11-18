import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  User as UserIcon,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Package,
  LogOut,
  Heart,
  MapPin,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useLogoutMutation } from "../../redux/api/authApi";
import { logoutSuccess } from "../../redux/slices/authSlice";

const AccountDropdown: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const authUser = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const wishlistCount = useAppSelector((state) => state.wishlist.items.length);

  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutMutation();

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.search]);

  // Close on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(logoutSuccess());
      setIsOpen(false);
      toast.success("Signed out successfully");
      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div ref={menuRef} className="relative ml-1">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`group flex items-center gap-2.5 p-1 lg:pr-3 rounded-full border transition-all duration-200 text-left ${
          isOpen
            ? "bg-[var(--bg-secondary)] border-[var(--border-light)]"
            : "border-[var(--border-light)] hover:bg-[var(--bg-secondary)]"
        }`}
      >
        {/* Avatar Circle */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-sm">
            <UserIcon className="w-4 h-4 stroke-[2]" />
          </div>
          {isAuthenticated && (
            <span
              aria-hidden="true"
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-main)]"
            />
          )}
        </div>

        {/* Desktop Label */}
        <div className="hidden lg:flex flex-col leading-none">
          <span className="text-[10px] font-medium text-[var(--text-secondary)]">
            {isAuthenticated ? `Hi, ${authUser?.firstName}` : "Sign in"}
          </span>
          <span className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-1 mt-0.5">
            Account
            <ChevronDown
              className={`w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform duration-200 ${
                isOpen ? "rotate-180 text-[var(--accent-primary)]" : ""
              }`}
            />
          </span>
        </div>
      </button>

      {/* Apple-Style Popover Menu */}
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-72 rounded-2xl apple-glass border border-[var(--border-light)] shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150"
        >
          {isAuthenticated ? (
            <>
              {/* Profile Header Card */}
              <div className="relative p-4 border-b border-[var(--border-light)] bg-[var(--bg-secondary)]/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-sm shrink-0">
                    <UserIcon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-[var(--text-main)] truncate">
                        {authUser?.firstName} {authUser?.lastName}
                      </p>
                      {authUser?.role === "ADMIN" && (
                        <span title="Verified Administrator" className="inline-flex items-center">
                          <ShieldCheck
                            className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0"
                          />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                      {authUser?.email}
                    </p>
                  </div>
                </div>

                {authUser?.role === "ADMIN" && (
                  <div className="mt-2.5 pt-2 border-t border-[var(--border-light)] flex items-center justify-between">
                    <span className="text-[10px] font-medium text-[var(--text-secondary)]">
                      Role
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-[var(--accent-surface)] text-[var(--accent-primary)]">
                      Administrator
                    </span>
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <div className="p-1.5 space-y-0.5">
                <Link
                  to="/account"
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center justify-between p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-light)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[var(--text-main)]">
                        My Profile
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)]">
                        Personal info & saved addresses
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>

                <Link
                  to="/orders"
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center justify-between p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-light)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[var(--text-main)]">
                        Orders & Tracking
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)]">
                        Live status & tracking details
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>

                <Link
                  to="/wishlist"
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center justify-between p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-light)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-rose-500 transition-colors">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[var(--text-main)]">
                        Saved Wishlist
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)]">
                        Favorite products & saved items
                      </p>
                    </div>
                  </div>
                  {wishlistCount > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500">
                      {wishlistCount}
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  )}
                </Link>

                {authUser?.role === "ADMIN" && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center justify-between p-2 mt-1 rounded-xl bg-[var(--accent-surface)] text-[var(--accent-primary)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-sm">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--accent-primary)]">
                          Admin Console
                        </p>
                        <p className="text-[10px] text-[var(--text-secondary)]">
                          Manage store, catalog & inventory
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--accent-primary)] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>

              {/* Footer Sign Out */}
              <div className="p-1.5 border-t border-[var(--border-light)] bg-[var(--bg-secondary)]/30">
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 disabled:opacity-50 text-xs font-medium transition-colors group"
                >
                  <span className="flex items-center gap-2.5">
                    <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    {isLoggingOut ? "Signing out..." : "Sign Out"}
                  </span>
                  <span className="text-[10px] text-rose-500/70">
                    End session
                  </span>
                </button>
              </div>
            </>
          ) : (
            /* Guest Experience */
            <div>
              <div className="p-5 text-center border-b border-[var(--border-light)]">
                <div className="w-10 h-10 mx-auto mb-2.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-light)] flex items-center justify-center text-[var(--accent-primary)]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-[var(--text-main)]">
                  Your Account
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Sign in to view orders, saved items, and account details.
                </p>

                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="mt-3.5 w-full py-2 px-4 rounded-full bg-[var(--accent-primary)] text-white text-xs font-medium hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <p className="text-[11px] text-[var(--text-secondary)] mt-3">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="text-[var(--accent-primary)] font-medium hover:underline"
                  >
                    Create one
                  </Link>
                </p>
              </div>

              {/* Guest Quick Actions */}
              <div className="p-1.5">
                <Link
                  to="/track-order"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--bg-secondary)] text-xs text-[var(--text-main)] transition-colors"
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                    Track Guest Order
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountDropdown;
