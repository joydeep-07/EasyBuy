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
      <div className="flex items-center justify-between pb-4 border-b theme-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)]">Shopping Cart</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {cart?.totalItems} items in your basket
          </p>
        </div>
        <Link
          to="/products"
          className="text-xs font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1"
        >
          <span>Continue shopping</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 sm:p-6 rounded-3xl theme-surface border theme-border space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b theme-border last:border-b-0"
              >
                {/* Item Thumbnail & Details */}
                <div className="flex items-center gap-4 min-w-0">
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-2 bg-[var(--bg-secondary)] border shrink-0 flex items-center justify-center"
                  >
                    <img
                      src={item.product.thumbnail || item.product.images[0]}
                      alt={item.product.title}
                      className="w-full h-full object-contain"
                    />
                  </Link>

                  <div className="space-y-1 min-w-0">
                    <p className="text-[11px] font-bold uppercase text-[var(--accent-primary)]">
                      {item.product.brand}
                    </p>
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="text-xs sm:text-sm font-semibold text-[var(--text-main)] hover:text-[var(--accent-primary)] transition-colors line-clamp-2"
                    >
                      {item.product.title}
                    </Link>

                    {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                      <div className="flex flex-wrap gap-1 text-[11px] text-[var(--text-secondary)]">
                        {Object.entries(item.selectedAttributes).map(([k, v]) => (
                          <span key={k} className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded">
                            {k}: <strong>{v}</strong>
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs font-bold text-[var(--text-main)] sm:hidden pt-1">
                      ₹{item.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Quantity & Action Controls */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 shrink-0">
                  <div className="hidden sm:block text-right">
                    <span className="text-base font-bold text-[var(--text-main)]">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <p className="text-[10px] text-[var(--text-secondary)]">
                      ₹{item.price.toLocaleString('en-IN')} each
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Quantity Selector */}
                    <div className="flex items-center border theme-border rounded-xl theme-card overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdating}
                        className="p-1 px-2.5 hover:bg-[var(--bg-secondary)] text-[var(--text-main)] disabled:opacity-40"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-[var(--text-main)]">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock || isUpdating}
                        className="p-1 px-2.5 hover:bg-[var(--bg-secondary)] text-[var(--text-main)] disabled:opacity-40"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleRemove(item._id)}
                      disabled={isRemoving}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
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
          <div className="p-5 rounded-3xl theme-surface border theme-border space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)]">
              <Tag size={16} className="text-[var(--accent-primary)]" />
              <span>Apply Promo or Discount Code</span>
            </div>

            {cart?.appliedCoupon ? (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {cart.appliedCoupon.code}
                  </span>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Saved ₹{cart.discount.toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  disabled={isRemovingCoupon}
                  className="p-1 rounded-full hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10"
                  className="flex-1 px-3 py-2 rounded-xl border theme-border theme-card uppercase font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                />
                <button
                  type="submit"
                  disabled={!couponCode.trim() || isApplyingCoupon}
                  className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isApplyingCoupon ? 'Applying...' : 'Apply'}
                </button>
              </form>
            )}

            {/* Quick Available Coupons */}
            {couponsData?.coupons && couponsData.coupons.length > 0 && !cart?.appliedCoupon && (
              <div className="pt-2 space-y-1.5">
                <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Available Coupons:</p>
                <div className="flex flex-wrap gap-1.5">
                  {couponsData.coupons.slice(0, 3).map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => setCouponCode(c.code)}
                      className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-[var(--bg-secondary)] border theme-border hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-4">
            <h3 className="font-bold text-base text-[var(--text-main)]">Order Summary</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-[var(--text-main)]">
                  ₹{(cart?.subtotal || 0).toLocaleString('en-IN')}
                </span>
              </div>

              {cart && cart.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Coupon Savings:</span>
                  <span>-₹{cart.discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Delivery Charge:</span>
                <span>
                  {cart?.deliveryFee === 0 ? (
                    <strong className="text-[var(--accent-primary)]">FREE</strong>
                  ) : (
                    `₹${cart?.deliveryFee}`
                  )}
                </span>
              </div>

              <div className="pt-3 border-t theme-border flex justify-between text-base font-bold text-[var(--text-main)]">
                <span>Total Amount:</span>
                <span className="text-xl font-black text-[var(--accent-primary)]">
                  ₹{(cart?.grandTotal || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 rounded-2xl bg-[var(--accent-primary)] hover:opacity-90 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <div className="pt-2 text-[11px] text-[var(--text-secondary)] space-y-1.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck size={14} />
                <span>100% Purchase Protection with EasyBuy</span>
              </div>
              <p>Prices and delivery charges are calculated in accordance with your delivery destination.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
