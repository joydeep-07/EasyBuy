import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  MapPin,
  Lock,
  Package,
  Plus,
  Trash2,
  Check,
  Star,
  Bell,
  LogOut,
  Edit2,
  Shield,
} from 'lucide-react';
import { useGetMeQuery, useUpdateProfileMutation, useChangePasswordMutation, useLogoutMutation } from '../../redux/api/authApi';
import { useGetAddressesQuery, useDeleteAddressMutation, useSetDefaultAddressMutation, useAddAddressMutation } from '../../redux/api/addressApi';
import { useGetMyOrdersQuery } from '../../redux/api/orderApi';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logoutSuccess } from '../../redux/slices/authSlice';
import { toast } from 'sonner';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'security'>('profile');

  // Queries
  const { data: meData, refetch: refetchMe } = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const { data: addressData } = useGetAddressesQuery(undefined, { skip: !isAuthenticated });
  const { data: ordersData } = useGetMyOrdersQuery(undefined, { skip: !isAuthenticated });

  // Mutations
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [setDefaultAddress] = useSetDefaultAddressMutation();
  const [addAddress, { isLoading: isAddingAddress }] = useAddAddressMutation();
  const [logoutUser] = useLogoutMutation();

  // Profile Edit form state
  const [firstName, setFirstName] = useState(authUser?.firstName || '');
  const [lastName, setLastName] = useState(authUser?.lastName || '');
  const [phone, setPhone] = useState(authUser?.phone || '');

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Add Address Modal state
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrHouse, setAddrHouse] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPin, setAddrPin] = useState('');
  const [addrType, setAddrType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ firstName, lastName, phone }).unwrap();
      toast.success('Profile details updated!');
      refetchMe();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to change password');
    }
  };

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAddress({
        fullName: addrName,
        phoneNumber: addrPhone,
        houseBuilding: addrHouse,
        street: addrStreet,
        city: addrCity,
        state: addrState,
        pincode: addrPin,
        addressType: addrType,
      }).unwrap();
      toast.success('Address added!');
      setIsAddAddressOpen(false);
      setAddrName('');
      setAddrPhone('');
      setAddrHouse('');
      setAddrStreet('');
      setAddrCity('');
      setAddrState('');
      setAddrPin('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to add address');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(logoutSuccess());
      toast.success('Logged out');
      navigate('/');
    } catch (e) {
      toast.error('Logout error');
    }
  };

  const ordersCount = ordersData?.orders?.length || 0;
  const addresses = addressData?.addresses || [];

  return (
    <div className="w-full px-4 sm:px-6 py-8 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b theme-border">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-[var(--accent-primary)] font-black text-xl flex items-center justify-center uppercase border theme-border">
            {authUser?.firstName?.[0] || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-main)]">
              {authUser?.firstName} {authUser?.lastName}
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">{authUser?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/orders"
          className="p-5 rounded-3xl theme-surface border theme-border hover:border-[var(--accent-primary)] shadow-sm transition-all flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-[var(--accent-primary)]">
            <Package size={24} />
          </div>
          <div>
            <span className="text-xs text-[var(--text-secondary)]">Your Orders</span>
            <h3 className="text-lg font-bold text-[var(--text-main)]">{ordersCount} orders placed</h3>
          </div>
        </Link>

        <div
          onClick={() => setActiveTab('addresses')}
          className="p-5 rounded-3xl theme-surface border theme-border hover:border-[var(--accent-primary)] shadow-sm transition-all cursor-pointer flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
            <MapPin size={24} />
          </div>
          <div>
            <span className="text-xs text-[var(--text-secondary)]">Saved Addresses</span>
            <h3 className="text-lg font-bold text-[var(--text-main)]">{addresses.length} locations</h3>
          </div>
        </div>

        <Link
          to="/wishlist"
          className="p-5 rounded-3xl theme-surface border theme-border hover:border-[var(--accent-primary)] shadow-sm transition-all flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
            <Star size={24} />
          </div>
          <div>
            <span className="text-xs text-[var(--text-secondary)]">Saved in Wishlist</span>
            <h3 className="text-lg font-bold text-[var(--text-main)]">View saved products</h3>
          </div>
        </Link>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex gap-2 border-b theme-border text-xs font-semibold pb-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'profile'
              ? 'bg-[var(--accent-primary)] text-white'
              : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
          }`}
        >
          Personal Info
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'addresses'
              ? 'bg-[var(--accent-primary)] text-white'
              : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
          }`}
        >
          Delivery Addresses ({addresses.length})
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'security'
              ? 'bg-[var(--accent-primary)] text-white'
              : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
          }`}
        >
          Login & Security
        </button>
      </div>

      {/* Tab 1: Profile Details */}
      {activeTab === 'profile' && (
        <div className="p-6 sm:p-8 rounded-3xl theme-surface border theme-border shadow-sm max-w-xl space-y-4">
          <h3 className="font-bold text-base text-[var(--text-main)]">Edit Profile</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-card focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-card focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={authUser?.email || ''}
                className="w-full px-3 py-2 rounded-xl border theme-border bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9830112233"
                className="w-full px-3 py-2 rounded-xl border theme-border theme-card focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-bold hover:opacity-90 disabled:opacity-50"
            >
              {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Addresses Management */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-[var(--text-main)]">Your Addresses</h3>
            <button
              onClick={() => setIsAddAddressOpen(true)}
              className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Address
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className={`p-5 rounded-3xl theme-surface border space-y-3 flex flex-col justify-between ${
                  addr.isDefault ? 'border-[var(--accent-primary)] shadow-sm' : 'theme-border'
                }`}
              >
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--text-main)]">{addr.fullName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 dark:bg-gray-800">
                      {addr.addressType}
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {addr.houseBuilding}, {addr.street}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                  </p>
                  <p className="text-[var(--text-secondary)]">Phone: {addr.phoneNumber}</p>
                </div>

                <div className="pt-2 border-t theme-border flex items-center justify-between text-xs">
                  {!addr.isDefault ? (
                    <button
                      onClick={() => setDefaultAddress(addr._id)}
                      className="text-[var(--accent-primary)] font-semibold hover:underline"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check size={12} /> Default Address
                    </span>
                  )}

                  <button
                    onClick={() => deleteAddress(addr._id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10"
                    title="Delete Address"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Address Modal */}
          {isAddAddressOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="relative w-full max-w-lg p-6 rounded-3xl theme-surface border theme-border shadow-2xl space-y-4">
                <h3 className="font-bold text-base text-[var(--text-main)]">Add Delivery Address</h3>
                <form onSubmit={handleAddAddressSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Phone Number</label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Building / House</label>
                    <input
                      type="text"
                      required
                      value={addrHouse}
                      onChange={(e) => setAddrHouse(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Street / Area</label>
                    <input
                      type="text"
                      required
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border theme-border theme-card"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">PIN Code</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={addrPin}
                        onChange={(e) => setAddrPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 rounded-xl border theme-border theme-card font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddAddressOpen(false)}
                      className="flex-1 py-2 rounded-xl border theme-border"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isAddingAddress}
                      className="flex-1 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-bold"
                    >
                      {isAddingAddress ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Security & Password */}
      {activeTab === 'security' && (
        <div className="p-6 sm:p-8 rounded-3xl theme-surface border theme-border shadow-sm max-w-xl space-y-4">
          <h3 className="font-bold text-base text-[var(--text-main)] flex items-center gap-2">
            <Lock size={18} className="text-[var(--accent-primary)]" />
            <span>Change Account Password</span>
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border theme-border theme-card focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">New Password (at least 6 characters)</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border theme-border theme-card focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border theme-border theme-card focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-bold hover:opacity-90 disabled:opacity-50"
            >
              {isChangingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
