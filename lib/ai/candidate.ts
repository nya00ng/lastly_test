import { isIsoDate } from "./date";
import type { ParserSegment } from "./types";

export function calculateRecordCandidate(segment: ParserSegment, currentLocalDate: string) {
  const hasAction = typeof segment.normalized_action === "string" && segment.normalized_action.trim().length > 0;
  const performedDate = segment.performed_date;
  const hasExactDate = segment.date_precision === "EXACT" && isIsoDate(performedDate);
  const isNonFuture = hasExactDate && performedDate <= currentLocalDate;

  const recordCandidate =
    segment.intent === "COMPLETED" &&
    segment.scope === "IN_SCOPE" &&
    hasAction &&
    hasExactDate &&
    isNonFuture &&
    segment.needs_clarification === false;

  if (recordCandidate) {
    return { recordCandidate, reason: "READY_FOR_USER_CONFIRMATION" };
  }

  if (segment.intent !== "COMPLETED") return { recordCandidate, reason: "INTENT_NOT_COMPLETED" };
  if (segment.scope !== "IN_SCOPE") return { recordCandidate, reason: "SCOPE_NOT_IN_SCOPE" };
  if (!hasAction) return { recordCandidate, reason: "ACTION_REQUIRED" };
  if (!hasExactDate) return { recordCandidate, reason: "EXACT_DATE_REQUIRED" };
  if (!isNonFuture) return { recordCandidate, reason: "FUTURE_DATE_BLOCKED" };
  if (segment.needs_clarification) return { recordCandidate, reason: "CLARIFICATION_REQUIRED" };

  return { recordCandidate, reason: "NOT_CANDIDATE" };
}
