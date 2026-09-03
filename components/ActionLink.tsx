import Link from "next/link";

type ActionLinkProps = {
  href: string;
  children: React.ReactNode;
  disabled?: boolean;
  tone?: "primary" | "secondary" | "danger" | "disabled";
};

const toneClass = {
  primary: "bg-[var(--primary)] text-white border-[var(--primary)]",
  secondary: "bg-white text-[var(--foreground)] border-[var(--line)]",
  danger: "bg-white text-[var(--danger)] border-red-200",
  disabled: "bg-slate-100 text-slate-500 border-slate-200",
};

export function ActionLink({
  href,
  children,
  disabled = false,
  tone = "secondary",
}: ActionLinkProps) {
  const className = `focus-ring flex min-h-12 items-center justify-center rounded-md border px-4 text-center text-sm font-bold ${
    disabled ? toneClass.disabled : toneClass[tone]
  }`;

  if (disabled) {
    return (
      <button className={className} disabled type="button">
        {children}
      </button>
    );
  }

  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}
