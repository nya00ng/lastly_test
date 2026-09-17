import { matchDemoItems } from "../ai/demo-matching";
import { demoItems } from "../demo-data";
import { parseRuleV21 } from "./engine-v21";
import type { SafeDiagnostic } from "./engine-v2";
import type { Analyzer } from "./engine";
import { comparisonKey, contextualAction } from "./context-v21";
export { comparisonKey } from "./context-v21";

const labelCache = new WeakMap<Analyzer, Map<string, SafeDiagnostic>>();
function labelDiagnostic(label: string, analyze: Analyzer) {
  let cache = labelCache.get(analyze);
  if (!cache) { cache = new Map(); labelCache.set(analyze, cache); }
  const existing = cache.get(label);
  if (existing) return existing;
  const parsed = parseRuleV21(`${label} 했어`, analyze, "2026-09-17").diagnostics[0];
  if (cache.size >= 256) cache.clear();
  cache.set(label, parsed);
  return parsed;
}

export function contextualMatches(d: SafeDiagnostic, analyze: Analyzer, items = demoItems) {
  const blocked = d.confidence !== "HIGH" || !d.canonical_action || !d.target || !d.lemma_candidate;
  const context = contextualAction(d.target, d.lemma_candidate || "");
  const surface = blocked ? null : context.contextual ? `${d.target} ${context.semantic}` : d.canonical_action;
  // Tags can identify the target, but must never bypass action compatibility.
  const compatible = blocked ? [] : items.filter(item => item.status !== "ARCHIVED" &&
    [item.name, ...item.history.map(h => h.actionLabel)].some(label => {
      const p = labelDiagnostic(label, analyze);
      return p?.confidence === "HIGH" && p.lemma_candidate &&
        (comparisonKey(p.target) === comparisonKey(d.target) || item.tags.some(tag => comparisonKey(tag) === comparisonKey(d.target))) &&
        contextualAction(p.target, p.lemma_candidate).semantic === context.semantic;
    }));
  const exact = compatible.filter(item => surface && comparisonKey(item.name) === comparisonKey(surface));
  const ranked = surface ? matchDemoItems(surface, compatible, [d.target]) : [];
  const highTier = ranked.filter(c => /^(EXACT_NAME|EXACT_ALIAS|EXACT_TAG|NOTE)$/.test(c.matchType));
  const candidates = exact.length ? exact.map(item => ({ itemId: item.id, name: item.name, matchType: "EXACT_NAME" as const }))
    : highTier.length ? highTier : compatible.map(item => ({ itemId: item.id, name: item.name, matchType: "CONTEXT_SEMANTIC" as const }));
  return { matchingSurface: surface, context, candidates,
    confidence: candidates.length > 1 ? "AMBIGUOUS" : candidates.length === 0 ? "NONE" : "HIGH",
    needsUserSelection: candidates.length > 0, selectedItemId: null, autoMatch: false, blockedByConfidence: blocked };
}
