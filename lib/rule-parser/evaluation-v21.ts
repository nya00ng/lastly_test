import type { ParserIntent } from "../ai/types";
export type ContextCase = { text: string; expected: ParserIntent[]; target: string; actions: string[]; group: string; expectedMatch?: string | null };
// Authored after the V2.1 implementation. Not imported by parser/matching/Worker.
const families = [
  ["가위", "갈았어", "갈다", "갈려고 했어", "갈았나"],
  ["원두", "갈았어", "갈다", "갈려고 했어", "갈았나"],
  ["배터리", "갈았어", "갈다", "갈려고 했어", "갈았나"],
  ["브러시", "바꿨어", "바꾸다", "바꾸려고 했어", "바꿨나"],
  ["부품", "교환했어", "교환하다", "교환하려고 했어", "교환했나"],
  ["침구", "씻었어", "씻다", "씻으려고 했어", "씻었나"],
  ["옷", "빨았어", "빨다", "빨려고 했어", "빨았나"],
  ["그릇", "교체했어", "교체하다", "교체하려고 했어", "교체했나"],
  ["책상", "닦았어", "닦다", "닦으려고 했어", "닦았나"],
  ["바닥", "씻었어", "씻다", "씻으려고 했어", "씻었나"],
  ["칼", "씻었어", "씻다", "씻으려고 했어", "씻었나"],
  ["렌즈", "닦았어", "닦다", "닦으려고 했어", "닦았나"],
  ["화초", "잘랐어", "자르다", "자르려고 했어", "잘랐나"],
  ["유리병", "말렸어", "말리다", "말리려고 했어", "말렸나"],
  ["운동화", "털었어", "털다", "털려고 했어", "털었나"],
  ["주전자", "비웠어", "비우다", "비우려고 했어", "비웠나"],
];
export const contextHoldout: ContextCase[] = families.flatMap(([target, past, action, plan, uncertain]) => [
  {text:`${target} ${past}`,expected:["COMPLETED"],target,actions:[action],group:"context-positive"},
  {text:`${target} 마지막으로 언제 ${past}`,expected:["QUERY"],target,actions:[action],group:"context-query"},
  {text:`${target} 안 ${past}`,expected:["NOT_COMPLETED"],target,actions:[action],group:"context-negative"},
  {text:`${target} ${plan}`,expected:["PLANNED"],target,actions:[action],group:"context-plan"},
  {text:`${target} ${uncertain}`,expected:["UNCERTAIN"],target,actions:[action],group:"context-uncertain"},
]);
const chains = [
  ["식물 물줬어", "식물", "물 주다"], ["화초에 물을 줬어", "화초", "물 주다"],
  ["약 먹여 줬어", "약", "먹여 주다"], ["문 열어 줬어", "문", "열어 주다"],
  ["사진 찍어 줬어", "사진", "찍어 주다"], ["친구에게 선물 줬어", "친구", "선물 주다"],
  ["책 읽어 줬어", "책", "읽어 주다"], ["장난감 고쳐 줬어", "장난감", "고쳐 주다"],
  ["상자 들어 줬어", "상자", "들어 주다"], ["아이에게 간식 줬어", "아이", "간식 주다"],
  ["화초 물줬나 모르겠어", "화초", "물 주다"], ["식물 물 안 줬어", "식물", "물 주다"],
];
contextHoldout.push(...chains.map(([text,target,action], i) => ({text,target,actions:[action],expected:[i===10?"UNCERTAIN":i===11?"NOT_COMPLETED":"COMPLETED"] as ParserIntent[],group:"context-chain"})));
contextHoldout.push(...[
  ["칫솔갈았어", "칫솔", "갈다"], ["칫솔 갈았어", "칫솔", "갈다"],
  ["정수기필터바꿨어", "정수기 필터", "바꾸다"], ["정수기 필터 바꿨어", "정수기 필터", "바꾸다"],
  ["자동차 배터리 갈았어", "자동차 배터리", "갈다"], ["자동차배터리 갈았어", "자동차 배터리", "갈다"],
  ["텀블러 뚜껑 씻었어", "텀블러 뚜껑", "씻다"], ["소파 커버 말렸어", "소파 커버", "말리다"],
].map(([text,target,action])=>({text,target,actions:[action],expected:["COMPLETED"] as ParserIntent[],group:"context-spacing-compound"})));

export const targetedCases: ContextCase[] = [
  ["칼 갈았어","COMPLETED","칼","갈다",null], ["칼 언제 갈았어","QUERY","칼","갈다",null],
  ["칼 갈려고 했어","PLANNED","칼","갈다",null],
  ["정수기 필터 갈았어","COMPLETED","정수기 필터","갈다","정수기 필터"],
  ["정수기 필터 언제 갈았어","QUERY","정수기 필터","갈다","정수기 필터"],
  ["렌즈 갈았어","COMPLETED","렌즈","갈다","렌즈 교체"],
  ["렌즈 언제 갈았어","QUERY","렌즈","갈다","렌즈 교체"],
  ["렌즈 다음주에 갈 거야","PLANNED","렌즈","갈다",null],
  ["커피 갈았어","COMPLETED","커피","갈다",null], ["커피 언제 갈았어","QUERY","커피","갈다",null],
  ["그릇 씻었어","COMPLETED","그릇","씻다",null], ["그릇 닦았어","COMPLETED","그릇","닦다",null],
  ["신발 빨았어","COMPLETED","신발","빨다","신발 세탁"], ["신발 씻었어","COMPLETED","신발","씻다","신발 세탁"],
  ["화분 물줬어","COMPLETED","화분","물 주다",null], ["화분에 물 줬어","COMPLETED","화분","물 주다",null],
  ["화분 물 주려고 했어","PLANNED","화분","물 주다",null],
  ["화분에 물을 줬어","COMPLETED","화분","물 주다",null],
].map(([text,intent,target,action,expectedMatch])=>({text:text!,expected:[intent as ParserIntent],target:target!,actions:[action!],expectedMatch,group:"targeted"}));
