import Link from "next/link";
import type { RouteKey } from "@/lib/types";

const navItems: Array<{ key: RouteKey; label: string; href: string }> = [
  { key: "home", label: "홈", href: "/" },
  { key: "record", label: "기록하기", href: "/record" },
  { key: "items", label: "전체 관리", href: "/items" },
];

type BottomNavigationProps = {
  activeRoute: RouteKey;
};

export function BottomNavigation({ activeRoute }: BottomNavigationProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--line)] bg-white/95 px-4 pb-[calc(10px+var(--safe-bottom))] pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-[520px] grid-cols-3 gap-2">
        {navItems.map((item) => {
          const isActive = item.key === activeRoute;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={[
                "focus-ring flex min-h-12 items-center justify-center rounded-md px-2 text-sm font-semibold",
                isActive
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--muted)]",
              ].join(" ")}
              href={item.href}
              key={item.key}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
