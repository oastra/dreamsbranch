import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-blue text-white hover:bg-brand-blue-dark active:bg-brand-blue-dark",
  secondary:
    "bg-brand-yellow text-text-primary hover:bg-brand-yellow-dark active:bg-brand-yellow-dark",
  outline:
    "border border-border bg-transparent text-text-primary hover:border-brand-blue hover:text-brand-blue",
  ghost:
    "bg-transparent text-text-primary hover:bg-surface-secondary hover:text-brand-blue",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-caption font-medium",
  md: "px-6 py-2.5 text-body font-medium",
  lg: "px-8 py-3 text-body font-medium",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      pill = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          pill ? "rounded-full" : "rounded-[60px]",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
