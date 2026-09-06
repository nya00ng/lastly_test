"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { RouteKey } from "@/lib/types";
import { BellIcon, ChevronIcon, HomeIcon, ListIcon, PlusPenIcon, SettingsIcon } from "./AppIcons";

type DemoAppShellProps = {
  activeRoute: RouteKey;
  title?: string;
  backHref?: string;
  showBack?: boolean;
  children: React.ReactNode;
};

const navItems = [
  { key: "home", label: "홈", href: "/", icon: HomeIcon },
  { key: "record", label: "기록하기", href: "/record", icon: PlusPenIcon },
  { key: "items", label: "전체관리", href: "/items", icon: ListIcon },
] as const;

export function DemoAppShell({
  activeRoute,
  title = "LASTLY",
  backHref = "/",
  showBack,
  children,
}: DemoAppShellProps) {
  const router = useRouter();
  const shouldShowBack = showBack ?? activeRoute === "record";

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(backHref);
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-[var(--background)]">
      <header className="sticky top-0 z-20 border-b border-[var(--divider)] bg-[rgba(245,250,248,0.94)] px-5 pb-3 pt-4 backdrop-blur">
        <div className="flex min-h-11 items-center justify-between gap-3">
          {shouldShowBack ? (
            <button className="focus-ring flex min-h-11 items-center gap-1 rounded-full" onClick={goBack} type="button">
              <ChevronIcon className="h-5 w-5 rotate-180 text-[var(--icon-line)]" />
              <span className="block text-[22px] font-semibold tracking-normal text-[var(--foreground)]">
                {title}
              </span>
            </button>
          ) : (
            <Link className="focus-ring flex min-h-11 items-center gap-1 rounded-full" href="/">
              <span className="block text-[22px] font-semibold tracking-normal text-[var(--foreground)]">
                {title}
              </span>
            </Link>
          )}
          <div className="flex items-center gap-2">
            <Link
              aria-label="알림"
              className="focus-ring flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--icon-line)]"
              href="/notification"
            >
              <BellIcon className="h-5 w-5" />
            </Link>
            <Link
              aria-label="설정"
              className="focus-ring flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--icon-line)]"
              href="/settings"
            >
              <SettingsIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 px-5 pb-[calc(132px+var(--safe-bottom))] pt-3">
        {children}
      </main>
      <nav
        aria-label="주요 화면"
        className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(10px+var(--safe-bottom))]"
      >
        <div className="mx-auto grid max-w-[480px] grid-cols-3 items-end gap-2 rounded-[24px] border border-[var(--line)] bg-white/96 px-3 py-2 shadow-[0_10px_26px_rgba(40,116,95,0.12)] backdrop-blur">
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
                      ? "bg-[var(--primary-strong)] text-white"
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
