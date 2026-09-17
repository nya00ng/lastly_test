import { validateParserOutput } from "./schema";
import { calculateRecordCandidate } from "./candidate";
import { mapActionToDemoCategory } from "./demo-matching";
import { SERVER_TIMEZONE } from "./date";
import type { AiParseApiResponse } from "./types";

// Browser results are untrusted proposals, not write authorization. Demo only.
export function validateRulePilot(text: unknown, output: unknown, confidences: unknown, today: string): AiParseApiResponse {
  const validated = validateParserOutput(output);
  if (typeof text !== "string" || !text.trim() || text.length > 500 || !validated.ok ||
    !Array.isArray(confidences) || confidences.length !== validated.value.segments.length ||
    confidences.some(c => !["HIGH", "MEDIUM", "LOW"].includes(c))) {
    return { ok: false, mode: "MANUAL", code: "AI_INVALID_OUTPUT", message: "분석 결과를 확인하지 못했어요. 다시 입력해주세요." };
  }
  const segments = validated.value.segments.map((s, index) => {
    const segment = confidences[index] === "HIGH" ? s : { ...s, needs_clarification: true,
      clarification: s.clarification || { type: "ACTION" as const, question: "원문의 행동을 확인해주세요." } };
    const candidate = calculateRecordCandidate(segment, today);
    return { ...segment, demo_category: mapActionToDemoCategory(segment.normalized_action),
      item_match: { candidates: [], needs_review: false }, record_candidate: candidate.recordCandidate, record_candidate_reason: candidate.reason };
  });
  return { ...validated.value, ok: true, mode: "RULE", parse_id: crypto.randomUUID(),
    server_context: { current_local_date: today, timezone: SERVER_TIMEZONE }, segments };
}
