"use client";

import { useMemo, useState } from "react";
import { DemoAppShell } from "./DemoAppShell";
import { DemoItemCard } from "./DemoItemCard";
import { demoCategories, demoItems } from "@/lib/demo-data";
import type { DemoCategory } from "@/lib/demo-data";

export function ItemsDemo() {
  const [category, setCategory] = useState<"전체" | DemoCategory>("전체");
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    return demoItems.filter((item) => {
      if (item.status === "ARCHIVED") return false;
      const categoryMatch = category === "전체" || item.category === category;
      const normalizedQuery = query.trim().toLowerCase();
      const searchableText = `${item.name} ${item.memo}`.toLowerCase();
      const queryMatch = searchableText.includes(normalizedQuery);
      return categoryMatch && queryMatch;
    });
  }, [category, query]);

  const groupedItems = demoCategories
    .filter((group): group is DemoCategory => group !== "전체")
    .map((group) => ({
      category: group,
      items: filteredItems.filter((item) => item.category === group),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <DemoAppShell activeRoute="items" title="전체관리">
      <section className="space-y-5">
        <div className="-mx-5 overflow-x-auto px-5">
          <div className="flex min-w-max gap-2">
            {demoCategories.map((item) => {
              const isActive = category === item;
              return (
                <button
                  className={[
                    "focus-ring min-h-11 rounded-full px-4 text-[14px] font-semibold",
                    isActive
                      ? "bg-[var(--primary-strong)] text-white"
                      : "border border-[var(--line)] bg-white text-[var(--foreground)]",
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
            className="focus-ring min-h-13 w-full rounded-[18px] border border-[var(--line)] bg-white px-4 text-[15px] shadow-[var(--shadow-card)]"
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
                  <h2 className="text-[18px] font-semibold">{group.category}</h2>
                  <span className="text-[13px] text-[var(--muted)]">
                    {group.items.length}개
                  </span>
                </div>
                {group.items.map((item) => (
                  <DemoItemCard compact item={item} key={item.id} />
                ))}
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-[18px] border border-[var(--line)] bg-white p-6 text-center shadow-[var(--shadow-card)]">
            <h2 className="text-[18px] font-semibold">검색 결과가 없어요.</h2>
            <p className="mt-2 text-[14px] leading-6 text-[var(--muted)]">
              다른 단어로 관리 항목을 찾아보세요.
            </p>
          </div>
        )}
      </section>
    </DemoAppShell>
  );
}
