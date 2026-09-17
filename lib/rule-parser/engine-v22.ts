import { dateOf, type Analyzer } from "./engine";
import { parseRuleV21 } from "./engine-v21";
import { normalizeUtterance } from "./utterance";

export function parseRuleV22(input: string, analyze: Analyzer, today: string) {
  if (!input.trim() || input.length > 500) throw new Error("INPUT_LENGTH");
  const utterance = normalizeUtterance(input);
  // Topic particles on an explicit nominal target are not semantic subjects.
  // JKS (third-person subjects), negatives and all other particles remain intact.
  const coreAnalyzer: Analyzer = text => {
    const tokens = analyze(text);
    return tokens.filter((t, i) => !(t.pos === "JX" && /^(은|는)$/.test(t.text) &&
      /^(NNG|NNP|SL)$/.test(tokens[i - 1]?.pos || "")));
  };
  const base = parseRuleV21(utterance.coreClause || input, coreAnalyzer, today);
  let cursor = 0, sourceStart = 0;
  const diagnostics = base.diagnostics.map(d => ({ ...d, coreClause: d.raw, tokenSource: "coreClause" as const, utterance }));
  const segments = base.output.segments.map((s, i) => {
    const position = utterance.coreClause.indexOf(s.original_text, cursor);
    cursor = position < 0 ? cursor : position + s.original_text.length;
    const end = i === base.output.segments.length - 1 ? input.length :
      (utterance.sourceOffsets[cursor - 1] ?? input.length - 1) + 1;
    const original = input.slice(sourceStart, end).trim();
    sourceStart = end;
    diagnostics[i].raw = original;
    const ownDate = dateOf(original, today);
    const hasOwnDate = ownDate.explicit || /방금|아까|조금\s*전에/.test(original);
    const dateSource = hasOwnDate ? original : `${utterance.dateExpressions.join(" ")} ${original}`;
    const dt = dateOf(dateSource, today);
    const relativeFuture = /내일|모레|다음\s*주/.test(dateSource);
    const intent = (s.intent === "COMPLETED" || s.intent === "UNKNOWN") && relativeFuture ? "PLANNED" : s.intent;
    if (relativeFuture) {
      diagnostics[i].signals = { ...diagnostics[i].signals, future: true };
      diagnostics[i].reasons = [...diagnostics[i].reasons, "TEMPORAL_METADATA_FUTURE"];
      if (intent === "PLANNED") diagnostics[i].intent_confidence = "HIGH";
    }
    const explicit = dt.explicit || /방금|아까|조금\s*전에/.test(dateSource);
    const unsafe = intent === "COMPLETED" && (!dt.date || dt.vague || dt.date > today);
    const needs = diagnostics[i].confidence !== "HIGH" || unsafe;
    return { ...s, original_text: original, intent,
      performed_date: intent === "COMPLETED" && !unsafe ? dt.date : null,
      date_precision: intent !== "COMPLETED" ? "NOT_APPLICABLE" as const : dt.vague ? "APPROXIMATE" as const : unsafe ? "UNKNOWN" as const : "EXACT" as const,
      date_resolution_source: intent !== "COMPLETED" ? "NONE" as const : explicit ? "EXPLICIT" as const : "IMPLICIT_TODAY" as const,
      needs_clarification: needs,
      clarification: unsafe ? { type: "DATE" as const, question: "정확한 수행 날짜를 확인해주세요." } : needs ? s.clarification : null,
    };
  });
  return { ...base, rawInput: input, utterance, diagnostics, output: { ...base.output, segments }, version: "V2.2" as const };
}
