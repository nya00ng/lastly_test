export type Utterance = {
  rawInput: string;
  coreClause: string;
  speaker: "SELF" | null;
  dateExpressions: string[];
  fillers: string[];
  sourceOffsets: number[];
};

const boundary = "(?=\\s|[,.!?~]|$)";
const speakerPrefix = new RegExp(`^(?:내가|나는|제가|저는|난|나|저)${boundary}`);
const fillerPrefix = new RegExp(`^(?:그러고\\s*보니|생각해보니|아\\s*맞다|음|아|어|참)${boundary}`);
const timePrefix = new RegExp(`^(?:\\d{4}-\\d{2}-\\d{2}|(?:\\d{4}\\s*년\\s*)?\\d{1,2}\\s*월\\s*\\d{1,2}\\s*일|\\d+\\s*일\\s*전|조금\\s*전에|지난\\s*주|다음\\s*주|그저께|오늘|어제|내일|모레|방금|아까)(?:은|는|에)?${boundary}`);
const punctuation: Record<string, string> = { "？": "?", "！": "!", "。": ".", "．": ".", "…": ".", "～": "~", "，": "," };

export function normalizeUtterance(rawInput: string): Utterance {
  let normalized = "";
  const offsets: number[] = [];
  for (let i = 0; i < rawInput.length; i++) {
    const char = /\s/.test(rawInput[i]) ? " " : punctuation[rawInput[i]] || rawInput[i];
    if (char === " " && normalized.endsWith(" ")) continue;
    normalized += char;
    offsets.push(i);
  }
  let start = normalized.search(/\S/);
  if (start < 0) start = normalized.length;
  let speaker: Utterance["speaker"] = null;
  const dateExpressions: string[] = [], fillers: string[] = [];
  // Only bounded leading expressions are metadata; never remove nouns inside a clause.
  while (start < normalized.length) {
    const rest = normalized.slice(start);
    const self = rest.match(speakerPrefix), time = rest.match(timePrefix), filler = rest.match(fillerPrefix);
    const match = self || time || filler;
    if (!match) break;
    if (self) speaker = "SELF";
    else if (time) dateExpressions.push(time[0]);
    else fillers.push(match[0]);
    start += match[0].length;
    const separator = normalized.slice(start).match(/^[\s,.!~]+/);
    start += separator?.[0].length || 0;
  }
  // Keep question marks and grammatical endings: they can carry uncertainty.
  const coreClause = normalized.slice(start).replace(/[\s!.~]+$/, "");
  return { rawInput, coreClause, speaker, dateExpressions, fillers,
    sourceOffsets: offsets.slice(start, start + coreClause.length) };
}
