import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag, Lock, Mail, User as UserIcon, ShieldCheck } from 'lucide-react';
import { useRegisterMutation } from '../../redux/api/authApi';
import { useAppDispatch } from '../../redux/hooks';
import { setUser } from '../../redux/slices/authSlice';
import { toast } from 'sonner';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [registerUser, { isLoading }] = useRegisterMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const res = await registerUser({
        firstName,
        lastName,
        email,
        password,
      }).unwrap();

      dispatch(setUser(res.user));
      toast.success('Account created successfully! Welcome to EasyBuy 🎉');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-3xl theme-surface border theme-border shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-md">
              <ShoppingBag size={22} />
            </div>
            <span className="text-2xl font-black text-[var(--text-main)]">
              Easy<span className="text-[var(--accent-primary)]">Buy</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-[var(--text-main)]">Create Account</h2>
          <p className="text-xs text-[var(--text-secondary)]">Join thousands enjoying fast, verified shopping</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[var(--text-main)] mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Aarav"
                className="w-full px-3.5 py-3 rounded-xl border theme-border theme-card focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-[var(--text-main)] mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sharma"
                className="w-full px-3.5 py-3 rounded-xl border theme-border theme-card focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-main)] mb-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 text-gray-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@example.com"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border theme-border theme-card focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-main)] mb-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 text-gray-400" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-3 rounded-xl border theme-border theme-card focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-gray-400 hover:text-[var(--text-main)]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-main)] mb-1">Re-enter Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 text-gray-400" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border theme-border theme-card focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-[var(--accent-primary)] hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[var(--text-secondary)] border-t theme-border">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--accent-primary)] font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
