import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, Sparkles, ShoppingBag } from 'lucide-react';
import { useAdminLoginMutation } from '../../redux/api/adminApi';
import { useAppDispatch } from '../../redux/hooks';
import { setAdmin } from '../../redux/slices/adminAuthSlice';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { toast } from 'sonner';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [adminLogin, { isLoading }] = useAdminLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter admin email and password');
      return;
    }

    try {
      const res = await adminLogin({ email, password }).unwrap();
      dispatch(setAdmin(res.admin));
      toast.success('Admin authentication verified! Welcome to Dashboard.');
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Administrative login rejected.');
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@gmail.com');
    setPassword('123456');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[var(--bg-main)] text-[var(--text-main)] transition-colors relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md p-8 rounded-3xl theme-surface border theme-border shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)] text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-950/30">
            <Shield size={24} />
          </div>
          <h1 className="text-2xl font-black text-[var(--text-main)]">
            Easy<span className="text-[var(--accent-primary)]">Buy</span> Administrative Portal
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Authorized personnel only. Secure role-based management environment.
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border theme-border flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-[var(--text-main)] block">Default Seed Admin</span>
            <span className="font-mono text-[11px] text-[var(--text-secondary)]">admin@gmail.com / 123456</span>
          </div>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-[var(--accent-primary)] font-bold hover:bg-emerald-500/25 transition-colors"
          >
            Auto Fill
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-[var(--text-main)]">Admin Email</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 text-gray-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border theme-border theme-card focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[var(--text-main)]">Secret Password</label>
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-[var(--accent-primary)] hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? 'Verifying Credentials...' : 'Authenticate & Enter Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};
