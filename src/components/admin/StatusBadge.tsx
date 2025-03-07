
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "active" | "banned" | "pending" | "approved" | string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
      case "active":
      case "approved":
      case "許可":
        return {
          icon: CheckCircle,
          className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          defaultLabel: status === "許可" ? "許可" : "アクティブ",
        };
      case "banned":
      case "blocked":
      case "バン済み":
        return {
          icon: XCircle,
          className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          defaultLabel: "バン済み",
        };
      case "pending":
      case "waiting":
        return {
          icon: AlertCircle,
          className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          defaultLabel: "保留中",
        };
      default:
        return {
          icon: AlertCircle,
          className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          defaultLabel: status,
        };
    }
  };

  const { icon: Icon, className: statusClassName, defaultLabel } = getStatusConfig();
  const displayLabel = label || defaultLabel;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusClassName,
        className
      )}
    >
      <Icon className="mr-1 h-3.5 w-3.5" />
      {displayLabel}
    </div>
  );
}
