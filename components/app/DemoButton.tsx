import Link from "next/link";

type DemoButtonProps = {
  "aria-label"?: string;
  children: React.ReactNode;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  tone?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit";
};

const toneClass = {
  primary: "bg-[var(--primary)] text-white hover:bg-[#286d5a] active:bg-[#245f4f]",
  secondary: "border border-[var(--line)] bg-white text-[var(--foreground)] hover:bg-[var(--soft-primary)] active:bg-[#e7f0ea]",
  ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--soft-primary)]",
};

export function DemoButton({
  "aria-label": ariaLabel,
  children,
  disabled = false,
  href,
  onClick,
  tone = "secondary",
  type = "button",
}: DemoButtonProps) {
  const className = [
    "focus-ring flex min-h-12 w-full items-center justify-center rounded-xl px-4 text-center text-[14px] font-semibold transition-colors",
    disabled ? "cursor-not-allowed border border-[#e1e5e2] bg-[#ecefeb] text-[#68756f]" : toneClass[tone],
  ].join(" ");

  if (href && !disabled) {
    return (
      <Link aria-label={ariaLabel} className={className} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button aria-label={ariaLabel} className={className} disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  );
}
