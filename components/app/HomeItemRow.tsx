"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { DemoItem } from "@/lib/demo-data";

const dDayTone: Record<DemoItem["status"], string> = {
  ARCHIVED: "text-[var(--muted)]",
  NO_HISTORY: "text-[var(--muted)]",
  NO_CYCLE: "text-[var(--muted)]",
  NORMAL: "text-[#31795f]",
  UPCOMING: "text-[#8a6619]",
  DUE: "text-[#a95550]",
};

const LONG_PRESS_MS = 550;
const MOVE_TOLERANCE_PX = 10;

export function HomeItemRow({ item, onRequestDelete }: { item: DemoItem; onRequestDelete: (item: DemoItem) => void }) {
  const tagSummary = item.tags.join(" · ");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const originRef = useRef({ x: 0, y: 0 });
  const suppressClickRef = useRef(false);

  function cancelLongPress() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  useEffect(() => cancelLongPress, []);

  return (
    <Link
      aria-describedby={`delete-help-${item.id}`}
      aria-keyshortcuts="Delete Shift+F10"
      className="focus-ring block min-h-[68px] border-b border-[var(--divider)] py-3.5 transition-colors last:border-b-0 hover:bg-[var(--soft-primary)] active:bg-[var(--soft-primary)]"
      href={`/items/${item.id}`}
      onClick={(event) => {
        if (!suppressClickRef.current) return;
        event.preventDefault();
        suppressClickRef.current = false;
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        cancelLongPress();
        onRequestDelete(item);
      }}
      onKeyDown={(event) => {
        if (event.key === "Delete" || (event.shiftKey && event.key === "F10")) {
          event.preventDefault();
          onRequestDelete(item);
        }
      }}
      onPointerCancel={cancelLongPress}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        cancelLongPress();
        originRef.current = { x: event.clientX, y: event.clientY };
        timerRef.current = setTimeout(() => {
          suppressClickRef.current = true;
          timerRef.current = null;
          onRequestDelete(item);
        }, LONG_PRESS_MS);
      }}
      onPointerMove={(event) => {
        if (
          Math.abs(event.clientX - originRef.current.x) >= MOVE_TOLERANCE_PX ||
          Math.abs(event.clientY - originRef.current.y) >= MOVE_TOLERANCE_PX
        ) cancelLongPress();
      }}
      onPointerUp={cancelLongPress}
    >
      <span className="sr-only" id={`delete-help-${item.id}`}>길게 누르거나 Delete 키를 누르면 삭제 확인을 열 수 있어요.</span>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[16px] font-semibold leading-6 text-[var(--foreground)]">
            {item.name}
          </h3>
          {tagSummary ? <p className="truncate text-[13px] leading-5 text-[var(--muted)]">{tagSummary}</p> : null}
        </div>
        <span
          className={[
            "shrink-0 pt-0.5 text-[13px] font-semibold leading-6 tabular-nums",
            dDayTone[item.status],
          ].join(" ")}
        >
          {item.dDayLabel}
        </span>
      </div>
    </Link>
  );
}
