import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
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
    toast.info('Seed credentials applied');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[var(--bg-main)] text-[var(--text-main)] transition-colors relative overflow-hidden">
      {/* Subtle Apple-style ambient background gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Bar with Brand & Theme Toggle */}
      <header className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm font-black text-sm tracking-tighter">
            EB
          </div>
          <span className="text-sm font-semibold tracking-tight text-[var(--text-main)]">
            EasyBuy <span className="text-xs font-normal text-[var(--text-secondary)]">Administration</span>
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-8 sm:p-10 rounded-3xl theme-surface border theme-border shadow-2xl relative z-10 backdrop-blur-xl"
      >
        {/* Header Badge & Title */}
        <div className="text-center space-y-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[var(--accent-primary)] mx-auto flex items-center justify-center shadow-inner">
            <Shield size={26} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Admin Portal
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs mx-auto">
              Sign in with administrative privileges to manage operations, inventory, and telemetry.
            </p>
          </div>
        </div>

        {/* Demo Credentials Quick-Fill Banner */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border theme-border flex items-center justify-between gap-3 text-xs mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--text-main)]">
              <Sparkles size={13} className="text-[var(--accent-primary)] shrink-0" />
              <span>Seed Credentials</span>
            </div>
            <p className="font-mono text-[11px] text-[var(--text-secondary)] truncate">
              admin@gmail.com • 123456
            </p>
          </div>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-semibold text-xs transition-colors flex items-center gap-1"
          >
            <span>Auto Fill</span>
          </button>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[var(--text-main)]">
              Administrative Email
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 text-[var(--text-secondary)] pointer-events-none" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border theme-border bg-[var(--bg-secondary)] focus:bg-[var(--bg-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-xs text-[var(--text-main)] placeholder-[var(--text-secondary)]/60 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[var(--text-main)]">
                Access Token / Password
              </label>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 text-[var(--text-secondary)] pointer-events-none" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl border theme-border bg-[var(--bg-secondary)] focus:bg-[var(--bg-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-xs text-[var(--text-main)] placeholder-[var(--text-secondary)]/60 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-[var(--accent-primary)] hover:brightness-105 active:scale-[0.99] disabled:opacity-50 text-white font-medium text-xs shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying Credentials...
              </span>
            ) : (
              <>
                <span>Authenticate & Access Dashboard</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Security badge at bottom */}
        <div className="mt-8 pt-6 border-t theme-border flex items-center justify-center gap-2 text-[11px] text-[var(--text-secondary)]">
          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
          <span>256-Bit SSL Encrypted Admin Session</span>
        </div>
      </motion.div>

      {/* Return to storefront link */}
      <div className="mt-8 relative z-10 text-center">
        <a
          href="/"
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors inline-flex items-center gap-1.5"
        >
          <span>← Back to EasyBuy Storefront</span>
        </a>
      </div>
    </div>
  );
};
