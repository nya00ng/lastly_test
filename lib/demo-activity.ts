import { isIsoDate } from "./ai/date";
import { calculateLifecycle } from "./cycle";
import type { DemoCategory, DemoItem } from "./demo-data";
import { confirmationCompatible } from "./confirmation-matching";

export type DemoActivityDraft = {
  action: string;
  category: DemoCategory;
  itemId: string | null;
  performedDate: string;
  selectedTags: string[];
  datePrecision: "EXACT";
  dateResolutionSource: "EXPLICIT" | "IMPLICIT_TODAY";
};

export const normalizeTags = (tags: string[]) => Array.from(new Set(tags.map(tag => tag.trim()).filter(Boolean)));

export function deriveTrackedItem(item: DemoItem, today: string): DemoItem {
  const history = [...item.history].sort((a, b) =>
    b.dateLabel.replaceAll(".", "-").localeCompare(a.dateLabel.replaceAll(".", "-")) || a.id.localeCompare(b.id));
  const latest = history[0]?.dateLabel.replaceAll(".", "-") ?? null;
  const derived = calculateLifecycle({ archived: item.status === "ARCHIVED", cycle: item.cycle,
    historyCount: history.length, lastPerformedDate: latest, today });
  return { ...item, history, ...derived, lastPerformedDateLabel: latest ?? "기록 없음",
    nextDueDateLabel: derived.nextDueDate ?? (derived.status === "NO_HISTORY" ? "기록 후 계산" : "주기 없음") };
}

// Pure, atomic transaction. Re-check identity, dates and action compatibility at write time.
export function appendDemoActivities(items: DemoItem[], drafts: DemoActivityDraft[], today: string,
  createId: () => string = () => crypto.randomUUID()): DemoItem[] | null {
  if (!drafts.length || drafts.length > 5) return null;
  let next = items.map(item => ({ ...item, history: [...item.history], tags: [...item.tags] }));
  for (const draft of drafts) {
    const action = draft.action.trim();
    const tags = normalizeTags(draft.selectedTags);
    if (!action || !isIsoDate(draft.performedDate) || draft.performedDate > today || draft.datePrecision !== "EXACT" ||
      !["EXPLICIT", "IMPLICIT_TODAY"].includes(draft.dateResolutionSource) || tags.length > 10 || tags.some(tag => tag.length > 30)) return null;
    const index = draft.itemId === null ? -1 : next.findIndex(item => item.id === draft.itemId);
    if (draft.itemId !== null && (index < 0 || !confirmationCompatible(action, next[index]))) return null;
    const entry = { id: `demo-${createId()}`, dateLabel: draft.performedDate, actionLabel: action };
    if (index >= 0) {
      const combined = normalizeTags([...next[index].tags, ...tags]);
      if (combined.length > 10) return null;
      next[index] = deriveTrackedItem({ ...next[index], tags: combined, history: [...next[index].history, entry] }, today);
    } else {
      next = [...next, deriveTrackedItem({ id: `demo-item-${createId()}`, name: action, category: draft.category,
        cycle: null, status: "NO_CYCLE", tags, note: null, history: [entry], recentLabel: "방금",
        detail: "현재 데모에서 새로 기록한 항목이에요.", dDayLabel: "", dueLabel: "", lastPerformedDateLabel: "",
        nextDueDate: null, nextDueDateLabel: "" }, today)];
    }
  }
  return next;
}
