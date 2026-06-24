import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  // Neutral-dark base + cream text = strong contrast, premium feel.
  primary:
    "bg-charcoal text-cream hover:bg-ink active:scale-[0.98] shadow-[0_8px_24px_rgba(32,26,22,0.18)]",
  secondary:
    "border border-brown/40 text-brown bg-transparent hover:bg-brown/5 active:scale-[0.98]",
  ghost: "text-brown hover:bg-brown/5 active:scale-[0.98]",
  dark: "bg-rattan text-charcoal hover:bg-rattan-deep active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  full?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  full = false,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${sizes[size]} ${full ? "w-full" : ""} ${className}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "available" | "out" | "accent";
}) {
  const tones = {
    neutral: "bg-sand text-brown",
    available: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    out: "bg-red-50 text-red-600 border border-red-200",
    accent: "bg-rattan/15 text-rattan-deep",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-sand/70 ${className}`}
      aria-hidden="true"
    />
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted">
      <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-line bg-white/60 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sand text-brown">
        {icon}
      </div>
      <h3 className="text-2xl text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

const fieldBase =
  "w-full rounded-input border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-rattan focus:outline-none focus:ring-2 focus:ring-rattan/30 transition";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...rest }, ref) {
    return <input ref={ref} className={`${fieldBase} ${className}`} {...rest} />;
  }
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = "", ...rest }, ref) {
  return (
    <textarea ref={ref} className={`${fieldBase} min-h-[96px] ${className}`} {...rest} />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className = "", children, ...rest }, ref) {
  return (
    <select ref={ref} className={`${fieldBase} ${className}`} {...rest}>
      {children}
    </select>
  );
});

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-rattan-deep"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
