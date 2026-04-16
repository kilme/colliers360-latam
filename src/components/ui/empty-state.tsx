import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-xl border border-dashed border-gray-300", className)}>
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">📭</span>
      </div>
      <p className="font-medium text-gray-700">{title}</p>
      {description && <p className="text-sm text-gray-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
