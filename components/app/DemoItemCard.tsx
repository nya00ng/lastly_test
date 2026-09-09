import Link from "next/link";
import type { DemoItem } from "@/lib/demo-data";
import { statusCopy, statusTone } from "@/lib/demo-data";
import { formatCycle } from "@/lib/cycle";
import { CategoryIcon } from "./AppIcons";

type DemoItemCardProps = {
  item: DemoItem;
  href?: string;
  compact?: boolean;
};

export function DemoItemCard({ item, href, compact = false }: DemoItemCardProps) {
  const isCycleTracked = item.status === "DUE" || item.status === "UPCOMING" || item.status === "NORMAL";
  const tagSummary = item.tags.join(" · ");
  const content = (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--soft-primary)] text-[var(--icon-line)]">
        <CategoryIcon category={item.category} className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="min-w-0 text-[16px] font-semibold leading-6 text-[var(--foreground)]">
              {item.name}
            </h3>
            {tagSummary ? <p className="mt-0.5 truncate text-[13px] leading-5 text-[var(--muted)]">{tagSummary}</p> : null}
            {compact && item.status !== "NO_CYCLE" ? <p className="mt-1 text-[12px] text-[var(--muted)]">{formatCycle(item.cycle)}</p> : null}
          </div>
          <span
            className={[
              "shrink-0 text-[13px] font-semibold leading-5",
              isCycleTracked ? statusTone[item.status].replace(/bg-\[[^ ]+\]/, "") : "text-[var(--muted)]",
            ].join(" ")}
          >
            {item.dDayLabel}
          </span>
        </div>
        {!compact ? (
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--divider)] pt-3 text-[13px] text-[var(--muted)]">
            <span>{item.category}</span>
            <span>{formatCycle(item.cycle)}</span>
          </div>
        ) : null}
      </div>
    </div>
  );

  const className =
    "focus-ring block rounded-xl border border-[var(--line)] bg-white p-4 transition-colors hover:bg-[var(--soft-primary)] active:bg-[var(--soft-primary)]";

  if (!href) {
    return <article className={className}>{content}</article>;
  }

  return (
    <Link className={className} href={href}>
      {content}
    </Link>
  );
}

export function StatusPill({ status }: { status: DemoItem["status"] }) {
  return (
    <span
      className={[
        "rounded-full px-3 py-1.5 text-xs font-semibold",
        statusTone[status],
      ].join(" ")}
    >
      {statusCopy[status]}
    </span>
  );
}
