import { addCalendarMonths, addDays } from "../cycle";
import { isIsoDate } from "../ai/date";
import { dateOf } from "./engine";

export type ClauseDate = { date: string | null; explicit: boolean; vague: boolean; future: boolean };
const expressions = /(?<![가-힣\d])(?:\d{4}-\d{2}-\d{2}|(?:\d{4}\s*년\s*)?\d{1,2}\s*월\s*\d{1,2}\s*일|(?:하루|이틀|사흘|나흘|일주일|\d+\s*(?:일|주)|한\s*달|\d+\s*개월)\s*전(?:에)?|(?:며칠|얼마|한참)\s*전(?:에)?|지난\s*(?:주|달|해)|다음\s*(?:주|달)|조금\s*전에|그저께|오늘|어제|내일|모레|방금|아까)(?:은|는|에)?(?=\s|[,.!?~！？，。]|$)/g;

export function extractClauseDate(raw: string, today: string) {
  const matches = [...raw.matchAll(expressions)];
  const dates = matches.map(m => {
    const text = m[0];
    const absolute = text.match(/(?:(\d{4})\s*년\s*)?(\d{1,2})\s*월\s*(\d{1,2})\s*일/) || text.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (absolute) {
      const value = `${absolute[1] || today.slice(0, 4)}-${absolute[2].padStart(2, "0")}-${absolute[3].padStart(2, "0")}`;
      return { date: isIsoDate(value) ? value : null, absolute: true, vague: false, future: false };
    }
    if (/며칠|얼마|한참|지난|다음/.test(text)) return { date: null, absolute: false, vague: true, future: /다음/.test(text) };
    const quantity = text.match(/(\d+)\s*(일|주|개월)/);
    const value = quantity ? Number(quantity[1]) : /이틀/.test(text) ? 2 : /사흘/.test(text) ? 3 : /나흘/.test(text) ? 4 : 1;
    if (!Number.isSafeInteger(value) || value > 10000) return { date: null, absolute: false, vague: true, future: false };
    let date = today;
    if (/달|개월/.test(text)) date = addCalendarMonths(today, -value);
    else if (/전/.test(text) && !/조금/.test(text)) date = addDays(today, -value * (/주/.test(text) ? 7 : 1));
    else if (/그저께/.test(text)) date = addDays(today, -2);
    else if (/어제/.test(text)) date = addDays(today, -1);
    else if (/내일/.test(text)) date = addDays(today, 1);
    else if (/모레/.test(text)) date = addDays(today, 2);
    return { date, absolute: false, vague: false, future: /내일|모레/.test(text) };
  });
  const priority = dates.some(d => d.absolute) ? dates.filter(d => d.absolute) : dates;
  const distinct = new Set(priority.map(d => d.date));
  const conflict = distinct.size > 1;
  const info: ClauseDate = {
    date: conflict ? null : priority[0]?.date ?? (dates.length ? null : today),
    explicit: dates.length > 0,
    vague: conflict || priority.some(d => d.vague),
    future: priority.some(d => d.future),
  };
  if (!matches.length) {
    const legacy = dateOf(raw, today);
    if (legacy.explicit) Object.assign(info, legacy);
  }
  if (/쯤/.test(raw)) { info.date = null; info.vague = true; info.explicit = true; }
  return { info, expressions: matches.map(m => m[0]), core: raw.replace(expressions, " ").replace(/\s+/g, " ").trim() };
}
