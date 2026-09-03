"use client";

import { useMemo, useState } from "react";
import { DemoAppShell } from "./DemoAppShell";
import { DemoButton } from "./DemoButton";
import { DemoItemCard } from "./DemoItemCard";
import { BellIcon } from "./AppIcons";
import { dashboardDemoItems } from "@/lib/demo-data";
import type { LifecycleStatus } from "@/lib/types";

const tabs: Array<{ label: string; status: LifecycleStatus }> = [
  { label: "관리 필요", status: "DUE" },
  { label: "곧 관리", status: "UPCOMING" },
  { label: "괜찮아요", status: "NORMAL" },
];

export function HomeDemo() {
  const [activeStatus, setActiveStatus] = useState<LifecycleStatus>("DUE");
  const visibleItems = useMemo(
    () => dashboardDemoItems.filter((item) => item.status === activeStatus),
    [activeStatus],
  );

  return (
    <DemoAppShell activeRoute="home">
      <section className="space-y-5">
        <div className="rounded-[28px] bg-white p-5 shadow-[var(--shadow-card)]">
          <p className="text-[14px] font-medium text-[var(--muted)]">안녕하세요</p>
          <h1 className="mt-1 text-[25px] font-semibold leading-8 tracking-normal">
            오늘 관리할 항목을 확인해보세요.
          </h1>
          <div className="mt-5 grid grid-cols-3 gap-2" role="tablist" aria-label="관리 상태">
            {tabs.map((tab) => {
              const count = dashboardDemoItems.filter((item) => item.status === tab.status).length;
              const isActive = activeStatus === tab.status;

              return (
                <button
                  aria-selected={isActive}
                  className={[
                    "focus-ring min-h-16 rounded-2xl px-2 text-center text-[12px] font-semibold",
                    isActive
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[#f2f4ef] text-[var(--foreground)]",
                  ].join(" ")}
                  key={tab.status}
                  onClick={() => setActiveStatus(tab.status)}
                  role="tab"
                  type="button"
                >
                  <span className="block text-[18px]">{count}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[19px] font-semibold">
              {tabs.find((tab) => tab.status === activeStatus)?.label}
            </h2>
            <span className="text-[13px] font-medium text-[var(--muted)]">
              {visibleItems.length}개
            </span>
          </div>
          {visibleItems.map((item) => (
            <DemoItemCard href="/items" item={item} key={item.id} />
          ))}
        </div>

        <section className="rounded-[24px] bg-[#203527] p-5 text-white shadow-[var(--shadow-card)]">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/14">
              <BellIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[13px] font-medium text-white/75">알림 데모</p>
              <h2 className="mt-1 text-[18px] font-semibold">이불 세탁할 때예요</h2>
              <p className="mt-2 text-[14px] leading-6 text-white/78">
                마지막 세탁 후 30일이 지나면 이런 흐름으로 앱 안에서 확인할 수 있어요.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <DemoButton href="/notification" tone="secondary">
              알림 화면 보기
            </DemoButton>
          </div>
        </section>
      </section>
    </DemoAppShell>
  );
}
