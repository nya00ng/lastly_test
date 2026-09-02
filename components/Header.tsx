import Link from "next/link";

type HeaderProps = {
  title: string;
};

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[rgba(248,250,248,0.94)] px-5 pb-3 pt-4 backdrop-blur">
      <div className="flex min-h-11 items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">
            LASTLY
          </p>
          <h1 className="text-xl font-bold leading-tight text-[var(--foreground)]">
            {title}
          </h1>
        </div>
        <Link
          className="focus-ring flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white text-sm font-semibold text-[var(--foreground)]"
          href="/settings"
          aria-label="설정"
        >
          설정
        </Link>
      </div>
    </header>
  );
}
