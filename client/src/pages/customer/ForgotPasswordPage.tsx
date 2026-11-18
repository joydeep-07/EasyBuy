import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShoppingBag, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
    toast.success('Password assistance instructions sent!');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
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
          <h2 className="text-xl font-bold text-[var(--text-main)]">Password Assistance</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Enter the email address associated with your EasyBuy account
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
            <CheckCircle2 size={36} className="text-[var(--accent-primary)] mx-auto" />
            <h3 className="font-bold text-sm text-[var(--text-main)]">Check Your Inbox</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              We have dispatched password recovery instructions to <strong>{email}</strong>.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 px-5 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-bold text-xs"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[var(--accent-primary)] hover:opacity-90 text-white font-bold text-xs shadow-md transition-all"
            >
              Continue
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-xs">
          <Link
            to="/login"
            className="text-[var(--accent-primary)] font-bold hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft size={12} />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
