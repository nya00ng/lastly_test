import { matchDemoItems } from "../ai/demo-matching";
import { demoItems } from "../demo-data";
import type { Analyzer, Diagnostic } from "./engine";
export { equivalence };

// Equivalence helps matching only; unknown verbs remain valid parser actions.
const equivalence: Record<string, string> = { 빨다: "세탁", 씻다: "세탁", 세탁하다: "세탁", 갈다: "교체", 바꾸다: "교체", 교체하다: "교체", 교환하다: "교체", 닦다: "청소", 청소하다: "청소", 확인하다: "점검", 점검하다: "점검" };
export function guardedMatches(normalized: string | null, d: Diagnostic, analyze: Analyzer) {
  const semantic = equivalence[d.action];
  const matchingSurface = semantic && d.target ? `${d.target} ${semantic}` : normalized;
  const candidates = matchDemoItems(matchingSurface);
  const compatible = candidates.filter(candidate => {
    if (candidate.matchType === "NONE") return false;
    if (candidate.matchType === "EXACT_NAME" || candidate.matchType === "EXACT_ALIAS") return true;
    const item = demoItems.find(i => i.name === candidate.name);
    if (!item || !d.action) return false;
    const labels = [item.name, ...item.history.map(h => h.actionLabel)];
    return labels.some(label => {
      if (semantic) return label.includes(semantic);
      const verbs = analyze(`${label} 했어`).filter(t => t.pos === "VV" || t.pos === "XSV");
      return verbs.some(t => `${t.text}다` === d.action && t.text !== "하");
    });
  });
  return { matchingSurface, candidates: compatible, noMatch: compatible.length === 0, requiresUserSelection: compatible.length > 0 };
}
