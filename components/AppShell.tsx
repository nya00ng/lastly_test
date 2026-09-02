import { BottomNavigation } from "./BottomNavigation";
import { Header } from "./Header";
import type { RouteKey } from "@/lib/types";

type AppShellProps = {
  activeRoute: RouteKey;
  title: string;
  children: React.ReactNode;
};

export function AppShell({ activeRoute, title, children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col bg-[var(--background)]">
      <Header title={title} />
      <main className="flex-1 px-5 pb-[calc(88px+var(--safe-bottom))] pt-4">
        {children}
      </main>
      <BottomNavigation activeRoute={activeRoute} />
    </div>
  );
}
