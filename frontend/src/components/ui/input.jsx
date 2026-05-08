import React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100',
        className,
      )}
      {...props}
    />
  );
});
