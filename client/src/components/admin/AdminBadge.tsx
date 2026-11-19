import React from 'react';

type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'purple';

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const AdminBadge: React.FC<AdminBadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = true,
  className = '',
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string; border: string }> = {
    success: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-400',
      dot: 'bg-emerald-500',
      border: 'border-emerald-500/20',
    },
    warning: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-700 dark:text-amber-400',
      dot: 'bg-amber-500',
      border: 'border-amber-500/20',
    },
    danger: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      text: 'text-rose-700 dark:text-rose-400',
      dot: 'bg-rose-500',
      border: 'border-rose-500/20',
    },
    info: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/15',
      text: 'text-blue-700 dark:text-blue-400',
      dot: 'bg-blue-500',
      border: 'border-blue-500/20',
    },
    purple: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/15',
      text: 'text-purple-700 dark:text-purple-400',
      dot: 'bg-purple-500',
      border: 'border-purple-500/20',
    },
    neutral: {
      bg: 'bg-neutral-500/10 dark:bg-neutral-500/15',
      text: 'text-neutral-700 dark:text-neutral-300',
      dot: 'bg-neutral-400',
      border: 'border-neutral-500/20',
    },
  };

  const style = variantStyles[variant];
  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-0.5 text-[11px] font-semibold'
      : 'px-3 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses} tracking-tight select-none ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />}
      <span>{children}</span>
    </span>
  );
};

export const getStatusBadgeVariant = (status: string): BadgeVariant => {
  const s = status.toLowerCase();
  if (['delivered', 'paid', 'available', 'active', 'approved', 'in stock'].includes(s)) return 'success';
  if (['pending', 'processing', 'packed', 'low stock', 'warning', 'cod pending'].includes(s)) return 'warning';
  if (['cancelled', 'failed', 'out of stock', 'rejected', 'archived', 'deleted'].includes(s)) return 'danger';
  if (['shipped', 'out for delivery', 'confirmed'].includes(s)) return 'info';
  if (['return requested', 'returned', 'refunded'].includes(s)) return 'purple';
  return 'neutral';
};
