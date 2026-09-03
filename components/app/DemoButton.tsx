import Link from "next/link";

type DemoButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  tone?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit";
};

const toneClass = {
  primary: "bg-[var(--primary)] text-white shadow-[var(--shadow-card)]",
  secondary: "bg-white text-[var(--foreground)] shadow-[var(--shadow-card)]",
  ghost: "bg-transparent text-[var(--muted)]",
};

export function DemoButton({
  children,
  disabled = false,
  href,
  onClick,
  tone = "secondary",
  type = "button",
}: DemoButtonProps) {
  const className = [
    "focus-ring flex min-h-12 w-full items-center justify-center rounded-2xl px-4 text-center text-[15px] font-semibold transition",
    disabled ? "bg-[#e8ece6] text-[#8b958f]" : toneClass[tone],
  ].join(" ");

  if (href && !disabled) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={className} disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  );
}
