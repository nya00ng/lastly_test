import Link from "next/link";
import type { DemoItem } from "@/lib/demo-data";
import { statusCopy, statusTone } from "@/lib/demo-data";
import { CategoryIcon } from "./AppIcons";

type DemoItemCardProps = {
  item: DemoItem;
  href?: string;
  compact?: boolean;
};

export function DemoItemCard({ item, href, compact = false }: DemoItemCardProps) {
  const content = (
    <>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--mint)] text-[var(--primary)]">
          <CategoryIcon category={item.category} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 text-[16px] font-semibold leading-6 text-[var(--foreground)]">
              {item.name}
            </h3>
            <span
              className={[
                "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                statusTone[item.status],
              ].join(" ")}
            >
              {statusCopy[item.status]}
            </span>
          </div>
          <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">
            {item.lastLabel}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-[13px]">
        <span className="rounded-full bg-[#f2f4ef] px-3 py-1.5 font-medium text-[var(--foreground)]">
          {item.category}
        </span>
        <span className="text-right font-semibold text-[var(--foreground)]">
          {item.dueLabel}
        </span>
      </div>
      {!compact ? (
        <p className="mt-3 text-[13px] leading-5 text-[var(--muted)]">{item.detail}</p>
      ) : null}
    </>
  );

  const className =
    "focus-ring block rounded-[20px] bg-white p-4 shadow-[var(--shadow-card)]";

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
