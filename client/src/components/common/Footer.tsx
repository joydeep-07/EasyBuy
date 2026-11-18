import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ShoppingBag, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full mt-20 border-t theme-border bg-[var(--bg-secondary)]">
      {/* 1. Value Propositions Banner */}
      <div className="w-full theme-surface border-b theme-border py-8 px-4">
        <div className="max-w-[1920px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-[var(--accent-primary)]">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-main)]">Fast & Free Delivery</h4>
              <p className="text-xs text-[var(--text-secondary)]">On eligible orders over ₹499</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-[var(--accent-primary)]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-main)]">100% Secure Checkout</h4>
              <p className="text-xs text-[var(--text-secondary)]">Cash on Delivery Available</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-[var(--accent-primary)]">
              <RotateCcw size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-main)]">Easy 7-Day Returns</h4>
              <p className="text-xs text-[var(--text-secondary)]">Hassle-free replacement policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-[var(--accent-primary)]">
              <Headphones size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-main)]">24/7 Dedicated Support</h4>
              <p className="text-xs text-[var(--text-secondary)]">Verified merchant assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="w-full py-3.5 bg-emerald-900/10 hover:bg-emerald-900/20 text-[var(--text-main)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-b theme-border"
      >
        <ArrowUp size={14} />
        <span>Back to top</span>
      </button>

      {/* 3. Multi-Column Links */}
      <div className="max-w-[1920px] mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
        <div>
          <h4 className="font-bold text-sm text-[var(--text-main)] mb-3">Get to Know Us</h4>
          <ul className="space-y-2 text-[var(--text-secondary)]">
            <li><Link to="/about" className="hover:text-[var(--accent-primary)] transition-colors">About EasyBuy</Link></li>
            <li><Link to="/careers" className="hover:text-[var(--accent-primary)] transition-colors">Careers</Link></li>
            <li><Link to="/press" className="hover:text-[var(--accent-primary)] transition-colors">Press Releases</Link></li>
            <li><Link to="/science" className="hover:text-[var(--accent-primary)] transition-colors">EasyBuy Science</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm text-[var(--text-main)] mb-3">Connect with Us</h4>
          <ul className="space-y-2 text-[var(--text-secondary)]">
            <li><a href="#" className="hover:text-[var(--accent-primary)] transition-colors">Facebook</a></li>
            <li><a href="#" className="hover:text-[var(--accent-primary)] transition-colors">Twitter (X)</a></li>
            <li><a href="#" className="hover:text-[var(--accent-primary)] transition-colors">Instagram</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm text-[var(--text-main)] mb-3">Make Money with Us</h4>
          <ul className="space-y-2 text-[var(--text-secondary)]">
            <li><Link to="/admin/login" className="hover:text-[var(--accent-primary)] text-[var(--accent-primary)] font-semibold transition-colors">Admin & Merchant Portal</Link></li>
            <li><a href="#" className="hover:text-[var(--accent-primary)] transition-colors">Sell on EasyBuy</a></li>
            <li><a href="#" className="hover:text-[var(--accent-primary)] transition-colors">Become an Affiliate</a></li>
            <li><a href="#" className="hover:text-[var(--accent-primary)] transition-colors">Advertise Your Products</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm text-[var(--text-main)] mb-3">Let Us Help You</h4>
          <ul className="space-y-2 text-[var(--text-secondary)]">
            <li><Link to="/account" className="hover:text-[var(--accent-primary)] transition-colors">Your Account</Link></li>
            <li><Link to="/orders" className="hover:text-[var(--accent-primary)] transition-colors">Returns & Order Tracking</Link></li>
            <li><Link to="/shipping" className="hover:text-[var(--accent-primary)] transition-colors">Shipping Rates & Policies</Link></li>
            <li><Link to="/help" className="hover:text-[var(--accent-primary)] transition-colors">Help Center & FAQ</Link></li>
          </ul>
        </div>
      </div>

      {/* 4. Bottom Copyright & Branding */}
      <div className="border-t theme-border py-6 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center text-white">
            <ShoppingBag size={14} />
          </div>
          <span className="font-black text-[var(--text-main)]">
            Easy<span className="text-[var(--accent-primary)]">Buy</span>
          </span>
        </div>
        <p className="text-[11px] text-[var(--text-secondary)]">
          © {new Date().getFullYear()} EasyBuy Marketplace, Inc. or its affiliates. All rights reserved. Built with React TypeScript & Node.js.
        </p>
      </div>
    </footer>
  );
};
