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
      <section
        aria-label="개발용 Fixture metadata"
        className="mb-4 rounded-md border border-dashed border-[var(--line)] bg-white/70 px-4 py-3"
      >
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--primary)]">
          Dev Fixture · {screenId} Fixture Screen
        </p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      </section>
      {children}
    </AppShell>
  );
}
