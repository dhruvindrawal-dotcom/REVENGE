import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type HTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

function cx(...cls: Array<string | false | undefined>) {
  return cls.filter(Boolean).join(' ');
}

// ---- Button ----
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const variants: Record<string, string> = {
      primary: 'bg-[--color-indigo] text-[--color-paper] hover:bg-[--color-indigo-dim] focus-visible:outline-[--color-indigo]',
      secondary: 'bg-[--color-marigold] text-[--color-ink] hover:bg-[--color-marigold-dim]',
      outline: 'border border-[--color-ink]/25 text-[--color-ink] hover:bg-[--color-ink]/5',
      ghost: 'text-[--color-ink] hover:bg-[--color-ink]/5',
      danger: 'bg-[--color-madder] text-white hover:opacity-90',
    };
    const sizes: Record<string, string> = {
      sm: 'text-sm px-3 py-1.5 rounded-[--radius-sm]',
      md: 'text-sm px-4 py-2.5 rounded-[--radius-sm]',
      lg: 'text-base px-6 py-3.5 rounded-[--radius-md]',
    };
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cx(
          'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ---- Badge ----
export function Badge({ className, tone = 'neutral', children }: { className?: string; tone?: 'neutral' | 'verified' | 'pending' | 'danger' | 'marigold'; children: React.ReactNode }) {
  const tones: Record<string, string> = {
    neutral: 'bg-[--color-ink]/8 text-[--color-ink-soft]',
    verified: 'bg-[--color-paisley]/12 text-[--color-paisley]',
    pending: 'bg-[--color-marigold]/15 text-[--color-marigold]',
    danger: 'bg-[--color-madder]/12 text-[--color-madder]',
    marigold: 'bg-[--color-marigold] text-[--color-ink]',
  };
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', tones[tone], className)}>
      {children}
    </span>
  );
}

// ---- Input ----
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }>(
  ({ className, label, error, id, ...props }, ref) => (
    <label className="block w-full">
      {label && <span className="mb-1.5 block text-sm font-medium text-[--color-ink]">{label}</span>}
      <input
        ref={ref}
        id={id}
        className={cx(
          'w-full rounded-[--radius-sm] border border-[--color-ink]/20 bg-white px-3.5 py-2.5 text-sm text-[--color-ink] placeholder:text-[--color-ink]/40 focus:border-[--color-indigo] focus:outline-none focus:ring-2 focus:ring-[--color-indigo]/15',
          error && 'border-[--color-madder]',
          className
        )}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-[--color-madder]">{error}</span>}
    </label>
  )
);
Input.displayName = 'Input';

// ---- Textarea ----
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }>(
  ({ className, label, id, ...props }, ref) => (
    <label className="block w-full">
      {label && <span className="mb-1.5 block text-sm font-medium text-[--color-ink]">{label}</span>}
      <textarea
        ref={ref}
        id={id}
        className={cx(
          'w-full rounded-[--radius-sm] border border-[--color-ink]/20 bg-white px-3.5 py-2.5 text-sm text-[--color-ink] placeholder:text-[--color-ink]/40 focus:border-[--color-indigo] focus:outline-none focus:ring-2 focus:ring-[--color-indigo]/15',
          className
        )}
        {...props}
      />
    </label>
  )
);
Textarea.displayName = 'Textarea';

// ---- Select ----
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { label?: string }>(
  ({ className, label, id, children, ...props }, ref) => (
    <label className="block w-full">
      {label && <span className="mb-1.5 block text-sm font-medium text-[--color-ink]">{label}</span>}
      <select
        ref={ref}
        id={id}
        className={cx(
          'w-full rounded-[--radius-sm] border border-[--color-ink]/20 bg-white px-3.5 py-2.5 text-sm text-[--color-ink] focus:border-[--color-indigo] focus:outline-none focus:ring-2 focus:ring-[--color-indigo]/15',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  )
);
Select.displayName = 'Select';

// ---- Card ----
export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx('rounded-[--radius-lg] border border-[--color-line] bg-white/70', className)} {...props}>
      {children}
    </div>
  );
}

// ---- Skeleton ----
export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-[--radius-sm] bg-[--color-ink]/8', className)} />;
}
