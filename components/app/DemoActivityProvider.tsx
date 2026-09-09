"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { getCurrentLocalDate } from "@/lib/ai/date";
import { demoItems, type DemoCategory, type DemoItem } from "@/lib/demo-data";
import { calculateLifecycle, type Cycle, validateCycle } from "@/lib/cycle";

export type DemoActivityDraft = {
  action: string;
  category: DemoCategory;
  itemName: string;
  performedDate: string;
  selectedTags: string[];
};

export type DemoItemMetadataDraft = {
  itemId: string;
  name: string;
  tags: string[];
  note: string;
};

type DemoActivityStore = {
  items: DemoItem[];
  addActivities: (drafts: DemoActivityDraft[]) => boolean;
  deleteItem: (itemId: string) => void;
  updateItemMetadata: (draft: DemoItemMetadataDraft) => { ok: boolean; message?: string };
  updateItemCycle: (itemId: string, cycle: Cycle) => { ok: boolean; message?: string };
};

const DemoActivityContext = createContext<DemoActivityStore | null>(null);

function comparableDate(value: string) {
  return value.replaceAll(".", "-");
}

function normalizeTags(tags: string[]) {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
}

function deriveTrackedItem(item: DemoItem, performedDate: string | null, today: string, historyCount = item.history.length): DemoItem {
  const derived = calculateLifecycle({ cycle: item.cycle, historyCount, lastPerformedDate: performedDate, today });
  return {
    ...item,
    dDayLabel: derived.dDayLabel,
    dueLabel: derived.dueLabel,
    lastPerformedDateLabel: performedDate ?? "기록 없음",
    nextDueDate: derived.nextDueDate,
    nextDueDateLabel: derived.nextDueDate ?? (derived.status === "NO_HISTORY" ? "기록 후 계산" : "주기 없음"),
    status: derived.status,
  };
}

export function DemoActivityProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<DemoItem[]>(() => {
    const today = getCurrentLocalDate();
    return structuredClone(demoItems).map((item) => {
      const latestDate = item.history[0]?.dateLabel.replaceAll(".", "-") ?? null;
      return deriveTrackedItem(item, latestDate, today);
    });
  });

  const addActivities = useCallback((drafts: DemoActivityDraft[]) => {
    const today = getCurrentLocalDate();
    const normalizedDrafts = drafts.map((draft) => ({
      ...draft,
      action: draft.action.trim(),
      itemName: draft.itemName.trim(),
      selectedTags: normalizeTags(draft.selectedTags),
    }));
    const valid =
      normalizedDrafts.length > 0 &&
      normalizedDrafts.length <= 5 &&
      normalizedDrafts.every(
        (draft) =>
          draft.action.length > 0 &&
          draft.itemName.length > 0 &&
          /^\d{4}-\d{2}-\d{2}$/.test(draft.performedDate) &&
          draft.performedDate <= today &&
          draft.selectedTags.length <= 10 &&
          draft.selectedTags.every((tag) => tag.length <= 30),
      );

    if (!valid) return false;
    const prospectiveTags = new Map(items.map((item) => [item.name, [...item.tags]]));
    const metadataValid = normalizedDrafts.every((draft) => {
      const nextTags = normalizeTags([...(prospectiveTags.get(draft.itemName) ?? []), ...draft.selectedTags]);
      prospectiveTags.set(draft.itemName, nextTags);
      return nextTags.length <= 10;
    });
    if (!metadataValid) return false;

    setItems((currentItems) => {
      let nextItems = currentItems.map((item) => ({ ...item, history: [...item.history], tags: [...item.tags] }));

      for (const draft of normalizedDrafts) {
        const itemIndex = nextItems.findIndex((item) => item.name === draft.itemName);
        const historyEntry = {
          actionLabel: draft.action.trim(),
          dateLabel: draft.performedDate,
          id: `demo-${crypto.randomUUID()}`,
        };

        if (itemIndex >= 0) {
          const currentItem = nextItems[itemIndex];
          const updated = deriveTrackedItem(currentItem, draft.performedDate, today, currentItem.history.length + 1);
          nextItems[itemIndex] = {
            ...updated,
            history: [historyEntry, ...currentItem.history].sort((left, right) =>
              comparableDate(right.dateLabel).localeCompare(comparableDate(left.dateLabel)),
            ),
            tags: normalizeTags([...currentItem.tags, ...draft.selectedTags]),
          };
          continue;
        }

        nextItems = [
          ...nextItems,
          {
            category: draft.category,
            cycle: null,
            dDayLabel: "주기 없음",
            detail: "현재 데모에서 새로 기록한 항목이에요.",
            dueLabel: "관리주기가 없어요",
            history: [historyEntry],
            id: `demo-item-${crypto.randomUUID()}`,
            lastPerformedDateLabel: draft.performedDate,
            name: draft.itemName.trim(),
            note: null,
            nextDueDate: null,
            nextDueDateLabel: "주기 없음",
            recentLabel: "방금",
            status: "NO_CYCLE",
            tags: draft.selectedTags,
          },
        ];
      }

      return nextItems;
    });

    return true;
  }, [items]);

  const updateItemMetadata = useCallback((draft: DemoItemMetadataDraft) => {
    const name = draft.name.trim();
    const tags = normalizeTags(draft.tags);
    const note = draft.note.trim() || null;
    if (!name) return { message: "항목 이름을 입력해주세요.", ok: false };
    if (tags.length > 10) return { message: "태그는 최대 10개까지 추가할 수 있어요.", ok: false };
    if (tags.some((tag) => tag.length > 30)) return { message: "태그는 30자 이하로 입력해주세요.", ok: false };
    if (note && note.length > 500) return { message: "메모는 500자 이하로 입력해주세요.", ok: false };

    setItems((currentItems) => currentItems.map((item) => item.id === draft.itemId
      ? { ...item, name, note, tags }
      : item));
    return { ok: true };
  }, []);

  const deleteItem = useCallback((itemId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
  }, []);

  const updateItemCycle = useCallback((itemId: string, cycle: Cycle) => {
    const validation = validateCycle(cycle);
    if (!validation.valid) return { ok: false, message: validation.message };
    const today = getCurrentLocalDate();
    setItems((currentItems) => currentItems.map((item) => {
      if (item.id !== itemId) return item;
      const latestDate = item.history[0]?.dateLabel.replaceAll(".", "-") ?? null;
      return deriveTrackedItem({ ...item, cycle }, latestDate, today);
    }));
    return { ok: true };
  }, []);

  const value = useMemo(
    () => ({ addActivities, deleteItem, items, updateItemCycle, updateItemMetadata }),
    [addActivities, deleteItem, items, updateItemCycle, updateItemMetadata],
  );
  return <DemoActivityContext.Provider value={value}>{children}</DemoActivityContext.Provider>;
}

export function useDemoActivityStore() {
  const store = useContext(DemoActivityContext);
  if (!store) throw new Error("DemoActivityProvider is required");
  return store;
}
