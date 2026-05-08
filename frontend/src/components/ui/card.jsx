import { cn } from '@/lib/utils';

export function Card({ className, children }) {
  return <div className={cn('card-glass rounded-3xl p-5', className)}>{children}</div>;
}

export function CardHeader({ className, children }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ className, children }) {
  return <h3 className={cn('text-base font-extrabold text-slate-900', className)}>{children}</h3>;
}

export function CardDescription({ className, children }) {
  return <p className={cn('mt-1 text-sm text-slate-500', className)}>{children}</p>;
}

export function CardContent({ className, children }) {
  return <div className={cn('', className)}>{children}</div>;
}
