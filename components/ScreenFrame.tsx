import type { RouteKey, ScreenId } from "@/lib/types";
import { AppShell } from "./AppShell";

type ScreenFrameProps = {
  activeRoute: RouteKey;
  children: React.ReactNode;
  description: string;
  screenId: ScreenId;
  title: string;
};

export function ScreenFrame({
  activeRoute,
  children,
  description,
  screenId,
  title,
}: ScreenFrameProps) {
  return (
    <AppShell activeRoute={activeRoute} title={title}>
      <section className="mb-4 rounded-md border border-[var(--line)] bg-white px-4 py-3">
        <p className="text-xs font-bold text-[var(--primary)]">
          {screenId} Fixture Screen
        </p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      </section>
      {children}
    </AppShell>
  );
}
