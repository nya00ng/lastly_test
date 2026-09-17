import { parseRule, type Analyzer, type Diagnostic } from "./engine";
import { safetySignals } from "./safety-v2";
import type { ParserIntent } from "../ai/types";

export type Confidence = "HIGH" | "MEDIUM" | "LOW";
export type SafeDiagnostic = Omit<Diagnostic, "confidence"> & {
  raw_action_surface: string; lemma_candidate: string | null; canonical_action: string | null;
  confidence: Confidence; intent_confidence: Confidence; target_confidence: Confidence; action_confidence: Confidence;
  signals: ReturnType<typeof safetySignals>;
};
const timeNoun = /^(오늘|어제|그저께|내일|모레|지난|다음|주|일|언제|마지막|방금|전|후)$/;

export function parseRuleV2(input: string, analyze: Analyzer, today: string) {
  const base = parseRule(input, analyze, today);
  const wholeSignals = safetySignals(base.surface, analyze(base.surface));
  const diagnostics: SafeDiagnostic[] = [];
  const segments = base.output.segments.map((segment, index) => {
    const old = base.diagnostics[index];
    const tokens = old.tokens;
    const signals = safetySignals(old.raw, tokens);
    const reasons = ["CONSERVATIVE_V2", "LAB_ONLY_NO_WRITE_AUTHORIZATION"];
    const predicateIndex = tokens.findIndex(t => /^(VV|XSV)$/.test(t.pos));
    const predicate = tokens[predicateIndex];
    const nouns = tokens.slice(0, predicateIndex < 0 ? tokens.length : predicateIndex).filter(t => /^(NNG|NNP|SL|XR)$/.test(t.pos) && !timeNoun.test(t.text));
    const nominal = predicate?.text === "하" && nouns.length >= 2;
    const target = (nominal ? nouns.slice(0, -1) : nouns).map(t => t.text).join(" ");
    const lemma = predicate ? nominal ? `${nouns.at(-1)!.text}하다` : `${predicate.text}다` : null;
    const rawAction = old.raw.slice(predicate?.start ?? 0).trim() || old.raw;
    const compoundPredicate = tokens.filter(t => t.pos === "VV").length > 1 || tokens.some(t => t.pos === "VX" && !/^(않|못하)$/.test(t.text));
    const targetUncertain = !target || tokens.slice(0, predicateIndex).some((t, i) =>
      /^(IC|NP|VA|VCP|JKS|XSN|XPN)$/.test(t.pos) ||
      t.pos === "JKB" && nouns.length > 1 && tokens[i - 1]?.pos === "NNG" && !timeNoun.test(tokens[i - 1].text));
    const intentPlan = signals.intended || signals.prospective || signals.deliberative || signals.obligation || signals.future;
    let intent: ParserIntent;
    // A temporal query remains non-mutating even when asking about a negated action.
    if (signals.temporalQuery) intent = "QUERY";
    else if (signals.uncertain) intent = "UNCERTAIN";
    else if (signals.nearMiss) intent = "NOT_COMPLETED";
    else if (signals.negative) intent = "NOT_COMPLETED";
    else if (intentPlan) intent = "PLANNED";
    else if (signals.nonAssertion || signals.subject) intent = "UNCERTAIN";
    else if (predicate && signals.past && signals.assertedEnding) intent = "COMPLETED";
    else if (old.reasons.includes("COORDINATED_PAST") && !wholeSignals.intended && !wholeSignals.uncertain && !wholeSignals.future && !wholeSignals.nearMiss && !wholeSignals.nonAssertion) intent = "COMPLETED";
    else intent = "UNKNOWN";

    const intentConfidence: Confidence = intent === "UNKNOWN" || intent === "UNCERTAIN" ? "LOW" : "HIGH";
    const targetConfidence: Confidence = targetUncertain ? "LOW" : "HIGH";
    const actionConfidence: Confidence = !predicate || compoundPredicate ? "LOW" : predicate.text === "하" && !nominal ? "MEDIUM" : "HIGH";
    const confidence: Confidence = [intentConfidence, targetConfidence, actionConfidence].includes("LOW") ? "LOW" : actionConfidence;
    const canonical = confidence === "HIGH" && lemma ? `${target} ${nominal ? nouns.at(-1)!.text : lemma}`.trim() : null;
    if (compoundPredicate) reasons.push("PREDICATE_CHAIN_UNRESOLVED");
    if (targetUncertain) reasons.push("TARGET_UNRESOLVED");
    if (intentPlan) reasons.push("INTENTION_OR_FUTURE");
    if (signals.nearMiss) reasons.push("COUNTERFACTUAL_NEAR_MISS");
    const dateUnsafe = intent === "COMPLETED" && (segment.date_precision !== "EXACT" || !segment.performed_date || segment.performed_date > today);
    const needsClarification = confidence !== "HIGH" || dateUnsafe;
    const clarification = needsClarification ? {
      type: (dateUnsafe ? "DATE" : intentConfidence === "LOW" ? "COMPLETION" : "ACTION") as "DATE" | "COMPLETION" | "ACTION",
      question: dateUnsafe ? "정확한 수행 날짜를 확인해주세요." : "원문을 확인하고 행동과 수행 여부를 알려주세요.",
    } : null;
    diagnostics.push({ ...old, target, action: actionConfidence === "HIGH" ? lemma || rawAction : rawAction,
      confidence, intent_confidence: intentConfidence, target_confidence: targetConfidence, action_confidence: actionConfidence,
      raw_action_surface: rawAction, lemma_candidate: lemma, canonical_action: canonical, signals, reasons,
    });
    return { ...segment, intent, scope: target ? segment.scope : "UNCERTAIN" as const,
      normalized_action: canonical || old.raw,
      performed_date: intent === "COMPLETED" ? segment.performed_date : null,
      date_precision: intent === "COMPLETED" ? segment.date_precision : "NOT_APPLICABLE" as const,
      date_resolution_source: intent === "COMPLETED" ? segment.date_resolution_source : "NONE" as const,
      needs_clarification: needsClarification, clarification,
    };
  });
  return { ...base, output: { ...base.output, segments }, diagnostics, version: "V2" as const };
}
