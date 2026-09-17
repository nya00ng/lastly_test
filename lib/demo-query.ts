import type { DemoItem } from "./demo-data";
import type { EnrichedParserSegment, ItemMatchingCandidate } from "./ai/types";

export type DemoQueryResolution =
  | { type: "CLARIFICATION"; question: string; segmentId: string }
  | { type: "AMBIGUOUS"; candidates: ItemMatchingCandidate[]; segmentId: string }
  | { type: "NOT_FOUND"; segmentId: string }
  | { type: "FOUND"; item: DemoItem; lastActivityDate: string; queryTag?: string; segmentId: string };

export function resolveDemoQuery(
  segment: EnrichedParserSegment,
  items: DemoItem[],
  selectedItemId?: string,
): DemoQueryResolution {
  if (segment.needs_clarification && segment.clarification) {
    return {
      question: segment.clarification.question,
      segmentId: segment.segment_id,
      type: "CLARIFICATION",
    };
  }

  const candidates = segment.item_match.candidates
    .filter((candidate) => candidate.itemId && candidate.matchType !== "NONE");

  if (!selectedItemId && candidates.length > 1) {
    return { candidates, segmentId: segment.segment_id, type: "AMBIGUOUS" };
  }

  const targetId = selectedItemId || candidates[0]?.itemId;
  const item = candidates.some(candidate => candidate.itemId === targetId)
    ? items.find(candidate => candidate.id === targetId && candidate.status !== "ARCHIVED") : undefined;
  if (!item || item.history.length === 0) {
    return { segmentId: segment.segment_id, type: "NOT_FOUND" };
  }

  const lastActivity = [...item.history].sort((left, right) =>
    right.dateLabel.replaceAll(".", "-").localeCompare(left.dateLabel.replaceAll(".", "-")),
  )[0];
  return {
    item,
    lastActivityDate: lastActivity.dateLabel,
    queryTag: segment.tag_candidates?.find((tag) => item.tags.includes(tag)),
    segmentId: segment.segment_id,
    type: "FOUND",
  };
}
