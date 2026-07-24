import { cn } from "@/lib/helpers";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "table-row" | "avatar" | "chart" | "kpi";
}

export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  const variants = {
    text: "h-4 w-full",
    card: "h-32 w-full rounded-xl",
    "table-row": "h-14 w-full rounded-lg",
    avatar: "h-10 w-10 rounded-full",
    chart: "h-48 w-full rounded-xl",
    kpi: "h-24 w-full rounded-xl",
  };

  return <div className={cn("skeleton", variants[variant], className)} />;
}

export function SkeletonList({ count = 3, variant = "text" }: { count?: number; variant?: SkeletonProps["variant"] }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
