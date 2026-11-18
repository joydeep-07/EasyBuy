import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  CreditCard,
  Banknote,
  ShieldCheck,
  Check,
  Plus,
  ArrowRight,
  ChevronRight,
  PackageCheck,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { useGetCartQuery } from '../../redux/api/cartApi';
import { useGetAddressesQuery, useAddAddressMutation } from '../../redux/api/addressApi';
import { useCreateOrderMutation } from '../../redux/api/orderApi';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { toast } from 'sonner';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Addresses query
  const { data: addressData, isLoading: isLoadingAddresses } = useGetAddressesQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Cart query
  const { data: cartData, isLoading: isLoadingCart } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation();
  const [addAddress, { isLoading: isAddingAddress }] = useAddAddressMutation();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const paymentMethod: 'COD' = 'COD';
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // New address form state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [houseBuilding, setHouseBuilding] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('713301');
  const [addressType, setAddressType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');

  // Set default address when loaded
  useEffect(() => {
    if (addressData?.addresses && addressData.addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addressData.addresses.find((a) => a.isDefault) || addressData.addresses[0];
      setSelectedAddressId(defaultAddr._id);
    }
  }, [addressData, selectedAddressId]);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const cart = cartData?.cart;
  const addresses = addressData?.addresses || [];

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber || !houseBuilding || !street || !city || !state || !pincode) {
      toast.error('Please fill in all address fields');
      return;
    }

    try {
      const res = await addAddress({
        fullName,
        phoneNumber,
        houseBuilding,
        street,
        city,
        state,
        pincode,
        addressType,
        isDefault: addresses.length === 0,
      }).unwrap();

      toast.success('Address saved!');
      setSelectedAddressId(res.address._id);
      setIsAddingNewAddress(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select or add a delivery address');
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    try {
      const orderRes = await createOrder({
        addressId: selectedAddressId,
        paymentMethod: 'COD',
      }).unwrap();

      toast.success('Order placed successfully! 🎉');
      navigate(`/order-confirmation/${orderRes.order._id}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to place order');
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 py-8 space-y-8 max-w-6xl mx-auto">
      {/* Checkout Steps Header */}
      <div className="pb-4 border-b theme-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)]">Secure Checkout</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">EasyBuy 100% Purchase Protection</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-primary)]">
          <ShieldCheck size={18} />
          <span>Encrypted 256-bit SSL</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Address Selection & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Select Delivery Address */}
          <div className="p-6 rounded-3xl theme-surface border theme-border space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[var(--accent-primary)] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base font-bold text-[var(--text-main)]">Select Delivery Address</h2>
              </div>
              {!isAddingNewAddress && (
                <button
                  onClick={() => setIsAddingNewAddress(true)}
                  className="text-xs font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add new address
                </button>
              )}
            </div>

            {/* Address List */}
            {!isAddingNewAddress && (
              <div className="space-y-3">
                {addresses.length > 0 ? (
                  addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr._id;
                    return (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[var(--accent-primary)] bg-[var(--bg-secondary)] shadow-sm'
                            : 'theme-border hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[var(--text-main)]">{addr.fullName}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 dark:bg-gray-800 text-[var(--text-secondary)]">
                              {addr.addressType}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-bold text-[var(--accent-primary)]">
                                Default
                              </span>
                            )}
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]' : 'border-gray-400'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                        </div>

                        <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                          {addr.houseBuilding}, {addr.street}, {addr.locality ? `${addr.locality}, ` : ''}{addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">Phone: {addr.phoneNumber}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-[var(--text-secondary)]">No saved address found. Please add a delivery address below.</p>
                )}
              </div>
            )}

            {/* Add Address Form */}
            {isAddingNewAddress && (
              <form onSubmit={handleAddNewAddress} className="p-4 rounded-2xl bg-[var(--bg-secondary)] space-y-3 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-sm text-[var(--text-main)]">Add a New Address</h3>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="text-xs text-[var(--text-secondary)] hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Phone Number (10 digits)</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. 9830112233"
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1">Flat, House no., Building, Apartment</label>
                  <input
                    type="text"
                    required
                    value={houseBuilding}
                    onChange={(e) => setHouseBuilding(e.target.value)}
                    placeholder="e.g. Flat 402, Green View Residency"
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Area, Street, Sector, Village</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. GT Road East, Ushagram"
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium mb-1">City / Town</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Asansol"
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. West Bengal"
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">PIN Code (6 digits)</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 713301"
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAddingAddress}
                  className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-bold hover:opacity-90"
                >
                  {isAddingAddress ? 'Saving Address...' : 'Save and Use This Address'}
                </button>
              </form>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="p-6 rounded-3xl bg-[var(--bg-main)] border border-[var(--border-light)] space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] text-xs font-semibold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-base font-semibold text-[var(--text-main)]">Payment Method</h2>
              </div>
              <span className="text-[11px] font-medium px-3 py-0.5 rounded-full bg-[var(--accent-surface)] text-[var(--accent-primary)]">
                Cash on Delivery Only
              </span>
            </div>

            <div className="space-y-3">
              {/* Cash On Delivery option */}
              <div className="flex items-start gap-4 p-4 rounded-2xl border border-[var(--accent-primary)] bg-[var(--bg-secondary)] shadow-sm">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-sm text-[var(--text-main)]">
                    <Banknote size={16} className="text-[var(--accent-primary)]" />
                    <span>Cash on Delivery (COD)</span>
                    <span className="text-[10px] bg-[var(--accent-primary)] text-white px-2 py-0.5 rounded-full font-medium">
                      Selected
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Pay with cash or UPI directly to the courier partner upon arrival at your doorstep. No advance payment required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Total (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-28">
          <div className="p-6 rounded-3xl bg-[var(--bg-main)] border border-[var(--border-light)] shadow-sm space-y-4">
            <h3 className="font-semibold text-base text-[var(--text-main)]">Review Items ({cart?.totalItems})</h3>

            {/* Items mini list */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart?.items.map((item) => (
                <div key={item._id} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.product.thumbnail || item.product.images[0]}
                    alt={item.product.title}
                    className="w-12 h-12 rounded-xl object-contain bg-[var(--bg-secondary)] p-1.5 border border-[var(--border-light)] shrink-0"
                  />
                  <div className="flex-1 truncate">
                    <p className="font-medium text-[var(--text-main)] truncate">{item.product.title}</p>
                    <p className="text-[10px] text-[var(--text-secondary)]">
                      Qty: {item.quantity} • SKU: {item.sku || 'N/A'}
                    </p>
                  </div>
                  <span className="font-semibold text-[var(--text-main)]">
                    ₹{item.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing details */}
            <div className="pt-3 border-t border-[var(--border-light)] space-y-2 text-xs">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Items Subtotal:</span>
                <span>₹{(cart?.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>

              {cart && cart.discount > 0 && (
                <div className="flex justify-between text-[var(--accent-primary)] font-medium">
                  <span>Coupon Discount:</span>
                  <span>-₹{cart.discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Delivery Charge:</span>
                <span>
                  {cart?.deliveryFee === 0 ? (
                    <strong className="text-[var(--accent-primary)] font-medium">FREE</strong>
                  ) : (
                    `₹${cart?.deliveryFee}`
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-[var(--border-light)] flex justify-between text-base font-semibold text-[var(--text-main)]">
                <span>Total Amount:</span>
                <span className="text-xl font-bold tracking-tight text-[var(--accent-primary)]">
                  ₹{(cart?.grandTotal || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || !selectedAddressId}
              className="w-full py-3.5 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] hover:opacity-90 active:scale-95 disabled:opacity-40 font-medium text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPlacingOrder ? (
                <span>Placing Order...</span>
              ) : (
                <>
                  <PackageCheck size={16} />
                  <span>Place COD Order (₹{(cart?.grandTotal || 0).toLocaleString('en-IN')})</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-[var(--text-secondary)] text-center leading-relaxed">
              By confirming your order, you agree to EasyBuy's Terms of Sale and verified Cash on Delivery fulfillment policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
