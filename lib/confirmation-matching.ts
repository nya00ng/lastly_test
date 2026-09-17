import type { DemoItem } from "./demo-data";
import { matchDemoItems } from "./ai/demo-matching";
import { comparisonKey, contextualAction } from "./rule-parser/context-v21";
import type { ItemMatchingCandidate } from "./ai/types";

// Confirmation labels are edited names, not natural-language intent assertions.
// Reuse the existing contextual groups; do not infer intent or expand synonyms.
function signature(label: string) {
  const words = label.trim().split(/\s+/);
  const verb = words.pop() || "";
  const target = words.join(" ");
  const lemma = /^(세탁|교체|청소|점검|정리|결제|교환)$/.test(verb)
    ? `${verb}하다` : /[다기]$/.test(verb) ? verb.replace(/기$/, "다") : null;
  return target && lemma ? { target, semantic: contextualAction(target, lemma).semantic } : null;
}

export function confirmationCompatible(action: string, item: DemoItem) {
  if (item.status === "ARCHIVED") return false;
  const requested = signature(action);
  if (!requested) return comparisonKey(action) === comparisonKey(item.name);
  return [item.name, ...item.history.map(entry => entry.actionLabel)].some(label => {
    const candidate = signature(label);
    return candidate && candidate.semantic === requested.semantic &&
      (comparisonKey(candidate.target) === comparisonKey(requested.target) ||
        item.tags.some(tag => comparisonKey(tag) === comparisonKey(requested.target)));
  });
}

export function matchConfirmationAction(action: string, items: DemoItem[]): ItemMatchingCandidate[] {
  const compatible = items.filter(item => confirmationCompatible(action, item));
  const requested = signature(action);
  const ranked = matchDemoItems(action, compatible, requested ? [requested.target] : [])
    .filter(candidate => candidate.itemId && candidate.matchType !== "NONE");
  const strong = ranked.filter(candidate => candidate.matchType !== "DEMO_FUZZY");
  return strong.length ? strong : compatible.map(item => ({ itemId: item.id, name: item.name, matchType: "CONTEXT_SEMANTIC" }));
}
