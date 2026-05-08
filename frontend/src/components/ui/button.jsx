import React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-brand-600 text-white hover:bg-brand-700 shadow-soft',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
};

export const Button = React.forwardRef(function Button(
  { className, variant = 'default', asChild = false, children, ...props },
  ref,
) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:pointer-events-none disabled:opacity-60',
    variants[variant],
    className,
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      className: cn(classes, children.props.className),
      ...props,
    });
  }

  return (
    <button
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
});
