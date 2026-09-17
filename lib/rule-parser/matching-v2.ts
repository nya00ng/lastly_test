import { matchDemoItems } from "../ai/demo-matching";
import { demoItems } from "../demo-data";
import { equivalence } from "./matching";
import { parseRuleV2, type SafeDiagnostic } from "./engine-v2";
import type { Analyzer } from "./engine";

export const comparisonKey = (value: string) => value.normalize("NFC").replace(/\s+/g, "").toLowerCase();
export function safeMatches(d: SafeDiagnostic, analyze: Analyzer, items = demoItems) {
  const blocked = d.confidence !== "HIGH" || !d.canonical_action || !d.target || !d.lemma_candidate;
  const semantic = d.lemma_candidate ? equivalence[d.lemma_candidate] || d.lemma_candidate : "";
  const surface = blocked ? null : equivalence[d.lemma_candidate!] ? `${d.target} ${semantic}` : d.canonical_action;
  const exactName = items.find(item => surface && comparisonKey(item.name) === comparisonKey(surface));
  const candidates = blocked ? [] : matchDemoItems(exactName?.name || surface, items).filter(candidate => {
    if (candidate.matchType === "NONE") return false;
    const item = items.find(value => value.name === candidate.name);
    if (!item || item.status === "ARCHIVED") return false;
    return [item.name, ...item.history.map(h => h.actionLabel)].some(label => {
      const parsed = parseRuleV2(`${label} 했어`, analyze, "2026-09-17").diagnostics[0];
      if (!parsed || parsed.confidence !== "HIGH" || !parsed.lemma_candidate) return false;
      return comparisonKey(parsed.target) === comparisonKey(d.target) &&
        (equivalence[parsed.lemma_candidate] || parsed.lemma_candidate) === semantic;
    });
  });
  return { matchingSurface: surface, candidates,
    confidence: candidates.length > 1 ? "AMBIGUOUS" : candidates.length === 0 ? "NONE" : candidates[0].matchType === "EXACT_NAME" || candidates[0].matchType === "EXACT_ALIAS" ? "EXACT" : "HIGH",
    needsUserSelection: candidates.length > 0, selectedItemId: null, autoMatch: false, blockedByConfidence: blocked,
  };
}
