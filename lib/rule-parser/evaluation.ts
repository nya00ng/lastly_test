import type { ParserIntent } from "../ai/types";
export type RuleCase = { text: string; intent: ParserIntent; target?: string; action?: string; group: string };
const cases = (group: string, intent: ParserIntent, texts: string[]): RuleCase[] => texts.map(text => ({ text, intent, group }));
export const coreCases: RuleCase[] = [
  ...cases("core", "COMPLETED", ["화분 물줬어", "화분에 물을 줬어", "아이 약 먹였어", "강아지 발 닦였어", "보조배터리 충전했어", "자동차 워셔액 넣었어", "가습기 말렸어", "냉장고 성에 제거했어", "침구 햇볕에 널었어", "신발 방수스프레이 뿌렸어", "커피머신 석회 제거했어", "공기청정기 먼지 털었어"]),
  ...cases("core", "QUERY", ["화분 언제 물줬어", "신발 언제 빨았어", "렌즈교체 언제 했어", "정수기 필터 언제 갈았어", "워셔액 마지막으로 언제 넣었어", "강아지 발 언제 닦였어", "가습기 언제 말렸더라"]),
  ...cases("core", "NOT_COMPLETED", ["화분 물 안 줬어", "신발 안 빨았어", "약 안 먹였어", "워셔액 못 넣었어", "가습기 아직 안 말렸어"]),
  ...cases("core", "PLANNED", ["화분 내일 물 줄 거야", "신발 빨아야 해", "렌즈 다음주에 갈 거야", "약 먹여야겠다"]),
  ...cases("core", "UNCERTAIN", ["화분 물 줬나", "신발 빨았던가", "약 먹였는지 모르겠어", "가습기 말렸나 기억 안 나"]),
];
// Authored after engine.ts v1. These sentences must never enter the rule module.
export const holdoutCases: RuleCase[] = [
  ["텐트 접었어", "텐트", "접다"], ["수건 삶았어", "수건", "삶다"], ["커튼 걸었어", "커튼", "걸다"],
  ["서랍 비웠어", "서랍", "비우다"], ["자전거 잠갔어", "자전거", "잠그다"], ["화병 헹궜어", "화병", "헹구다"],
  ["상자 묶었어", "상자", "묶다"], ["이불 개었어", "이불", "개다"], ["시계 맞췄어", "시계", "맞추다"],
  ["화초 옮겼어", "화초", "옮기다"], ["커피콩 볶았어", "커피콩", "볶다"], ["채소 다듬었어", "채소", "다듬다"],
  ["칼 갈았어", "칼", "갈다"], ["단추 달았어", "단추", "달다"], ["양말 꿰맸어", "양말", "꿰매다"],
  ["냄비 불렸어", "냄비", "불리다"], ["매트 깔았어", "매트", "깔다"], ["장작 쌓았어", "장작", "쌓다"],
  ["반죽 치댔어", "반죽", "치대다"], ["소포 부쳤어", "소포", "부치다"],
].map(([text, target, action]) => ({ text, target, action, intent: "COMPLETED" as const, group: "holdout" }));
holdoutCases.push(
  ...cases("holdout", "QUERY", ["텐트 언제 접었어", "화병 언제 헹궜어", "단추 마지막으로 언제 달았어"]),
  ...cases("holdout", "NOT_COMPLETED", ["서랍 안 비웠어", "자전거 못 잠갔어", "양말 안 꿰맸어"]),
  ...cases("holdout", "PLANNED", ["커튼 걸어야 해", "채소 다듬어야겠다"]),
  ...cases("holdout", "UNCERTAIN", ["시계 맞췄나", "화초 옮겼는지 모르겠어"]),
);
const combinations = [
  ["수건", "빨았어", "빨아야 해", "빨았나"], ["수건", "말렸어", "말려야 해", "말렸나"],
  ["그릇", "씻었어", "씻어야 해", "씻었나"], ["그릇", "닦았어", "닦아야 해", "닦았나"],
  ["신발", "빨았어", "빨아야 해", "빨았나"], ["신발", "말렸어", "말려야 해", "말렸나"],
  ["창문", "열었어", "열어야 해", "열었나"], ["창문", "닫았어", "닫아야 해", "닫았나"],
  ["문", "열었어", "열어야 해", "열었나"], ["문", "잠갔어", "잠가야 해", "잠갔나"],
  ["서랍", "비웠어", "비워야 해", "비웠나"], ["서랍", "닫았어", "닫아야 해", "닫았나"],
  ["상자", "열었어", "열어야 해", "열었나"], ["상자", "옮겼어", "옮겨야 해", "옮겼나"],
  ["의자", "닦았어", "닦아야 해", "닦았나"], ["의자", "옮겼어", "옮겨야 해", "옮겼나"],
  ["매트", "털었어", "털어야 해", "털었나"], ["매트", "접었어", "접어야 해", "접었나"],
  ["텐트", "접었어", "접어야 해", "접었나"], ["텐트", "말렸어", "말려야 해", "말렸나"],
];
export const combinatorialCases = combinations.flatMap(([target, past, plan, uncertain]) => [
  ...cases("combinatorial", "COMPLETED", [`${target} ${past}`]),
  ...cases("combinatorial", "QUERY", [`${target} 언제 ${past}`]),
  ...cases("combinatorial", "NOT_COMPLETED", [`${target} 안 ${past}`]),
  ...cases("combinatorial", "PLANNED", [`${target} ${plan}`]),
  ...cases("combinatorial", "UNCERTAIN", [`${target} ${uncertain}`]),
]);
export const falsePositiveCases = [
  ...cases("non-action", "UNKNOWN", ["화분이 예뻐", "오늘 날씨 좋다", "정수기 필터가 비싸", "약 어디 있지?", "나는 피곤했어"]),
  ...cases("non-action", "PLANNED", ["신발 사고 싶어"]),
];
export const allRuleCases = [...coreCases, ...holdoutCases, ...combinatorialCases, ...falsePositiveCases];

// Independent extraction rubric, including alternative object-inclusive targets.
export const extractionRubric: Record<string, { targets: string[]; actions: string[] }> = {
  "화분 물줬어": { targets: ["화분", "화분 물"], actions: ["주다", "물 주다"] },
  "화분에 물을 줬어": { targets: ["화분", "화분 물"], actions: ["주다", "물 주다"] },
  "아이 약 먹였어": { targets: ["아이", "아이 약"], actions: ["먹이다", "약 먹이다"] },
  "강아지 발 닦였어": { targets: ["강아지", "강아지 발"], actions: ["닦이다", "발 닦이다"] },
  "보조배터리 충전했어": { targets: ["보조배터리"], actions: ["충전하다"] },
  "자동차 워셔액 넣었어": { targets: ["자동차", "자동차 워셔액"], actions: ["넣다", "워셔액 넣다"] },
  "가습기 말렸어": { targets: ["가습기"], actions: ["말리다"] },
  "냉장고 성에 제거했어": { targets: ["냉장고 성에"], actions: ["제거하다"] },
  "침구 햇볕에 널었어": { targets: ["침구"], actions: ["널다", "햇볕에 널다"] },
  "신발 방수스프레이 뿌렸어": { targets: ["신발", "신발 방수스프레이"], actions: ["뿌리다", "방수스프레이 뿌리다"] },
  "커피머신 석회 제거했어": { targets: ["커피머신", "커피머신 석회"], actions: ["제거하다", "석회 제거하다"] },
  "공기청정기 먼지 털었어": { targets: ["공기청정기", "공기청정기 먼지"], actions: ["털다", "먼지 털다"] },
};
