import { Garu } from "garu-ko/browser";
import { parseRuleV23 } from "./engine-v23";
import { contextualMatches } from "./matching-v21";
import { calculateRecordCandidate } from "../ai/candidate";
import { validateParserOutput } from "../ai/schema";
let analyzer: Garu | null = null;
const analyze = (value: string) => {
  const result = analyzer!.analyze(value);
  return (Array.isArray(result) ? result[0] : result).tokens;
};
self.onmessage = async (event: MessageEvent<{ id: number; text?: string; today: string }>) => {
  const { id, text, today } = event.data;
  try {
    if (!analyzer) {
      const start = performance.now();
      analyzer = await Garu.load();
      self.postMessage({ id, initializedMs: performance.now() - start });
      if (!text) return;
    }
    if (!text) return;
    const start = performance.now();
    const parsed = parseRuleV23(text, analyze, today);
    const diagnostics = parsed.diagnostics.map((d, i) => {
      const matching = contextualMatches(d, analyze);
      const candidateDiagnostic = calculateRecordCandidate(parsed.output.segments[i], today);
      return { ...d, matching, candidateDiagnostic,
        newItemCandidate: candidateDiagnostic.recordCandidate && d.confidence === "HIGH" && matching.candidates.length === 0,
        nextStep: parsed.output.segments[i].needs_clarification ? "CLARIFICATION" : parsed.output.segments[i].intent === "QUERY" ? matching.candidates.length ? "QUERY_CANDIDATE_REVIEW" : "QUERY_TARGET_CLARIFICATION" : candidateDiagnostic.recordCandidate ? "CONFIRMATION_ONLY" : "NO_RECORD",
      };
    });
    self.postMessage({ id, result: { ...parsed, diagnostics, validation: validateParserOutput(parsed.output), ms: performance.now() - start } });
  } catch (error) { self.postMessage({ id, error: error instanceof Error ? error.message : "PARSER_ERROR" }); }
};
