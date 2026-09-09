import type { DemoItem } from "./demo-data";
import type { EnrichedParserSegment } from "./ai/types";

export type DemoQueryResolution =
  | { type: "CLARIFICATION"; question: string; segmentId: string }
  | { type: "AMBIGUOUS"; candidates: string[]; segmentId: string }
  | { type: "NOT_FOUND"; segmentId: string }
  | { type: "FOUND"; item: DemoItem; lastActivityDate: string; queryTag?: string; segmentId: string };

export function resolveDemoQuery(
  segment: EnrichedParserSegment,
  items: DemoItem[],
  selectedItemName?: string,
): DemoQueryResolution {
  if (segment.needs_clarification && segment.clarification) {
    return {
      question: segment.clarification.question,
      segmentId: segment.segment_id,
      type: "CLARIFICATION",
    };
  }

  const candidates = segment.item_match.candidates
    .filter((candidate) => candidate.matchType !== "NONE")
    .map((candidate) => candidate.name);

  if (!selectedItemName && segment.item_match.needs_review && candidates.length > 1) {
    return { candidates, segmentId: segment.segment_id, type: "AMBIGUOUS" };
  }

  const targetName = selectedItemName || candidates[0];
  const item = items.find((candidate) => candidate.name === targetName);
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
