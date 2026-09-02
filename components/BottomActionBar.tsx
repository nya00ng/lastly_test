export function BottomActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-[calc(76px+var(--safe-bottom))] z-10 mt-5 grid gap-2 rounded-md border border-[var(--line)] bg-white/95 p-2 backdrop-blur">
      {children}
    </div>
  );
}
