import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "danger" | "info" | "neutral";

const VARIANTS: Record<Variant, string> = {
  default: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger:  "bg-red-100 text-red-700",
  info:    "bg-indigo-100 text-indigo-700",
  neutral: "bg-gray-100 text-gray-600",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", VARIANTS[variant], className)}>
      {children}
    </span>
  );
}
