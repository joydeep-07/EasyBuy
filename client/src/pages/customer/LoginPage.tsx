import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLoginMutation } from '../../redux/api/authApi';
import { useAppDispatch } from '../../redux/hooks';
import { setUser } from '../../redux/slices/authSlice';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setUser(res.user));
      toast.success(`Welcome back, ${res.user.firstName}! 👋`);
      navigate('/');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Login failed. Check your credentials.');
    }
  };

  const handleFillDemo = () => {
    setEmail('customer@gmail.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-3xl theme-surface border theme-border shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-md">
              <ShoppingBag size={22} />
            </div>
            <span className="text-2xl font-black text-[var(--text-main)]">
              Easy<span className="text-[var(--accent-primary)]">Buy</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-[var(--text-main)]">Sign In to Your Account</h2>
          <p className="text-xs text-[var(--text-secondary)]">Access your orders, wishlist, and recommendations</p>
        </div>

        {/* Demo Credentials Quick Fill */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border theme-border flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-[var(--text-main)]">Demo Customer</p>
            <p className="text-[11px] text-[var(--text-secondary)] font-mono">customer@gmail.com / password123</p>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-[var(--accent-primary)] font-bold hover:bg-emerald-500/20 transition-colors"
          >
            Auto Fill
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[var(--text-main)] mb-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 text-gray-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border theme-border theme-card focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-[var(--text-main)]">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-[var(--accent-primary)] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 text-gray-400" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
            />
            <label htmlFor="remember" className="text-[var(--text-secondary)] cursor-pointer select-none">
              Keep me signed in
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-[var(--accent-primary)] hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <span>Signing In...</span> : <span>Sign In</span>}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[var(--text-secondary)] border-t theme-border">
          <p>
            New to EasyBuy?{' '}
            <Link to="/register" className="text-[var(--accent-primary)] font-bold hover:underline">
              Create your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
