import Link from "next/link";
import type { ManagementFixture } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

type ManagementItemCardProps = {
  item: ManagementFixture;
  href?: string;
};

export function ManagementItemCard({ item, href }: ManagementItemCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold leading-6">{item.name}</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            마지막 수행: {item.lastPerformedLabel}
          </p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
        {item.nextDueLabel} · {item.cycleLabel}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        {item.detail}
      </p>
    </>
  );

  if (!href) {
    return (
      <article className="rounded-md border border-[var(--line)] bg-white p-4">
        {content}
      </article>
    );
  }

  return (
    <Link
      className="focus-ring block rounded-md border border-[var(--line)] bg-white p-4"
      href={href}
    >
      {content}
    </Link>
  );
}
