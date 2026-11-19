import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full mt-24 border-t border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--text-main)] transition-colors">
      {/* 1. Value Propositions Banner - Apple Minimalist */}
      <div className="w-full border-b border-[var(--border-light)] py-12 px-6 sm:px-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-start gap-2.5">
            <Truck className="w-6 h-6 text-[var(--text-main)] stroke-[1.5]" />
            <h4 className="text-sm font-semibold tracking-tight text-[var(--text-main)]">Complimentary Delivery</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">Fast, carbon-neutral shipping on eligible orders above ₹499.</p>
          </div>

          <div className="flex flex-col items-start gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[var(--text-main)] stroke-[1.5]" />
            <h4 className="text-sm font-semibold tracking-tight text-[var(--text-main)]">Cash on Delivery</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">Pay with cash or UPI directly when your package arrives.</p>
          </div>

          <div className="flex flex-col items-start gap-2.5">
            <RotateCcw className="w-6 h-6 text-[var(--text-main)] stroke-[1.5]" />
            <h4 className="text-sm font-semibold tracking-tight text-[var(--text-main)]">Effortless Returns</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">Simple, 7-day hassle-free replacement on all verified items.</p>
          </div>

          <div className="flex flex-col items-start gap-2.5">
            <Headphones className="w-6 h-6 text-[var(--text-main)] stroke-[1.5]" />
            <h4 className="text-sm font-semibold tracking-tight text-[var(--text-main)]">Expert Support</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">Direct support specialists ready to help whenever you need.</p>
          </div>
        </div>
      </div>

      {/* 2. Apple Style Footnotes */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-8 pb-4 text-[11px] text-[var(--text-secondary)] leading-relaxed border-b border-[var(--border-light)] space-y-2">
        <p>
          * Free express delivery is applicable to all domestic orders exceeding ₹499 within verified Indian PIN code zones. Delivery timelines vary based on regional fulfillment centers.
        </p>
        <p>
          † Cash on Delivery (COD) is available as the primary payment method. Please keep exact cash or active UPI ready upon doorstep arrival of the delivery courier.
        </p>
      </div>

      {/* 3. Multi-Column Links - Apple Directory */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
        <div>
          <h4 className="font-semibold text-xs text-[var(--text-main)] mb-3 tracking-tight">Shop & Discover</h4>
          <ul className="space-y-2.5 text-[var(--text-secondary)]">
            <li><Link to="/products" className="hover:text-[var(--text-main)] transition-colors">All Products</Link></li>
            <li><Link to="/category/electronics" className="hover:text-[var(--text-main)] transition-colors">Electronics & Audio</Link></li>
            <li><Link to="/category/fashion" className="hover:text-[var(--text-main)] transition-colors">Fashion & Apparel</Link></li>
            <li><Link to="/category/home-kitchen" className="hover:text-[var(--text-main)] transition-colors">Home & Living</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-xs text-[var(--text-main)] mb-3 tracking-tight">Account & Orders</h4>
          <ul className="space-y-2.5 text-[var(--text-secondary)]">
            <li><Link to="/account" className="hover:text-[var(--text-main)] transition-colors">Manage Your Profile</Link></li>
            <li><Link to="/orders" className="hover:text-[var(--text-main)] transition-colors">Order History</Link></li>
            <li><Link to="/track-order" className="hover:text-[var(--text-main)] transition-colors">Track an Order</Link></li>
            <li><Link to="/wishlist" className="hover:text-[var(--text-main)] transition-colors">Saved Wishlist</Link></li>
            <li><Link to="/cart" className="hover:text-[var(--text-main)] transition-colors">Shopping Bag</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-xs text-[var(--text-main)] mb-3 tracking-tight">EasyBuy Store</h4>
          <ul className="space-y-2.5 text-[var(--text-secondary)]">
            <li><Link to="/about" className="hover:text-[var(--text-main)] transition-colors">About EasyBuy</Link></li>
            <li><Link to="/admin/login" className="hover:text-[var(--accent-primary)] text-[var(--accent-primary)] font-medium transition-colors">Admin Console</Link></li>
            <li><Link to="/shipping" className="hover:text-[var(--text-main)] transition-colors">Shipping & Delivery Rates</Link></li>
            <li><Link to="/help" className="hover:text-[var(--text-main)] transition-colors">Help & FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-xs text-[var(--text-main)] mb-3 tracking-tight">EasyBuy Values</h4>
          <ul className="space-y-2.5 text-[var(--text-secondary)]">
            <li><span className="text-[var(--text-secondary)]">Accessibility</span></li>
            <li><span className="text-[var(--text-secondary)]">Environment & Green Supply</span></li>
            <li><span className="text-[var(--text-secondary)]">Privacy & Security</span></li>
            <li><span className="text-[var(--text-secondary)]">Verified Sourcing</span></li>
          </ul>
        </div>
      </div>

      {/* 4. Bottom Legal & Copyright Bar */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-6 border-t border-[var(--border-light)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[var(--text-secondary)]">
        <div>
          Copyright © {new Date().getFullYear()} EasyBuy Inc. All rights reserved.
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link to="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy Policy</Link>
          <span className="text-[var(--border-light)]">|</span>
          <Link to="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms of Sale</Link>
          <span className="text-[var(--border-light)]">|</span>
          <Link to="/legal" className="hover:text-[var(--text-main)] transition-colors">Legal</Link>
          <span className="text-[var(--border-light)]">|</span>
          <button onClick={scrollToTop} className="flex items-center gap-1 hover:text-[var(--text-main)] transition-colors">
            <span>Back to top</span>
            <ArrowUp size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
};
