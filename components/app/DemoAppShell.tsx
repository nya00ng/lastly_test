"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { RouteKey } from "@/lib/types";
import { BellIcon, ChevronIcon, SettingsIcon } from "./AppIcons";

type DemoAppShellProps = {
  activeRoute: RouteKey;
  title?: string;
  backHref?: string;
  showBack?: boolean;
  children: React.ReactNode;
};

export function DemoAppShell({
  activeRoute,
  title = "LASTLY",
  backHref = "/",
  showBack,
  children,
}: DemoAppShellProps) {
  const router = useRouter();
  const shouldShowBack = showBack ?? activeRoute !== "home";

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(backHref);
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-[var(--surface)] min-[500px]:border-x min-[500px]:border-[var(--line)]">
      <header className="sticky top-0 z-20 border-b border-[var(--divider)] bg-white/94 px-5 pb-3 pt-4 backdrop-blur">
        <div className="flex min-h-11 min-w-0 items-center justify-between gap-2">
          {shouldShowBack ? (
            <button aria-label={`뒤로가기: ${title}`} className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-left" onClick={goBack} type="button">
              <ChevronIcon className="h-5 w-5 shrink-0 rotate-180 text-[var(--icon-line)]" />
            </button>
          ) : null}
          <Link className="focus-ring mr-auto flex min-h-11 min-w-0 items-center rounded-full" href="/">
            <span className="block truncate text-[17px] font-bold tracking-normal text-[var(--foreground)]">LASTLY</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              aria-label="알림"
              className="focus-ring flex h-11 w-11 items-center justify-center rounded-full text-[var(--icon-line)] hover:bg-[var(--soft-primary)] active:bg-[var(--soft-primary)]"
              href="/notification"
            >
              <BellIcon className="h-5 w-5" />
            </Link>
            <Link
              aria-label="설정"
              className="focus-ring flex h-11 w-11 items-center justify-center rounded-full text-[var(--icon-line)] hover:bg-[var(--soft-primary)] active:bg-[var(--soft-primary)]"
              href="/settings"
            >
              <SettingsIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 px-5 pb-[calc(32px+var(--safe-bottom))] pt-4">
        {children}
      </main>
    </div>
  );
}
