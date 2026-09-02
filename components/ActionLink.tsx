import Link from "next/link";

type ActionLinkProps = {
  href: string;
  children: React.ReactNode;
  tone?: "primary" | "secondary" | "danger" | "disabled";
};

const toneClass = {
  primary: "bg-[var(--primary)] text-white border-[var(--primary)]",
  secondary: "bg-white text-[var(--foreground)] border-[var(--line)]",
  danger: "bg-white text-[var(--danger)] border-red-200",
  disabled:
    "pointer-events-none bg-slate-100 text-slate-500 border-slate-200",
};

export function ActionLink({
  href,
  children,
  tone = "secondary",
}: ActionLinkProps) {
  return (
    <Link
      className={`focus-ring flex min-h-12 items-center justify-center rounded-md border px-4 text-center text-sm font-bold ${toneClass[tone]}`}
      href={href}
    >
      {children}
    </Link>
  );
}
