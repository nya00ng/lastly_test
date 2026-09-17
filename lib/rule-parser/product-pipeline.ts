import { parseRuleV23 } from "./engine-v23";
import { contextualMatches, comparisonKey } from "./matching-v21";
import { validateParserOutput } from "../ai/schema";
import type { Analyzer } from "./engine";
import type { DemoItem } from "../demo-data";

export function prepareProductRule(text: string, analyze: Analyzer, today: string, items: DemoItem[]) {
  const parsed = parseRuleV23(text, analyze, today);
  const validation = validateParserOutput(parsed.output);
  if (!validation.ok) throw new Error("INVALID_PARSER_OUTPUT");
  const matching = parsed.diagnostics.map(d => {
    const matched = contextualMatches(d, analyze, items);
    // Session-created names use the parser's literal nominal form (e.g. 칼 갈기).
    // Match that exact form only; never broaden a target-only/fuzzy match.
    if (!matched.candidates.length && d.confidence === "HIGH" && d.suggestedItemName) {
      const named = items.filter(item => item.status !== "ARCHIVED" && comparisonKey(item.name) === comparisonKey(d.suggestedItemName!));
      if (named.length) return { ...matched, candidates: named.map(item => ({ itemId: item.id, name: item.name, matchType: "EXACT_NAME" as const })),
        confidence: named.length > 1 ? "AMBIGUOUS" : "HIGH", needsUserSelection: true };
    }
    return matched;
  });
  return { output: validation.value, matching, confidences: parsed.diagnostics.map(d => d.confidence), names: parsed.diagnostics.map(d => d.suggestedItemName) };
}
