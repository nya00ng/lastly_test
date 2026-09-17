import type { Analyzer, Morpheme } from "./engine";

export function epistemicSignal(raw: string, tokens: Morpheme[]) {
  return /(?:^|\s)(?:아마도?|어쩌면)(?=\s|[,!?~.]|$)/.test(raw) ||
    /수\s*도\s*(?:있|있었)/.test(raw) || /(?:것|거)\s*같/.test(raw) ||
    /듯\s*(?:해|하|했|싶)/.test(raw) || /지도\s*(?:몰|모르)/.test(raw) ||
    /나\s*봐/.test(raw) || tokens.some(t => /^(듯|듯하)$/.test(t.text));
}

export function recoverNegation(raw: string, analyze: Analyzer) {
  let recovered = false;
  let ambiguous = false;
  const core = raw.replace(/[가-힣]+/g, word => {
    const original = analyze(word);
    if (original.some(t => /^(안|못)$/.test(t.text) && t.pos === "MAG")) return word;
    for (let i = 1; i < word.length - 1; i++) {
      if (!/[안못]/.test(word[i])) continue;
      const protectedToken = original.find(t => /^(NNG|NNP|VV)$/.test(t.pos) && t.text.length < word.length &&
        word.indexOf(t.text) <= i && word.indexOf(t.text) + t.text.length > i);
      if (protectedToken?.pos === "VV") continue;
      const left = word.slice(0, i), right = word.slice(i + 1);
      const nominal = analyze(`${left}을`);
      const predicate = analyze(right);
      if (!nominal.some(t => /^(NNG|NNP|SL)$/.test(t.pos)) ||
        !predicate.some(t => /^(VV|XSV|VX)$/.test(t.pos)) ||
        !predicate.some(t => /^(EF|EC|EP)$/.test(t.pos))) continue;
      // Both a known noun and a negated predicate are plausible: ask, don't split it.
      if (protectedToken) { ambiguous = true; continue; }
      const probe = `${left} ${word[i]} ${right}`;
      if (!analyze(probe).some(t => t.text === word[i] && t.pos === "MAG")) continue;
      recovered = true;
      return probe;
    }
    return word;
  });
  return { core, recovered, ambiguous };
}

export function analyzeConnectorWords(raw: string, analyze: Analyzer) {
  let tokens = analyze(raw);
  for (const m of raw.matchAll(/[가-힣]+(?:고|는데)(?=\s|$)/g)) {
    const end = m.index + m[0].length;
    const existing = tokens.filter(t => t.start >= m.index && t.end <= end);
    if (existing.some(t => t.pos === "EC")) continue;
    const isolated = analyze(m[0]);
    if (!isolated.some(t => t.pos === "EC" && /^(고|는데)$/.test(t.text)) || !isolated.some(t => /^(VV|XSV)$/.test(t.pos))) continue;
    tokens = [...tokens.filter(t => t.end <= m.index), ...isolated.map(t => ({ ...t, start: t.start + m.index, end: t.end + m.index })), ...tokens.filter(t => t.start >= end)];
  }
  return tokens;
}

export type Clause = { raw: string; connector: boolean };
const temporalNoun = /^(오늘|어제|내일|주|다음|지난|나서|언제|마지막)$/;
function hasActionTarget(text: string, analyze: Analyzer) {
  const tokens = analyze(text);
  const first = tokens.findIndex(t => /^(VV|XSV)$/.test(t.pos));
  if (first < 0 && tokens.some(t => t.pos === "NNB" && /^(거|것)$/.test(t.text)) && tokens.some(t => t.pos === "EF")) {
    return tokens.some(t => /^(NNG|NNP|SL)$/.test(t.pos) && !temporalNoun.test(t.text));
  }
  return first > 0 && !tokens.slice(0, first).some(t => t.pos === "VX") &&
    tokens.slice(0, first).some(t => /^(NNG|NNP|SL)$/.test(t.pos) && !temporalNoun.test(t.text));
}

export function splitClauses(raw: string, analyze: Analyzer): Clause[] {
  const tokens = analyzeConnectorWords(raw, analyze);
  const cuts = new Set<number>();
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.pos !== "EC" || !/^(고|는데)$/.test(t.text)) continue;
    if (t.text === "는데" && !tokens.slice(0, i).some(p => p.pos === "EP" && /았|었|였/.test(p.text))) continue;
    const tail = raw.slice(t.end).replace(/^\s*나서\s*/, "");
    if (hasActionTarget(tail, analyze)) cuts.add(t.end);
  }
  for (const m of raw.matchAll(/(?:^|\s)(그리고|그다음|또)(?=\s)/g)) {
    const end = m.index + m[0].length;
    if (hasActionTarget(raw.slice(0, m.index), analyze) && hasActionTarget(raw.slice(end), analyze)) cuts.add(end);
  }
  const ends: number[] = [];
  for (const n of [...cuts].filter(n => n > 0 && n < raw.length).sort((a, b) => a - b)) {
    if (removeConnectorWords(raw.slice(ends.at(-1) || 0, n))) ends.push(n);
  }
  const boundaries = [0, ...ends, raw.length];
  return boundaries.slice(0, -1).map((start, i) => {
    const piece = raw.slice(start, boundaries[i + 1]).trim();
    return { raw: piece, connector: /(?:고|는데)\s*$/.test(piece) };
  }).filter(c => c.raw);
}

export function removeConnectorWords(raw: string) {
  return raw.replace(/^\s*(?:나서|그리고|또|그다음)\s+/, "").replace(/\s+(?:그리고|또|그다음)\s*$/, "").trim();
}
