import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "blue" | "indigo" | "violet" | "green" | "amber";
  className?: string;
}

const COLORS = {
  blue:   { bg: "bg-blue-50",   icon: "bg-blue-600",   text: "text-blue-600" },
  indigo: { bg: "bg-indigo-50", icon: "bg-indigo-600", text: "text-indigo-600" },
  violet: { bg: "bg-violet-50", icon: "bg-violet-600", text: "text-violet-600" },
  green:  { bg: "bg-green-50",  icon: "bg-green-600",  text: "text-green-600" },
  amber:  { bg: "bg-amber-50",  icon: "bg-amber-600",  text: "text-amber-600" },
};

export function StatCard({ label, value, icon: Icon, trend, color = "blue", className }: StatCardProps) {
  const c = COLORS[color];
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 p-5", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", c.icon)}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {trend && (
        <p className={cn("mt-1 text-xs font-medium", trend.value >= 0 ? "text-green-600" : "text-red-600")}>
          {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </div>
  );
}
