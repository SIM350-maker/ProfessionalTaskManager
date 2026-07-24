import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/helpers";

const variants = {
  primary: "bg-accent-blue text-text-inverse hover:bg-accent-blue-hover active:bg-accent-blue-hover focus-visible:ring-accent-blue shadow-sm",
  secondary: "bg-bg-hover text-text-primary hover:bg-border-default active:bg-border-hover focus-visible:ring-accent-blue",
  destructive: "bg-accent-red text-text-inverse hover:bg-accent-red-hover active:bg-accent-red/60 focus-visible:ring-accent-red shadow-sm",
  outline: "border border-border-default bg-transparent text-text-primary hover:bg-bg-hover active:bg-border-default focus-visible:ring-accent-blue",
  ghost: "bg-transparent text-text-secondary hover:bg-bg-hover active:bg-border-default focus-visible:ring-accent-blue",
  link: "bg-transparent text-text-link hover:underline active:opacity-80 focus-visible:ring-accent-blue",
};

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-base gap-2.5 rounded-lg",
  icon: "h-9 w-9 rounded-lg p-0",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean | string;
  icon?: ReactNode;
  iconRight?: ReactNode;
  shortcut?: string;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, icon, iconRight, shortcut, fullWidth, ...props }, ref) => {
    const isLoading = loading !== undefined && loading !== false;
    const loadingText = typeof loading === "string" ? loading : undefined;

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className={cn("animate-spin", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
            {loadingText && <span>{loadingText}</span>}
          </>
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
            {iconRight && <span className="shrink-0">{iconRight}</span>}
            {shortcut && (
              <kbd className="ml-auto hidden rounded-md border border-border-default bg-bg-subtle px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary lg:inline-block">
                {shortcut}
              </kbd>
            )}
          </>
        )}
      </button>
    );
  },
);
Button.displayName = "Button";