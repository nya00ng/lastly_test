import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { screenDefinitions } from "@/lib/screens";

export default function ScreensIndexPage() {
  return (
    <AppShell activeRoute="home" title="Screen Fixtures">
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <h2 className="text-base font-bold">24 Screen ID</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          PHASE 1 / TASK 2 fixture 화면 목록입니다.
        </p>
      </section>
      <section className="mt-4 grid gap-2">
        {screenDefinitions.map((screen) => (
          <Link
            className="focus-ring flex min-h-12 items-center justify-between gap-3 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
            href={`/screens/${screen.id}`}
            key={screen.id}
          >
            <span className="font-bold">{screen.id}</span>
            <span className="text-right text-[var(--muted)]">
              {screen.title}
            </span>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
