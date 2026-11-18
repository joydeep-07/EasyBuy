import React from 'react';
import { Settings, Shield, Database, Key, Server, CheckCircle2 } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-main)]">System Architecture & Settings</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Platform configurations, database connectivity, and security parameters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Development Credentials */}
        <div className="p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-main)]">
            <Key size={18} className="text-[var(--accent-primary)]" />
            <span>Administrator Credentials</span>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            These demo credentials are created via the database seed script:
          </p>
          <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] space-y-1 font-mono">
            <p>Email: <strong className="text-[var(--text-main)]">admin@gmail.com</strong></p>
            <p>Password: <strong className="text-[var(--text-main)]">123456</strong></p>
            <p>Role: <strong className="text-emerald-500">ADMIN (Superuser)</strong></p>
          </div>
          <p className="text-[10px] text-amber-500 font-medium">
            ⚠️ In production, rotate secrets and update password immediately.
          </p>
        </div>

        {/* Database Configuration */}
        <div className="p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-main)]">
            <Database size={18} className="text-[var(--accent-primary)]" />
            <span>MongoDB Compass Connection</span>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Connect MongoDB Compass or mongosh directly:
          </p>
          <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] font-mono text-[11px] break-all">
            mongodb://127.0.0.1:27017/ecommerce_platform
          </div>
          <ul className="space-y-1 text-[11px] text-[var(--text-secondary)]">
            <li>• Database Name: <strong>ecommerce_platform</strong></li>
            <li>• Auto-indexed collections with text search & TTL</li>
            <li>• Compatible with standalone & replica set deployments</li>
          </ul>
        </div>
      </div>

      {/* Security Policies */}
      <div className="p-6 rounded-3xl theme-surface border theme-border shadow-sm space-y-3 text-xs">
        <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
          <Shield size={18} className="text-[var(--accent-primary)]" />
          <span>Security & Authentication Enforcement</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] space-y-1">
            <h4 className="font-bold text-[var(--text-main)]">HTTP-Only Cookies</h4>
            <p className="text-[var(--text-secondary)] text-[11px]">
              Tokens are never exposed to localStorage or browser script injections.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] space-y-1">
            <h4 className="font-bold text-[var(--text-main)]">bcrypt Password Hashing</h4>
            <p className="text-[var(--text-secondary)] text-[11px]">
              All user and admin passwords are salt-hashed prior to persistence.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] space-y-1">
            <h4 className="font-bold text-[var(--text-main)]">Atomic Stock Reservation</h4>
            <p className="text-[var(--text-secondary)] text-[11px]">
              Checkout reserves inventory on the backend preventing race condition overselling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
