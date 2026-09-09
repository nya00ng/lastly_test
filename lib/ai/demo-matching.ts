import { demoItems, type DemoCategory } from "@/lib/demo-data";
import type { ItemMatchingCandidate } from "./types";

const aliasMap: Record<string, string> = {
  "이불 빨래": "bedding",
  "이불 빨았어": "bedding",
  "칫솔 바꿈": "toothbrush",
  "칫솔 바꾸기": "toothbrush",
  "필터 교체": "water-filter",
};

const categoryKeywords: Array<{ category: DemoCategory; keywords: string[] }> = [
  { category: "생활", keywords: ["이불", "세탁", "청소", "정리", "침구", "에어컨"] },
  { category: "교체", keywords: ["교체", "바꿨어", "바꿈", "필터", "칫솔"] },
  { category: "구독", keywords: ["결제", "구독", "넷플릭스", "클라우드"] },
  { category: "건강", keywords: ["렌즈", "영양제", "약", "병원"] },
];

type ActionSemantic = "세탁" | "교체" | "청소" | "점검";

function getActionSemantic(value: string): ActionSemantic | null {
  if (/(세탁|빨래|빨았|씻었)/.test(value)) return "세탁";
  if (/(교체|바꿨|바꿨어|갈았|교환)/.test(value)) return "교체";
  if (/(청소|닦았)/.test(value)) return "청소";
  if (/(점검|확인)/.test(value)) return "점검";
  return null;
}

function isActionCompatible(action: string, item: (typeof demoItems)[number]) {
  const requestedSemantic = getActionSemantic(action);
  if (!requestedSemantic) return true;

  const itemSemantics = new Set(
    [item.name, ...item.history.map((activity) => activity.actionLabel)]
      .map(getActionSemantic)
      .filter((semantic): semantic is ActionSemantic => semantic !== null),
  );
  return itemSemantics.size === 0 || itemSemantics.has(requestedSemantic);
}

export function mapActionToDemoCategory(action: string | null): DemoCategory {
  const normalized = action?.trim() ?? "";
  const matched = categoryKeywords.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword)),
  );

  return matched?.category ?? "기타";
}

export function matchDemoItems(
  action: string | null,
  items = demoItems,
  tagCandidates: string[] = [],
  options: { requireTagMatch?: boolean } = {},
): ItemMatchingCandidate[] {
  const normalized = action?.trim();

  if (!normalized) {
    return [{ name: "새 항목으로 기록", matchType: "NONE" }];
  }

  const normalizedTags = tagCandidates.map((tag) => tag.trim()).filter(Boolean);
  const exact = items.find((item) => item.name === normalized);
  if (exact) {
    const tagsMatchExactItem = normalizedTags.every((tag) => exact.tags.includes(tag));
    if (normalizedTags.length > 0 && tagsMatchExactItem) {
      return [{ name: exact.name, matchType: "EXACT_TAG" }];
    }
    if (normalizedTags.length > 0 && options.requireTagMatch) {
      return [{ name: "새 항목으로 기록", matchType: "NONE" }];
    }
    return [{ name: exact.name, matchType: "EXACT_NAME" }];
  }

  const aliasItem = items.find((item) => item.id === aliasMap[normalized]);
  if (aliasItem) {
    const tagsMatchAliasItem = normalizedTags.every((tag) => aliasItem.tags.includes(tag));
    if (normalizedTags.length > 0 && !tagsMatchAliasItem && options.requireTagMatch) {
      return [{ name: "새 항목으로 기록", matchType: "NONE" }];
    }
    return [{ name: aliasItem.name, matchType: "EXACT_ALIAS" }];
  }

  const exactTagMatches = items.filter((item) =>
    normalizedTags.some((tag) => item.tags.some((itemTag) => itemTag === tag)),
  );
  if (exactTagMatches.length > 0) {
    return exactTagMatches.map((item) => ({ name: item.name, matchType: "EXACT_TAG" }));
  }
  if (normalizedTags.length > 0 && options.requireTagMatch) {
    return [{ name: "새 항목으로 기록", matchType: "NONE" }];
  }

  const actionTagMatches = items.filter((item) => item.tags.some((tag) => tag === normalized));
  if (actionTagMatches.length > 0) {
    return actionTagMatches.map((item) => ({ name: item.name, matchType: "EXACT_TAG" }));
  }

  const noteMatches = items.filter((item) => item.note && item.note.toLowerCase().includes(normalized.toLowerCase()));
  if (noteMatches.length > 0) {
    return noteMatches.map((item) => ({ name: item.name, matchType: "NOTE" }));
  }

  const fuzzy = items
    .filter((item) => (
      normalized.includes(item.name.split(" ")[0]) || item.name.includes(normalized.split(" ")[0])
    ) && isActionCompatible(normalized, item))
    .slice(0, 2)
    .map((item) => ({ name: item.name, matchType: "DEMO_FUZZY" as const }));

  return fuzzy.length > 0 ? fuzzy : [{ name: "새 항목으로 기록", matchType: "NONE" }];
}
