"use client";

import Link from "next/link";
import { DemoAppShell } from "./DemoAppShell";
import { DemoItemCard } from "./DemoItemCard";
import { AlertIcon, CheckIcon, ChevronIcon, ClockIcon } from "./AppIcons";
import { dashboardDemoItems } from "@/lib/demo-data";
import type { LifecycleStatus } from "@/lib/types";

const summaryItems: Array<{ label: string; status: LifecycleStatus; icon: typeof AlertIcon; tone: string }> = [
  {
    label: "관리 필요",
    status: "DUE",
    icon: AlertIcon,
    tone: "bg-[var(--status-due-bg)] text-[#a95550]",
  },
  {
    label: "곧 관리",
    status: "UPCOMING",
    icon: ClockIcon,
    tone: "bg-[var(--status-upcoming-bg)] text-[#8a6619]",
  },
  {
    label: "괜찮아요",
    status: "NORMAL",
    icon: CheckIcon,
    tone: "bg-[var(--status-normal-bg)] text-[#31795f]",
  },
];

export function HomeDemo() {
  const priorityItems = dashboardDemoItems
    .filter((item) => item.status === "DUE" || item.status === "UPCOMING")
    .slice(0, 4);
  const recentItems = dashboardDemoItems
    .filter((item) => typeof item.recentMemoryOrder === "number")
    .sort((left, right) => (left.recentMemoryOrder ?? 0) - (right.recentMemoryOrder ?? 0));

  return (
    <DemoAppShell activeRoute="home">
      <section className="space-y-7">
        <div className="grid grid-cols-3 gap-2" aria-label="관리 상태 요약">
          {summaryItems.map((item) => {
            const Icon = item.icon;
            const count = dashboardDemoItems.filter((demoItem) => demoItem.status === item.status).length;

            return (
              <div
                aria-label={`${item.label} ${count}개`}
                className={[
                  "flex min-h-20 items-center justify-center gap-2 rounded-[18px] border border-[var(--line)]",
                  item.tone,
                ].join(" ")}
                key={item.status}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[22px] font-semibold">{count}</span>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[19px] font-semibold">지금 챙길 기억</h2>
            <span className="text-[13px] font-medium text-[var(--muted)]">
              {priorityItems.length}개
            </span>
          </div>
          {priorityItems.map((item) => (
            <DemoItemCard href={`/items/${item.id}`} item={item} key={item.id} />
          ))}
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[19px] font-semibold">최근 저장한 기억</h2>
            <span className="text-[13px] font-medium text-[var(--muted)]">최근순</span>
          </div>
          <div className="rounded-[18px] border border-[var(--line)] bg-white shadow-[var(--shadow-card)]">
            {recentItems.map((item, index) => (
              <Link
                className={[
                  "focus-ring flex min-h-16 items-center justify-between gap-3 px-4 py-4",
                  index > 0 ? "border-t border-[var(--divider)]" : "",
                ].join(" ")}
                href={`/items/${item.id}`}
                key={item.id}
              >
                <div className="min-w-0">
                  <h3 className="text-[16px] font-semibold leading-6">{item.name}</h3>
                  <p className="truncate text-[14px] text-[var(--muted)]">{item.memo}</p>
                </div>
                <span className="shrink-0 text-[14px] font-medium text-[var(--muted)]">
                  {item.recentLabel}
                </span>
                <ChevronIcon className="h-5 w-5 shrink-0 text-[var(--muted)]" />
              </Link>
            ))}
          </div>
        </section>
      </section>
    </DemoAppShell>
  );
}
