import type { HTMLAttributes } from "react";
import { cn } from "@/lib/helpers";

type CardVariant = "default" | "elevated" | "flat" | "kpi";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  variant?: CardVariant;
  padding?: CardPadding;
}

const variantStyles: Record<CardVariant, string> = {
  default: "border border-border-default bg-bg-card shadow-card",
  elevated: "border border-border-default bg-bg-card shadow-dropdown",
  flat: "bg-bg-subtle",
  kpi: "border border-border-default bg-bg-card shadow-kpi",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function Card({ className, hover, variant = "default", padding = "md", children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl transition-all duration-[var(--duration-normal)]",
        variantStyles[variant],
        paddingStyles[padding],
        hover && "cursor-pointer hover:shadow-hover hover:-translate-y-0.5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("-mx-6 -mt-6 mb-4 border-b border-border-default px-6 py-4 flex items-center justify-between", className)} {...props}>
      {typeof children === "string" ? (
        <h3 className="text-base font-semibold text-text-primary">{children}</h3>
      ) : children}
    </div>
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4 -mx-6 -mb-6 border-t border-border-default px-6 py-4", className)} {...props} />;
}
