import type { Morpheme } from "./engine";

// Grammar families, not allowed action words. Surface checks cover POS errors.
export function safetySignals(raw: string, tokens: Morpheme[]) {
  const has = (re: RegExp, pos?: RegExp) => tokens.some(t => re.test(t.text) && (!pos || pos.test(t.pos)));
  const futureModifier = has(/^(ㄹ|을)$/, /^ETM$/);
  return {
    negative: has(/^(안|못)$/, /^MAG$/) || has(/^(않|못하)$/, /^(VX|VV)$/) || /(?:^|\s)(안|못)\s+/.test(raw),
    nearMiss: has(/^뻔$/, /^NNB$/) || /(?:ㄹ|을|[가-힣])\s*뻔/.test(raw),
    intended: has(/려고|으려고|려다|려다가/, /^EC$/) || /(?:으?려고|으?려다(?:가)?)/.test(raw),
    prospective: futureModifier && has(/^(생각|예정|참|계획|거|것)$/),
    deliberative: has(/ㄹ까|을까/, /^(EF|EC)$/) && has(/^하$/, /^(VV|VX|XSV)$/),
    obligation: has(/어야|아야|여야/, /^(EC|EF)$/) || has(/^싶$/, /^VX$/),
    uncertain: has(/^(나|던가|는지|은지|ㄴ지)$/, /^(EF|EC)$/) || has(/^(모르|기억)$/) || /기억\s*(?:안|못)/.test(raw),
    temporalQuery: has(/^언제$/) || /언제/.test(raw),
    future: /내일|모레|다음\s*(주|달|날|월)|나중에/.test(raw) || has(/^겠$/, /^EP$/),
    // Conditional, reported, interrupted or descriptive clauses lack direct assertion.
    nonAssertion: has(/면|다고|라고|다가|려|는데|지만/, /^(EC|JKQ)$/) || has(/^말$/, /^VX$/) || has(/^(ㄴ|은|는|던)$/, /^ETM$/),
    subject: has(/./, /^JKS$/),
    past: has(/았|었|였|더/, /^EP$/),
    assertedEnding: has(/^(어|아|여|다|어요|아요|습니다|네|지|음|더라|었어|았어)$/, /^EF$/),
  };
}
