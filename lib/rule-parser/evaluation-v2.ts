import type { ParserIntent } from "../ai/types";
export type SafetyCase = { text: string; expected: ParserIntent[]; group: string; noCandidate?: boolean; expectedMatch?: string | null };
const safeIntent: ParserIntent[] = ["NOT_COMPLETED", "PLANNED", "UNCERTAIN", "UNKNOWN"];
const group = (name: string, expected: ParserIntent[], inputs: string[], noCandidate = true): SafetyCase[] => inputs.map(text => ({ text, expected, group: name, noCandidate }));
export const v2Controls = [
  ...group("required-adversarial", safeIntent, ["신발 빨려고 했어", "신발 빨려다가 말았어", "신발 빨 생각이었어", "신발 빨 뻔했어", "신발 빨까 했어", "신발 아직 안 빨았어", "신발 못 빨았어", "신발 빨았는지 모르겠어", "화분 물 주려고 했어", "화분 물 주려다가 못 줬어", "화분 물 줄 생각이야", "화분 물 줬나 모르겠어", "렌즈 갈려고 했어", "렌즈 갈 뻔했어", "렌즈 아직 안 갈았어"]),
  ...group("required-positive", ["COMPLETED"], ["신발 빨았어", "신발 다 빨았어", "어제 신발 빨았어", "방금 신발 빨았어", "화분 물줬어", "화분에 물 줬어", "렌즈 교체했어", "정수기 필터 갈았어"], false),
];
// First authored after safety-v2 and engine-v2 rules. Never imported by the engine.
export const safetyHoldout: SafetyCase[] = [
  ...group("new-intention", ["PLANNED", "UNCERTAIN"], ["커튼 달려고 했다", "텐트 접으려고 했는데", "냄비 씻을 생각이었어", "수건 삶을 예정이야", "창문 닫을 참이었어", "장갑 꿰매려고 한다"]),
  ...group("new-attempt", safeIntent, ["책장 옮기려다가 못 옮겼어", "양말 빨려다가 그만뒀어", "전구 바꾸려고 했는데 실패했어", "매트 털려다 말았어", "화병 닦다가 중단했어", "자전거 고치려다 포기했어"]),
  ...group("new-near-miss", safeIntent, ["보일러 켤 뻔했어", "약 두 번 먹을 뻔했어", "냉장고 전원 끌 뻔했다", "서랍 비울 뻔했어", "커튼 뗄 뻔했어"]),
  ...group("new-memory", ["UNCERTAIN"], ["가방 닦았나 모르겠어", "문 잠갔는지 기억 안 나", "화병 헹궜던가", "식탁 닦았는지 모르겠어", "시계 맞췄나"]),
  ...group("new-negation", ["NOT_COMPLETED", "UNCERTAIN"], ["커튼 아직 못 달았어", "장갑 안 꿰맸어", "화병 헹구지 않았어", "텐트 접지 못했어", "커피콩 안 볶았어"]),
  ...group("new-future", ["PLANNED", "UNCERTAIN"], ["내일 가방 닦을 거야", "모레 매트 털어야 해", "다음 주에 소파 옮길 거야", "나중에 전구 바꾸겠어", "내일 수건 삶았어"]),
  ...group("new-question", ["QUERY"], ["가방 언제 닦았지", "커튼 마지막으로 언제 달았어", "매트 언제 털었더라", "텐트 접은 게 언제야", "시계 언제 맞췄어"]),
  ...group("new-completed", ["COMPLETED"], ["가방 닦았어", "어제 매트 털었어", "책장 옮겼어", "수건 다 삶았어", "커튼 달았어", "전구 바꿨어", "소포 부쳤어"], false),
  ...group("new-ambiguity", ["UNCERTAIN", "UNKNOWN"], ["문 열었다고 들었어", "친구가 식탁 닦았어", "가방 닦은 줄 알았어", "약 먹지 않은 건 아니야"]),
  ...group("new-compound-spacing", ["QUERY"], ["에어컨필터 청소 언제 했어", "에어컨 필터 청소 언제 했어", "신발세탁 언제 했어", "신발 세탁 언제 했어", "정수기필터 교체 언제 했어", "정수기 필터 교체 언제 했어"]),
];
export const queryMatchCases: SafetyCase[] = [
  {text:"렌즈교체 언제 했어",expected:["QUERY"],group:"query-match",expectedMatch:"렌즈 교체"},
  {text:"렌즈 교체 언제 했어",expected:["QUERY"],group:"query-match",expectedMatch:"렌즈 교체"},
  {text:"신발 언제 빨았어",expected:["QUERY"],group:"query-match",expectedMatch:"신발 세탁"},
  {text:"신발 언제 교체했어",expected:["QUERY"],group:"query-match",expectedMatch:null},
  {text:"정수기 필터 언제 갈았어",expected:["QUERY"],group:"query-match",expectedMatch:"정수기 필터"},
  {text:"언제했어",expected:["QUERY"],group:"query-match",expectedMatch:null},
];
