import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useApplyCouponMutation,
  useRemoveCouponMutation,
} from '../../redux/api/cartApi';
import { useGetActiveCouponsQuery } from '../../redux/api/couponApi';
import { useAppSelector } from '../../redux/hooks';
import { toast } from 'sonner';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [couponCode, setCouponCode] = useState('');

  const { data: cartResponse, isLoading, refetch } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: couponsData } = useGetActiveCouponsQuery();

  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeCartItem, { isLoading: isRemoving }] = useRemoveCartItemMutation();
  const [applyCoupon, { isLoading: isApplyingCoupon }] = useApplyCouponMutation();
  const [removeCoupon, { isLoading: isRemovingCoupon }] = useRemoveCouponMutation();

  const cart = cartResponse?.cart;

  const handleQuantityChange = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      await updateCartItem({ itemId, quantity: newQty }).unwrap();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeCartItem(itemId).unwrap();
      toast.info('Item removed from cart');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to remove item');
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const res = await applyCoupon(couponCode.trim()).unwrap();
      toast.success(res.message);
      setCouponCode('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon().unwrap();
      toast.info('Coupon removed');
    } catch (err: any) {
      toast.error('Failed to remove coupon');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4 px-4">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-[var(--accent-primary)] mx-auto flex items-center justify-center">
          <ShoppingBag size={32} />
        </div>
        <h2 className="text-2xl font-black text-[var(--text-main)]">Your EasyBuy Cart is waiting</h2>
        <p className="text-xs text-[var(--text-secondary)]">Sign in to retrieve your saved shopping bag, wishlist, and check out securely.</p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            to="/login"
            className="w-full py-3 rounded-xl bg-[var(--accent-primary)] text-white font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Sign In to your Account
          </Link>
          <Link
            to="/register"
            className="w-full py-3 rounded-xl border theme-border theme-card font-bold text-xs hover:bg-[var(--bg-secondary)]"
          >
            Create an Account
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1920px] mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
          <div className="lg:col-span-4 h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4 px-4">
        <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-gray-800 text-gray-400 mx-auto flex items-center justify-center">
          <ShoppingBag size={36} />
        </div>
        <h2 className="text-2xl font-black text-[var(--text-main)]">Your Cart is empty</h2>
        <p className="text-xs text-[var(--text-secondary)]">Looks like you haven't added any items to your shopping cart yet.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90"
        >
          <span>Continue Shopping</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 py-6 space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-[var(--border-light)]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-main)]">Review your Bag</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Free shipping and free returns on all orders.
          </p>
        </div>
        <Link
          to="/products"
          className="text-xs font-medium text-[var(--accent-primary)] hover:underline flex items-center gap-1"
        >
          <span>Continue shopping</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--border-light)] divide-y divide-[var(--border-light)]">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-6 first:pt-0 last:pb-0"
              >
                {/* Item Thumbnail & Details */}
                <div className="flex items-center gap-5 min-w-0">
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-3 bg-[var(--bg-secondary)] border border-[var(--border-light)] shrink-0 flex items-center justify-center"
                  >
                    <img
                      src={item.product.thumbnail || item.product.images[0]}
                      alt={item.product.title}
                      className="w-full h-full object-contain"
                    />
                  </Link>

                  <div className="space-y-1 min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                      {item.product.brand}
                    </p>
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="text-sm sm:text-base font-semibold text-[var(--text-main)] hover:text-[var(--accent-primary)] transition-colors line-clamp-2"
                    >
                      {item.product.title}
                    </Link>

                    {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 text-[11px] text-[var(--text-secondary)] pt-0.5">
                        {Object.entries(item.selectedAttributes).map(([k, v]) => (
                          <span key={k} className="bg-[var(--bg-secondary)] px-2.5 py-0.5 rounded-full border border-[var(--border-light)]">
                            {k}: <strong>{v}</strong>
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs font-semibold text-[var(--text-main)] sm:hidden pt-1">
                      ₹{item.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Quantity & Action Controls */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 shrink-0">
                  <div className="hidden sm:block text-right">
                    <span className="text-base font-semibold text-[var(--text-main)]">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      ₹{item.price.toLocaleString('en-IN')} each
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-[var(--border-light)] rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdating}
                        className="p-1 px-3 hover:bg-[var(--bg-tertiary)] text-[var(--text-main)] disabled:opacity-40 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2.5 text-xs font-semibold text-[var(--text-main)]">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock || isUpdating}
                        className="p-1 px-3 hover:bg-[var(--bg-tertiary)] text-[var(--text-main)] disabled:opacity-40 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleRemove(item._id)}
                      disabled={isRemoving}
                      className="p-2 rounded-full text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Order Summary & Coupon box (4 cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-28">
          {/* Coupon Input Box */}
          <div className="p-5 rounded-3xl bg-[var(--bg-main)] border border-[var(--border-light)] space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-main)]">
              <Tag size={15} className="text-[var(--accent-primary)]" />
              <span>Have a Promo Code?</span>
            </div>

            {cart?.appliedCoupon ? (
              <div className="p-3 rounded-2xl bg-[var(--accent-surface)] border border-[var(--accent-primary)]/20 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[var(--accent-primary)] font-mono">
                    {cart.appliedCoupon.code}
                  </span>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Saved ₹{cart.discount.toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  disabled={isRemovingCoupon}
                  className="p-1 rounded-full hover:bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10"
                  className="flex-1 px-4 py-2 rounded-full border border-[var(--border-light)] bg-[var(--bg-secondary)] uppercase font-mono text-xs focus:outline-none focus:border-[var(--accent-primary)]"
                />
                <button
                  type="submit"
                  disabled={!couponCode.trim() || isApplyingCoupon}
                  className="px-5 py-2 rounded-full bg-[var(--accent-primary)] text-white text-xs font-medium hover:brightness-105 disabled:opacity-40 transition-all"
                >
                  {isApplyingCoupon ? '...' : 'Apply'}
                </button>
              </form>
            )}

            {/* Quick Available Coupons */}
            {couponsData?.coupons && couponsData.coupons.length > 0 && !cart?.appliedCoupon && (
              <div className="pt-1 space-y-1.5">
                <p className="text-[10px] font-medium text-[var(--text-secondary)] uppercase">Available:</p>
                <div className="flex flex-wrap gap-1.5">
                  {couponsData.coupons.slice(0, 3).map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => setCouponCode(c.code)}
                      className="px-3 py-1 rounded-full text-[10px] font-mono font-medium bg-[var(--bg-secondary)] border border-[var(--border-light)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="p-6 rounded-3xl bg-[var(--bg-main)] border border-[var(--border-light)] shadow-sm space-y-4">
            <h3 className="font-semibold text-base text-[var(--text-main)]">Order Summary</h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal:</span>
                <span className="font-medium text-[var(--text-main)]">
                  ₹{(cart?.subtotal || 0).toLocaleString('en-IN')}
                </span>
              </div>

              {cart && cart.discount > 0 && (
                <div className="flex justify-between text-[var(--accent-primary)] font-medium">
                  <span>Discount:</span>
                  <span>-₹{cart.discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Shipping:</span>
                <span className="text-[var(--text-main)]">
                  {cart?.deliveryFee === 0 ? 'FREE' : `₹${cart?.deliveryFee}`}
                </span>
              </div>

              <div className="pt-3 border-t border-[var(--border-light)] flex justify-between text-base font-semibold text-[var(--text-main)]">
                <span>Total:</span>
                <span className="text-xl font-bold tracking-tight text-[var(--accent-primary)]">
                  ₹{(cart?.grandTotal || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] hover:opacity-90 active:scale-95 font-medium text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Check Out</span>
              <ArrowRight size={15} />
            </button>

            <div className="pt-2 text-[11px] text-[var(--text-secondary)] space-y-1 text-center">
              <p>Cash on Delivery available on this order.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
