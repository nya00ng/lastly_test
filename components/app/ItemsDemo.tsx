"use client";

import { useMemo, useState } from "react";
import { DemoAppShell } from "./DemoAppShell";
import { DemoItemCard } from "./DemoItemCard";
import { demoCategories } from "@/lib/demo-data";
import type { DemoCategory } from "@/lib/demo-data";
import { useDemoActivityStore } from "./DemoActivityProvider";

export function ItemsDemo() {
  const { items } = useDemoActivityStore();
  const [category, setCategory] = useState<"전체" | DemoCategory>("전체");
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (item.status === "ARCHIVED") return false;
      const categoryMatch = category === "전체" || item.category === category;
      const normalizedQuery = query.trim().toLowerCase();
      const searchableText = `${item.name} ${item.tags.join(" ")} ${item.note ?? ""}`.toLowerCase();
      const queryMatch = searchableText.includes(normalizedQuery);
      return categoryMatch && queryMatch;
    });
  }, [category, items, query]);

  const groupedItems = demoCategories
    .filter((group): group is DemoCategory => group !== "전체")
    .map((group) => ({
      category: group,
      items: filteredItems.filter((item) => item.category === group),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <DemoAppShell activeRoute="items" showBack title="전체관리">
      <section className="space-y-5">
        <div className="-mx-5 overflow-x-auto px-5 pb-1">
          <div className="flex min-w-max gap-2">
            {demoCategories.map((item) => {
              const isActive = category === item;
              return (
                <button
                  className={[
                    "focus-ring min-h-11 rounded-lg px-4 text-[13px] font-medium",
                    isActive
                      ? "border border-[var(--primary)] bg-[var(--soft-primary)] font-semibold text-[var(--primary)]"
                      : "border border-transparent text-[var(--muted)] hover:bg-[var(--soft-primary)]",
                  ].join(" ")}
                  key={item}
                  onClick={() => setCategory(item)}
                  type="button"
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block text-[14px] font-semibold text-[var(--foreground)]">
          <input
            aria-label="관리 항목 검색"
            className="focus-ring min-h-12 w-full rounded-xl border border-[var(--line)] bg-white px-4 text-[14px]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="관리 항목을 검색하세요."
            value={query}
          />
        </label>

        {groupedItems.length > 0 ? (
          <div className="space-y-5">
            {groupedItems.map((group) => (
              <section className="space-y-3" key={group.category}>
                <div className="flex items-center justify-between">
                  <h2 className="text-[17px] font-semibold">{group.category}</h2>
                  <span className="text-[13px] text-[var(--muted)]">
                    {group.items.length}개
                  </span>
                </div>
                {group.items.map((item) => (
                  <DemoItemCard compact href={`/items/${item.id}`} item={item} key={item.id} />
                ))}
              </section>
            ))}
          </div>
        ) : (
          <div className="border-y border-[var(--divider)] py-8 text-center">
            <h2 className="text-[17px] font-semibold">검색 결과가 없어요.</h2>
            <p className="mt-2 text-[14px] leading-6 text-[var(--muted)]">
              다른 단어로 관리 항목을 찾아보세요.
            </p>
          </div>
        )}
      </section>
    </DemoAppShell>
  );
}
