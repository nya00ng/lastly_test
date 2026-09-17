import { parseRuleV2, type SafeDiagnostic } from "./engine-v2";
import type { Analyzer } from "./engine";

export type ContextDiagnostic = SafeDiagnostic & { suggestedItemName: string | null };
const noun = /^(NNG|NNP|SL|XR)$/;
const temporal = /^(오늘|어제|그저께|내일|모레|지난|다음|주|일|언제|마지막|방금|전|후)$/;

function reconstruct(d: SafeDiagnostic, analyze: Analyzer) {
  const tokens = d.tokens;
  const give = tokens.findIndex(t => t.text === "주" && /^(VV|VX)$/.test(t.pos));
  if (give < 1 || tokens.slice(give + 1).some(t => /^(VV|VX|XSV)$/.test(t.pos))) return null;
  const before = tokens.slice(0, give).filter(t => !(t.pos === "MAG" && /^(안|못)$/.test(t.text)));
  if (before.some(t => /^(JKS|IC|NP|VA|VCP|XSN|XPN)$/.test(t.pos))) return null;
  const predicates = before.filter(t => /^(VV|XSV)$/.test(t.pos));
  const nouns = before.filter(t => noun.test(t.pos) && !temporal.test(t.text));
  if (!nouns.length) return null;
  if (predicates.length === 1) {
    const p = predicates[0];
    const bridge = before.slice(before.indexOf(p) + 1);
    if (bridge.some(t => t.pos === "EC")) {
      if (!bridge.every(t => t.pos === "EC" && /^(어|아|여)$/.test(t.text))) return null;
      const surface = d.raw.slice(p.start, p.end).trim();
      if (!/^[가-힣]+[아어여]$/.test(surface) || before.some(t => t.pos === "JKB")) return null;
      return { target: nouns.map(t => t.text).join(" "), action: `${surface} 주다` };
    }
    // A bare stem before 주 without a connective can be an object mistagged VV.
    // Reanalysis with an object particle supplies independent nominal evidence.
    const probe = analyze(`${p.text}을`);
    if (bridge.length || !probe.some(t => noun.test(t.pos) && t.text === p.text) || !probe.some(t => t.pos === "JKO")) return null;
    if (before.some(t => t.pos === "JKB" && t.text !== "에")) return null;
    return { target: nouns.map(t => t.text).join(" "), action: `${p.text} 주다` };
  }
  if (predicates.length || nouns.length < 2) return null;
  const object = nouns.at(-1)!;
  if (before.some(t => !noun.test(t.pos) && !/^(JKO|JKB)$/.test(t.pos))) return null;
  if (before.some(t => t.pos === "JKB" && t.text !== "에")) return null;
  return { target: nouns.slice(0, -1).map(t => t.text).join(" "), action: `${object.text} 주다` };
}

export function parseRuleV21(input: string, analyze: Analyzer, today: string) {
  const base = parseRuleV2(input, analyze, today);
  const diagnostics: ContextDiagnostic[] = base.diagnostics.map(d => {
    const rebuilt = reconstruct(d, analyze);
    const next = { ...d, reasons: [...d.reasons] };
    if (rebuilt && d.intent_confidence === "HIGH") {
      Object.assign(next, { target: rebuilt.target, action: rebuilt.action, lemma_candidate: rebuilt.action,
        canonical_action: `${rebuilt.target} ${rebuilt.action}`, confidence: "HIGH", target_confidence: "HIGH", action_confidence: "HIGH" });
      next.reasons = next.reasons.filter(r => !/^(PREDICATE_CHAIN_UNRESOLVED|TARGET_UNRESOLVED)$/.test(r));
      next.reasons.push("GIVE_PHRASE_RECONSTRUCTED");
    }
    // ㄹ 거 can make 갈 ambiguous between 가다 and 갈다. Do not invent a sense.
    if (d.lemma_candidate === "가다" && d.signals.prospective) {
      Object.assign(next, { confidence: "LOW", action_confidence: "LOW", canonical_action: null });
      next.reasons.push("PROSPECTIVE_LEMMA_AMBIGUOUS");
    }
    return { ...next, suggestedItemName: next.confidence === "HIGH" && next.lemma_candidate
      ? `${next.target} ${next.lemma_candidate.replace(/다$/, "기")}` : null };
  });
  const segments = base.output.segments.map((s, i) => {
    const d = diagnostics[i];
    const dateUnsafe = s.intent === "COMPLETED" && (s.date_precision !== "EXACT" || !s.performed_date || s.performed_date > today);
    const needs = d.confidence !== "HIGH" || dateUnsafe;
    return { ...s, normalized_action: d.canonical_action || s.original_text, needs_clarification: needs,
      clarification: needs ? s.clarification || { type: "ACTION" as const, question: "원문의 행동을 확인해주세요." } : null };
  });
  return { ...base, diagnostics, output: { ...base.output, segments }, version: "V2.1" as const };
}
