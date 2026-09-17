"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { getCurrentLocalDate } from "@/lib/ai/date";
import { demoItems, type DemoItem } from "@/lib/demo-data";
import { type Cycle, validateCycle } from "@/lib/cycle";
import { appendDemoActivities, deriveTrackedItem, normalizeTags, type DemoActivityDraft } from "@/lib/demo-activity";
export type { DemoActivityDraft } from "@/lib/demo-activity";

export type DemoItemMetadataDraft = { itemId: string; name: string; tags: string[]; note: string };
type DemoActivityStore = {
  items: DemoItem[];
  addActivities: (drafts: DemoActivityDraft[]) => boolean;
  deleteItem: (itemId: string) => void;
  updateItemMetadata: (draft: DemoItemMetadataDraft) => { ok: boolean; message?: string };
  updateItemCycle: (itemId: string, cycle: Cycle) => { ok: boolean; message?: string };
};
const DemoActivityContext = createContext<DemoActivityStore | null>(null);

export function DemoActivityProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<DemoItem[]>(() => structuredClone(demoItems)
    .map(item => deriveTrackedItem(item, getCurrentLocalDate())));
  // Validate and commit against the same snapshot, including batched mutations.
  const current = useRef(items);
  const commit = useCallback((next: DemoItem[]) => { current.current = next; setItems(next); }, []);

  const addActivities = useCallback((drafts: DemoActivityDraft[]) => {
    const next = appendDemoActivities(current.current, drafts, getCurrentLocalDate());
    if (!next) return false;
    commit(next);
    return true;
  }, [commit]);

  const updateItemMetadata = useCallback((draft: DemoItemMetadataDraft) => {
    const name = draft.name.trim();
    const tags = normalizeTags(draft.tags);
    const note = draft.note.trim() || null;
    if (!current.current.some(item => item.id === draft.itemId)) return { ok: false, message: "항목을 찾을 수 없어요." };
    if (!name) return { message: "항목 이름을 입력해주세요.", ok: false };
    if (tags.length > 10) return { message: "태그는 최대 10개까지 추가할 수 있어요.", ok: false };
    if (tags.some(tag => tag.length > 30)) return { message: "태그는 30자 이하로 입력해주세요.", ok: false };
    if (note && note.length > 500) return { message: "메모는 500자 이하로 입력해주세요.", ok: false };
    commit(current.current.map(item => item.id === draft.itemId ? { ...item, name, note, tags } : item));
    return { ok: true };
  }, [commit]);

  const deleteItem = useCallback((itemId: string) => {
    commit(current.current.filter(item => item.id !== itemId));
  }, [commit]);

  const updateItemCycle = useCallback((itemId: string, cycle: Cycle) => {
    const validation = validateCycle(cycle);
    if (!validation.valid) return { ok: false, message: validation.message };
    if (!current.current.some(item => item.id === itemId)) return { ok: false, message: "항목을 찾을 수 없어요." };
    commit(current.current.map(item => item.id === itemId
      ? deriveTrackedItem({ ...item, cycle }, getCurrentLocalDate()) : item));
    return { ok: true };
  }, [commit]);

  const value = useMemo(() => ({ addActivities, deleteItem, items, updateItemCycle, updateItemMetadata }),
    [addActivities, deleteItem, items, updateItemCycle, updateItemMetadata]);
  return <DemoActivityContext.Provider value={value}>{children}</DemoActivityContext.Provider>;
}

export function useDemoActivityStore() {
  const store = useContext(DemoActivityContext);
  if (!store) throw new Error("DemoActivityProvider is required");
  return store;
}
