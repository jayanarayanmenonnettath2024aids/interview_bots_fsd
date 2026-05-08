import { cn } from '@/lib/utils';

export function Badge({ className, tone = 'default', children }) {
  const tones = {
    default: 'bg-brand-50 text-brand-700 border-brand-100',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  return (
    <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold', tones[tone], className)}>
      {children}
    </span>
  );
}
