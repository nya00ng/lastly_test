// Matching-only context. Unknown targets retain their action, never fail parsing.
const groups = {
  REPLACEABLE_COMPONENT: ["필터", "렌즈", "칫솔", "배터리", "브러시", "부품"],
  FABRIC_LAUNDRY: ["신발", "수건", "이불", "옷", "침구"],
  CLEANABLE_OBJECT: ["그릇", "창문", "책상", "바닥"],
  SHARPENABLE: ["칼", "가위"],
  PLANT: ["화분", "식물", "화초"],
} as const;
export const comparisonKey = (value: string) => value.normalize("NFC").replace(/\s+/g, "").toLowerCase();
export function contextualAction(target: string, lemma: string) {
  const head = target.trim().split(/\s+/).at(-1) || "";
  const contexts = Object.entries(groups).filter(([, words]) => words.some(word => head === word)).map(([name]) => name);
  let semantic = lemma;
  if (contexts.includes("REPLACEABLE_COMPONENT") && /^(갈다|바꾸다|교체하다|교환하다)$/.test(lemma)) semantic = "교체";
  if (contexts.includes("FABRIC_LAUNDRY") && /^(빨다|씻다|세탁하다)$/.test(lemma)) semantic = "세탁";
  if (contexts.includes("CLEANABLE_OBJECT") && /^(닦다|청소하다)$/.test(lemma)) semantic = "청소";
  return { contexts, semantic, contextual: semantic !== lemma };
}
