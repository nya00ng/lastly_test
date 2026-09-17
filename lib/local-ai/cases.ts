import type { ParserIntent } from "../ai/types";

export type LabCase = { id: string; group: string; text: string; intents: ParserIntent[]; forbiddenMatch?: string };
// Evaluation only. Neither the inference worker nor its prompt imports this file.
const groups: Array<[string, string[], ParserIntent[]]> = [
  ["open", ["화분 물줬어", "아이 약 먹였어", "강아지 발 닦였어", "보조배터리 충전했어", "자동차 워셔액 넣었어", "가습기 말렸어", "냉장고 성에 제거했어", "침구 햇볕에 널었어", "신발 방수스프레이 뿌렸어", "커피머신 석회 제거했어"], ["COMPLETED"]],
  ["query", ["화분 언제 물줬어?", "신발 언제 빨았어?", "렌즈교체 언제 했어?", "정수기 필터 언제 갈았어?", "강아지 발 언제 닦였어?", "워셔액 마지막으로 언제 넣었어?"], ["QUERY"]],
  ["negative", ["화분 물 안 줬어", "약 안 먹였어", "워셔액 안 넣었어", "가습기 못 말렸어", "신발 안 빨았어"], ["NOT_COMPLETED"]],
  ["planned", ["화분 내일 물 줄 거야", "약 먹여야 해"], ["PLANNED"]],
  ["uncertain", ["가습기 말릴까?"], ["PLANNED", "UNCERTAIN"]],
  ["uncertain", ["화분 물 줬나?", "신발 빨았는지 모르겠어"], ["UNCERTAIN"]],
];
export const labCases: LabCase[] = groups.flatMap(([group, texts, intents]) => texts.map((text, index) => ({
  id: `${group}-${text === "가습기 말릴까?" ? "deliberation" : index + 1}`, group, text, intents,
  ...(text === "신발 방수스프레이 뿌렸어" ? { forbiddenMatch: "신발 세탁" } : {}),
}))).concat([
  { id: "mismatch-1", group: "mismatch", text: "정수기 필터 청소했어", intents: ["COMPLETED"], forbiddenMatch: "정수기 필터" },
  { id: "mismatch-2", group: "mismatch", text: "신발 교체했어", intents: ["COMPLETED"], forbiddenMatch: "신발 세탁" },
]);
