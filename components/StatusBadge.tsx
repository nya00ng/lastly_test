import { statusLabels } from "@/lib/fixtures";
import type { LifecycleStatus } from "@/lib/types";

const statusTone: Record<LifecycleStatus, string> = {
  NO_HISTORY: "border-slate-300 bg-slate-50 text-slate-700",
  NO_CYCLE: "border-zinc-300 bg-zinc-50 text-zinc-700",
  NORMAL: "border-emerald-200 bg-emerald-50 text-emerald-800",
  UPCOMING: "border-amber-200 bg-amber-50 text-amber-900",
  DUE: "border-red-200 bg-red-50 text-red-800",
  ARCHIVED: "border-slate-300 bg-slate-100 text-slate-700",
};

type StatusBadgeProps = {
  status: LifecycleStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex min-h-7 items-center gap-1 rounded-md border px-2.5 text-xs font-bold ${statusTone[status]}`}
    >
      <span aria-hidden="true">●</span>
      <span className="sr-only">상태: </span>
      {statusLabels[status]}
    </span>
  );
}
