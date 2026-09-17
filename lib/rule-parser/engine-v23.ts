import type { ParserOutput, ParserSegment } from "../ai/types";
import type { Analyzer } from "./engine";
import { parseRuleV22 } from "./engine-v22";
import { normalizeUtterance } from "./utterance";
import { extractClauseDate } from "./date-v23";
import { analyzeConnectorWords, epistemicSignal, recoverNegation, removeConnectorWords, splitClauses } from "./grammar-v23";

export function parseRuleV23(input: string, analyzer: Analyzer, today: string) {
  if (!input.trim() || input.length > 500) throw new Error("INPUT_LENGTH");
  const tokenCache = new Map<string, ReturnType<Analyzer>>();
  const analyze: Analyzer = text => {
    let tokens = tokenCache.get(text);
    if (!tokens) { tokens = analyzer(text); tokenCache.set(text, tokens); }
    return tokens;
  };
  const clauses = splitClauses(input, analyze);
  const diagnostics: ReturnType<typeof parseRuleV22>["diagnostics"] = [];
  const segments: ParserSegment[] = [];
  const overflow = clauses.length > 5;
  const sharedSpeculation = /^(?:아마도?|어쩌면)(?=\s|,)/.test(normalizeUtterance(input).coreClause);
  let sharedThirdPerson = false;
  if (!overflow) {
    const prepared = clauses.map(c => {
      const date = extractClauseDate(c.raw, today);
      const utterance = normalizeUtterance(removeConnectorWords(date.core));
      const negation = recoverNegation(utterance.coreClause || date.core, analyze);
      return { ...c, date, utterance, negation, core: negation.core };
    });
    const final = prepared.at(-1)!;
    const finalParsed = parseRuleV22(final.core || final.raw, analyze, today);
    const inheritPast = finalParsed.output.segments[0]?.intent === "COMPLETED" &&
      !epistemicSignal(input, analyze(input)) && !prepared.some(c => c.date.info.future);
    prepared.forEach((c, index) => {
      const clauseAnalyzer: Analyzer = text => {
        const sourceTokens = c.connector ? analyzeConnectorWords(text, analyze) : analyze(text);
        const tokens = sourceTokens.filter((t, i) => !(t.pos === "JX" && /^(은|는)$/.test(t.text) &&
          sourceTokens[i - 1]?.pos === "JKB" && sourceTokens[i - 1]?.text === "에" && /^(NNG|NNP)$/.test(sourceTokens[i - 2]?.pos || "")));
        if (!c.connector) return tokens;
        const last = tokens.findLastIndex(t => t.pos === "EC" && /^(고|는데)$/.test(t.text));
        if (last < 0) return tokens;
        const past = tokens.slice(0, last).some(t => t.pos === "EP" && /았|었|였/.test(t.text));
        if (!past && !inheritPast) return tokens;
        // A coordinated past assertion has no EF; expose only its ending to V2 safety.
        const next = [...tokens];
        next[last] = { ...tokens[last], pos: "EF", text: "어" };
        if (!past) next.splice(last, 0, { ...tokens[last], pos: "EP", text: "었" });
        return next;
      };
      const parsed = parseRuleV22(c.core || c.raw, clauseAnalyzer, today);
      const s = parsed.output.segments[0], d = parsed.diagnostics[0];
      if (!s || !d || parsed.output.segments.length !== 1) throw new Error("CLAUSE_UNRESOLVED");
      const date = c.date.info.explicit ? c.date.info : prepared[0].date.info;
      if (index === 0 && d.signals.subject) sharedThirdPerson = true;
      const subjectUnresolved = index > 0 && sharedThirdPerson && c.utterance.speaker !== "SELF";
      const uncertain = epistemicSignal(c.raw, analyze(c.raw)) || c.negation.ambiguous || sharedSpeculation || subjectUnresolved;
      let intent = s.intent;
      if (intent !== "QUERY" && uncertain) intent = "UNCERTAIN";
      else if (intent !== "QUERY" && intent !== "UNCERTAIN" && c.negation.recovered) intent = "NOT_COMPLETED";
      else if ((intent === "COMPLETED" || intent === "UNKNOWN") && date.future) intent = "PLANNED";
      const dateUnsafe = intent === "COMPLETED" && (!date.date || date.date > today || date.vague);
      if (uncertain) {
        d.confidence = "LOW"; d.intent_confidence = "LOW"; d.canonical_action = null; d.suggestedItemName = null;
        d.signals = { ...d.signals, uncertain: true };
        d.reasons.push(c.negation.ambiguous ? "NEGATION_BOUNDARY_AMBIGUOUS" : subjectUnresolved ? "INHERITED_SUBJECT_UNRESOLVED" : "EPISTEMIC_UNCERTAINTY");
      }
      const needs = d.confidence !== "HIGH" || dateUnsafe;
      const value: ParserSegment = { ...s, segment_id: String(index + 1), original_text: c.raw, intent,
        normalized_action: d.canonical_action || c.raw,
        performed_date: intent === "COMPLETED" && !dateUnsafe ? date.date : null,
        date_precision: intent !== "COMPLETED" ? "NOT_APPLICABLE" : date.vague ? "APPROXIMATE" : dateUnsafe ? "UNKNOWN" : "EXACT",
        date_resolution_source: intent !== "COMPLETED" ? "NONE" : date.explicit ? "EXPLICIT" : "IMPLICIT_TODAY",
        needs_clarification: needs,
        clarification: dateUnsafe ? { type: "DATE", question: "정확한 수행 날짜를 확인해주세요." } : uncertain ?
          { type: "COMPLETION", question: "실제로 완료한 일인지 확인해주세요." } : needs ? s.clarification : null,
      };
      diagnostics.push({ ...d, raw: c.raw, coreClause: c.core, utterance: { ...c.utterance, rawInput: c.raw, sourceOffsets: [], dateExpressions: c.date.expressions },
        reasons: [...d.reasons, ...(c.negation.recovered ? ["NEGATION_BOUNDARY_RECOVERED"] : []), ...(c.connector ? ["COORDINATE_CLAUSE"] : [])] });
      segments.push(value);
    });
  }
  const output: ParserOutput = { schema_version: "1.0", prompt_version: "1.1", result_type: overflow ? "TOO_MANY_ACTIONS" : "OK", overflow_detected: overflow, segments };
  return { rawInput: input, surface: input, utterance: normalizeUtterance(input), version: "V2.3" as const, output, diagnostics };
}
