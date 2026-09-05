import Link from "next/link";
import type { DemoItem } from "@/lib/demo-data";
import { statusCopy, statusTone } from "@/lib/demo-data";
import { CategoryIcon, ChevronIcon } from "./AppIcons";

type DemoItemCardProps = {
  item: DemoItem;
  href?: string;
  compact?: boolean;
};

export function DemoItemCard({ item, href, compact = false }: DemoItemCardProps) {
  const isCycleTracked = item.status === "DUE" || item.status === "UPCOMING" || item.status === "NORMAL";
  const content = (
    <div className="flex items-center gap-3">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--line)] bg-white text-[var(--icon-line)]">
        <CategoryIcon category={item.category} className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="min-w-0 text-[17px] font-semibold leading-6 text-[var(--foreground)]">
              {item.name}
            </h3>
            <p className="mt-0.5 text-[14px] leading-5 text-[var(--muted)]">{item.memo}</p>
          </div>
          <span
            className={[
              "shrink-0 rounded-full px-3 py-1.5 text-[15px] font-semibold leading-5",
              isCycleTracked ? statusTone[item.status] : "bg-[#f4f7f5] text-[var(--muted)]",
            ].join(" ")}
          >
            {item.dDayLabel}
          </span>
        </div>
        {!compact ? (
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--divider)] pt-3 text-[13px] text-[var(--muted)]">
            <span>{item.category}</span>
            <span>{item.cycleLabel}</span>
          </div>
        ) : null}
      </div>
      {href ? (
        <span className="text-[var(--muted)]" aria-hidden="true">
          <ChevronIcon className="h-5 w-5" />
        </span>
      ) : null}
    </div>
  );

  const className =
    "focus-ring block rounded-[18px] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-card)]";

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
