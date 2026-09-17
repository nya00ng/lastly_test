import type { ParserIntent, ParserOutput, ParserSegment } from "../ai/types";
import { isIsoDate } from "../ai/date";

export type Morpheme = { text: string; pos: string; start: number; end: number };
export type Analyzer = (text: string) => Morpheme[];
export type Diagnostic = { raw: string; tokens: Morpheme[]; target: string; action: string; confidence: "MEDIUM" | "LOW"; reasons: string[] };
export const normalizeSurface = (s: string) => s.normalize("NFC").replace(/[？]/g, "?").replace(/[！]/g, "!").replace(/\s+/g, " ").trim();
const temporal = /^(오늘|어제|그저께|내일|모레|지난주|다음주|언제|마지막|아직|전|후|주|일)$/;
const noun = (t: Morpheme) => /^(NNG|NNP|SL|XR)$/.test(t.pos) && !temporal.test(t.text);

export function dateOf(raw: string, today: string) {
  const absolute = raw.match(/(?:(\d{4})\s*년\s*)?(\d{1,2})\s*월\s*(\d{1,2})\s*일/) || raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (absolute) {
    const date = `${absolute[1] || today.slice(0, 4)}-${absolute[2].padStart(2, "0")}-${absolute[3].padStart(2, "0")}`;
    return { date: isIsoDate(date) ? date : null, vague: false, explicit: true };
  }
  const before = raw.match(/(\d+)\s*일\s*전/);
  const offset = before ? -Number(before[1]) : /그저께/.test(raw) ? -2 : /어제/.test(raw) ? -1 : /내일/.test(raw) ? 1 : /모레/.test(raw) ? 2 : 0;
  const vague = /지난\s*주|다음\s*주|쯤|얼마\s*전/.test(raw);
  const explicit = vague || Boolean(before) || /오늘|어제|그저께|내일|모레/.test(raw);
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  return { date: vague ? null : d.toISOString().slice(0, 10), vague, explicit };
}

function segment(raw: string, tokens: Morpheme[], today: string, inheritedPast: boolean, index: number) {
  const has = (text: RegExp, pos?: RegExp) => tokens.some(t => text.test(t.text) && (!pos || pos.test(t.pos)));
  const past = has(/았|었|였|더/, /^EP$/) || inheritedPast;
  const uncertain = has(/^(나|던가|는지|은지|ㄴ지)$/, /^(EF|EC)$/) || has(/^(모르|기억)$/) && past;
  const query = has(/^언제$/) || /마지막.*언제/.test(raw);
  const planned = has(/어야|아야|여야/, /^(EC|EF)$/) || has(/^겠$/, /^EP$/) || has(/^(거|것)$/, /^NNB$/) && has(/ㄹ|을/, /^ETM$/);
  const negative = has(/^(안|못)$/, /^MAG$/) || has(/^(않|못하)$/, /^(VX|VV)$/);
  const predicateIndex = tokens.findIndex(t => /^(VV|XSV)$/.test(t.pos) && !/^(모르|않|못하)$/.test(t.text));
  const predicate = tokens[predicateIndex];
  let intent: ParserIntent = uncertain ? "UNCERTAIN" : query ? "QUERY" : planned ? "PLANNED" : negative && predicate ? "NOT_COMPLETED" : past && predicate ? "COMPLETED" : "UNKNOWN";
  // Desires, quotations and subordinate descriptions are not completed assertions.
  if (!query && has(/^(싶)$/, /^VX$/)) intent = "PLANNED";
  if (!query && has(/다고|라고/, /^(EC|JKQ)$/)) intent = "UNCERTAIN";
  const before = tokens.slice(0, predicateIndex < 0 ? tokens.length : predicateIndex).filter(noun);
  const derived = predicate?.pos === "XSV" && before.length > 0;
  const action = predicate ? (derived ? `${before.at(-1)!.text}${predicate.text}다` : `${predicate.text}다`) : "";
  const targets = derived ? before.slice(0, -1) : before;
  const target = targets.map(t => t.text).join(" ");
  const normalized = [...targets.map(t => t.text), derived ? before.at(-1)!.text : action].filter(Boolean).join(" ") || null;
  const dt = dateOf(raw, today);
  const future = dt.date !== null && dt.date > today;
  const unclear = !normalized || intent === "UNKNOWN" || intent === "UNCERTAIN" || intent === "COMPLETED" && (dt.vague || future || !dt.date);
  const clarification = unclear ? { type: (intent === "COMPLETED" && (dt.vague || future || !dt.date) ? "DATE" : intent === "UNCERTAIN" ? "COMPLETION" : "ACTION") as "DATE" | "COMPLETION" | "ACTION", question: "원문과 수행 여부, 정확한 날짜를 확인해주세요." } : null;
  const value: ParserSegment = {
    segment_id: String(index + 1), original_text: raw, intent, scope: normalized ? "IN_SCOPE" : "UNCERTAIN",
    normalized_action: normalized, performed_date: intent === "COMPLETED" && !future ? dt.date : null,
    date_precision: intent !== "COMPLETED" ? "NOT_APPLICABLE" : dt.vague ? "APPROXIMATE" : future || !dt.date ? "UNKNOWN" : "EXACT",
    date_resolution_source: intent === "COMPLETED" ? dt.explicit ? "EXPLICIT" : "IMPLICIT_TODAY" : "NONE",
    needs_clarification: unclear, clarification, tag_candidates: [],
  };
  const diagnostic: Diagnostic = { raw, tokens, target, action, confidence: unclear || !target ? "LOW" : "MEDIUM", reasons: ["MORPHOLOGY_RULES_V1", "SCOPE_IS_LAB_HYPOTHESIS_NOT_PRODUCTION_AUTHORIZATION", ...(inheritedPast ? ["COORDINATED_PAST"] : [])] };
  return { value, diagnostic };
}

export function parseRule(input: string, analyze: Analyzer, today: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today) || new Date(`${today}T00:00:00Z`).toISOString().slice(0, 10) !== today) throw new Error("INVALID_CONTEXT_DATE");
  const surface = normalizeSurface(input);
  if (!surface || surface.length > 500) throw new Error("INPUT_LENGTH");
  const tokens = analyze(surface);
  const cuts = tokens.filter((t, i) => t.pos === "EC" && t.text === "고" && tokens.slice(i + 1).some(noun)).map(t => t.end);
  const boundaries = [...new Set([0, ...cuts, surface.length])];
  const pieces = boundaries.slice(0, -1).map((start, i) => surface.slice(start, boundaries[i + 1]).trim()).filter(Boolean);
  const overflow = pieces.length > 5;
  const final = segment(pieces.at(-1) || surface, analyze(pieces.at(-1) || surface), today, false, 0);
  const segments = overflow ? [] : pieces.map((piece, i) => segment(piece, analyze(piece), today, i < pieces.length - 1 && final.value.intent === "COMPLETED", i));
  const output: ParserOutput = { schema_version: "1.0", prompt_version: "1.1", result_type: overflow ? "TOO_MANY_ACTIONS" : "OK", overflow_detected: overflow, segments: segments.map(s => s.value) };
  return { output, diagnostics: segments.map(s => s.diagnostic), surface, rawInput: input };
}
