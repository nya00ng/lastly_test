import Link from "next/link";
import type { ActivityFixture } from "@/lib/types";

type ActivityRowProps = {
  activity: ActivityFixture;
  editable?: boolean;
};

export function ActivityRow({ activity, editable = false }: ActivityRowProps) {
  const content = (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-bold">{activity.performedDate}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          {activity.itemName} · {activity.source}
        </p>
        <p className="mt-2 text-sm leading-6">{activity.memo}</p>
      </div>
      {editable ? (
        <span className="text-xs font-bold text-[var(--primary)]">수정</span>
      ) : null}
    </div>
  );

  if (!editable) {
    return (
      <article className="rounded-md border border-[var(--line)] bg-white p-4">
        {content}
      </article>
    );
  }

  return (
    <Link
      className="focus-ring block rounded-md border border-[var(--line)] bg-white p-4"
      href="/screens/S23"
    >
      {content}
    </Link>
  );
}
