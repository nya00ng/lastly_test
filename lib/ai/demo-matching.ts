import { demoItems, type DemoCategory } from "@/lib/demo-data";
import type { ItemMatchingCandidate } from "./types";

const aliasMap: Record<string, string> = {
  "이불 빨래": "이불 세탁",
  "이불 빨았어": "이불 세탁",
  "칫솔 바꿈": "칫솔 교체",
  "칫솔 바꾸기": "칫솔 교체",
  "필터 교체": "정수기 필터",
};

const categoryKeywords: Array<{ category: DemoCategory; keywords: string[] }> = [
  { category: "생활", keywords: ["이불", "세탁", "청소", "정리", "침구", "에어컨"] },
  { category: "교체", keywords: ["교체", "바꿨어", "바꿈", "필터", "칫솔"] },
  { category: "구독", keywords: ["결제", "구독", "넷플릭스", "클라우드"] },
  { category: "건강", keywords: ["렌즈", "영양제", "약", "병원"] },
];

export function mapActionToDemoCategory(action: string | null): DemoCategory {
  const normalized = action?.trim() ?? "";
  const matched = categoryKeywords.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword)),
  );

  return matched?.category ?? "기타";
}

export function matchDemoItems(action: string | null): ItemMatchingCandidate[] {
  const normalized = action?.trim();

  if (!normalized) {
    return [{ name: "새 항목으로 기록", matchType: "NONE" }];
  }

  const exact = demoItems.find((item) => item.name === normalized);
  if (exact) {
    return [{ name: exact.name, matchType: "EXACT_NAME" }];
  }

  const alias = aliasMap[normalized];
  if (alias) {
    return [{ name: alias, matchType: "EXACT_ALIAS" }];
  }

  const fuzzy = demoItems
    .filter((item) => normalized.includes(item.name.split(" ")[0]) || item.name.includes(normalized.split(" ")[0]))
    .slice(0, 2)
    .map((item) => ({ name: item.name, matchType: "DEMO_FUZZY" as const }));

  return fuzzy.length > 0 ? fuzzy : [{ name: "새 항목으로 기록", matchType: "NONE" }];
}
