"use client";

import Link from "next/link";
import { useState } from "react";

export type FixtureStateVariant = {
  id: string;
  label: string;
  title: string;
  description: string;
  details?: string[];
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

type FixtureStateTabsProps = {
  title: string;
  variants: FixtureStateVariant[];
};

export function FixtureStateTabs({ title, variants }: FixtureStateTabsProps) {
  const [activeId, setActiveId] = useState(variants[0]?.id ?? "");
  const active = variants.find((variant) => variant.id === activeId) ?? variants[0];

  if (!active) return null;

  return (
    <section
      aria-label={`개발용 상태 확인: ${title}`}
      className="rounded-md border border-dashed border-[var(--line)] bg-white/80 p-4"
    >
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--primary)]">
        Dev Fixture States
      </p>
      <h2 className="mt-1 text-sm font-bold text-[var(--foreground)]">{title}</h2>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {variants.map((variant) => {
          const isActive = variant.id === active.id;

          return (
            <button
              aria-pressed={isActive}
              className={[
                "focus-ring min-h-11 min-w-11 shrink-0 rounded-md border px-3 text-sm font-bold",
                isActive
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--line)] bg-white text-[var(--foreground)]",
              ].join(" ")}
              key={variant.id}
              onClick={() => setActiveId(variant.id)}
              type="button"
            >
              {variant.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4 rounded-md border border-[var(--line)] bg-[var(--background)] p-3">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--primary)]">
          {active.id}
        </p>
        <h3 className="mt-1 text-base font-bold">{active.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {active.description}
        </p>
        {active.details?.length ? (
          <ul className="mt-3 grid gap-2 text-sm leading-6">
            {active.details.map((detail) => (
              <li className="rounded-md bg-white px-3 py-2" key={detail}>
                {detail}
              </li>
            ))}
          </ul>
        ) : null}
        {active.primaryHref || active.secondaryHref ? (
          <div className="mt-3 grid gap-2">
            {active.primaryHref && active.primaryLabel ? (
              <Link
                className="focus-ring flex min-h-11 items-center justify-center rounded-md bg-[var(--primary)] px-3 text-sm font-bold text-white"
                href={active.primaryHref}
              >
                {active.primaryLabel}
              </Link>
            ) : null}
            {active.secondaryHref && active.secondaryLabel ? (
              <Link
                className="focus-ring flex min-h-11 items-center justify-center rounded-md border border-[var(--line)] bg-white px-3 text-sm font-bold"
                href={active.secondaryHref}
              >
                {active.secondaryLabel}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
