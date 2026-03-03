import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  active: "status-active",
  deleted: "status-deleted",
  inactive: "status-inactive",
  blocked: "status-blocked",
};

export function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || "unknown";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        statusStyles[s] || "bg-muted text-muted-foreground border-border"
      )}
    >
      {s}
    </span>
  );
}
