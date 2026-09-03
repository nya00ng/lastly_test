"use client";

import Link from "next/link";
import type { RouteKey } from "@/lib/types";
import { HomeIcon, ListIcon, PlusPenIcon, SettingsIcon } from "./AppIcons";

type DemoAppShellProps = {
  activeRoute: RouteKey;
  title?: string;
  children: React.ReactNode;
};

const navItems = [
  { key: "home", label: "홈", href: "/", icon: HomeIcon },
  { key: "record", label: "기록하기", href: "/record", icon: PlusPenIcon },
  { key: "items", label: "전체관리", href: "/items", icon: ListIcon },
] as const;

export function DemoAppShell({ activeRoute, title = "LASTLY", children }: DemoAppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-[var(--background)] shadow-[var(--shadow-soft)]">
      <header className="sticky top-0 z-20 bg-[rgba(247,248,245,0.92)] px-5 pb-3 pt-4 backdrop-blur">
        <div className="flex min-h-11 items-center justify-between gap-3">
          <Link className="focus-ring flex min-h-11 items-center rounded-full" href="/">
            <span className="block text-[22px] font-semibold tracking-normal text-[var(--foreground)]">
              {title}
            </span>
          </Link>
          <Link
            aria-label="설정"
            className="focus-ring flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--foreground)] shadow-[var(--shadow-card)]"
            href="/settings"
          >
            <SettingsIcon className="h-5 w-5" />
          </Link>
        </div>
      </header>
      <main className="flex-1 px-5 pb-[calc(132px+var(--safe-bottom))] pt-3">
        {children}
      </main>
      <nav
        aria-label="주요 화면"
        className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(10px+var(--safe-bottom))]"
      >
        <div className="mx-auto grid max-w-[480px] grid-cols-3 items-end gap-2 rounded-[26px] bg-white/95 px-3 py-2 shadow-[0_12px_40px_rgba(38,60,45,0.18)] backdrop-blur">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeRoute;
            const isRecord = item.key === "record";

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={[
                  "focus-ring flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-semibold",
                  isRecord ? "-mt-5 min-h-16" : "",
                  isActive
                    ? "text-[var(--primary-strong)]"
                    : "text-[var(--muted)]",
                ].join(" ")}
                href={item.href}
                key={item.key}
              >
                <span
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    isRecord ? "h-12 w-12 shadow-[var(--shadow-card)]" : "",
                    isActive
                      ? "bg-[var(--primary)] text-white"
                      : isRecord
                        ? "bg-[var(--mint)] text-[var(--primary)]"
                        : "bg-transparent",
                  ].join(" ")}
                >
                  <Icon className={isRecord ? "h-6 w-6" : "h-5 w-5"} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
