import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import ts from "typescript";
import { Garu } from "garu-ko";

const root = process.cwd(), cache = new Map();
async function url(path) {
  if (cache.has(path)) return cache.get(path);
  let source = ts.transpileModule(await readFile(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  for (const [statement, specifier] of [...source.matchAll(/from "([.@][^"]+)"/g)]) {
    source = source.replace(statement, `from "${await url(resolve(specifier.startsWith("@/") ? root : dirname(path), specifier.replace(/^@\//, "")) + ".ts")}"`);
  }
  const value = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
  cache.set(path, value); return value;
}
const load = async name => import(await url(resolve(root, `lib/${name}.ts`)));
const { prepareProductRule } = await load("rule-parser/product-pipeline");
const { validateRulePilot } = await load("ai/rule-pilot");
const { isIsoDate } = await load("ai/date");
const { appendDemoActivities, deriveTrackedItem } = await load("demo-activity");
const { matchConfirmationAction } = await load("confirmation-matching");
const { matchDemoItems } = await load("ai/demo-matching");
const { resolveDemoQuery } = await load("demo-query");
const { demoItems } = await load("demo-data");
const { buildMonthEvents } = await load("month-view");
const g = await Garu.load(), today = "2026-09-17", analyze = text => g.analyze(text).tokens;
const parsed = (text, items = demoItems) => {
  const p = prepareProductRule(text, analyze, today, items);
  const r = validateRulePilot(text, p.output, p.confidences, today);
  assert.ok(r.ok);
  return { ...r, segments: r.segments.map((s, i) => ({ ...s, item_match: { candidates: p.matching[i].candidates, needs_review: p.matching[i].candidates.length > 1 } })) };
};
const past = parsed("2026년 8월 1일 신발 빨았어").segments[0];
assert.equal(past.performed_date, "2026-08-01");
assert.equal(past.date_resolution_source, "EXPLICIT");
assert.equal(past.date_precision, "EXACT");
assert.equal(past.record_candidate, true);
for (const input of ["2099년 1월 1일 신발 빨았어", "2026-02-30 신발 빨았어", "2026년 4월 31일 신발 빨았어"]) {
  const s = parsed(input).segments[0]; assert.equal(s.record_candidate, false, input); assert.equal(s.needs_clarification, true);
}
for (const [date, valid] of [["2026-02-28", true], ["2026-02-29", false], ["2028-02-29", true], ["2026-02-30", false], ["2026-04-31", false]]) {
  assert.equal(isIsoDate(date), valid, date);
  const proposal = { schema_version: "1.0", prompt_version: "1.1", result_type: "OK", overflow_detected: false, segments: [{ ...past, performed_date: date }] };
  assert.equal(validateRulePilot("test", proposal, ["HIGH"], "2028-03-01").segments[0].record_candidate, valid);
}

const shoes = { ...demoItems.find(i => i.id === "shoes"), cycle: { unit: "day", interval: 30 } };
const entry = date => ({ id: date, dateLabel: date, actionLabel: "신발 세탁" });
const draft = (date, itemId = shoes.id, action = "신발 세탁") => ({ action, itemId, category: "생활", performedDate: date,
  selectedTags: [], datePrecision: "EXACT", dateResolutionSource: "EXPLICIT" });
for (const [existing, added] of [["2026-08-20", "2026-08-01"], ["2026-08-01", "2026-08-20"], ["2026-08-20", "2026-08-20"]]) {
  const next = appendDemoActivities([{ ...shoes, history: [entry(existing)] }], [draft(added)], today);
  assert.equal(next[0].lastPerformedDateLabel, "2026-08-20");
  assert.equal(next[0].nextDueDate, "2026-09-19"); assert.equal(next[0].status, "UPCOMING");
  assert.equal(next[0].history.length, 2);
  assert.equal(buildMonthEvents(next, "2026-09").find(e => e.type === "DUE").date, "2026-09-19");
}
const unsorted = { ...shoes, history: ["2026-08-01", "2026-08-20", "2026-08-09"].map(entry) };
assert.equal(deriveTrackedItem(unsorted, today).lastPerformedDateLabel, "2026-08-20");
const a = { ...shoes, id: "A", history: [entry("2026-08-01")] }, b = { ...shoes, id: "B", history: [entry("2026-08-20")] };
const snapshot = JSON.stringify([a, b]);
const saved = appendDemoActivities([a, b], [draft("2026-09-01", "B")], today);
assert.equal(saved[0].history.length, 1); assert.equal(saved[1].history.length, 2);
assert.equal(JSON.stringify([a, b]), snapshot);
const query = parsed("신발 언제 빨았어", [a, b]).segments[0];
assert.equal(resolveDemoQuery(query, [a, b]).type, "AMBIGUOUS");
assert.equal(resolveDemoQuery(query, [a, b], "B").item.id, "B");
assert.equal(resolveDemoQuery(query, [a, b], "missing").type, "NOT_FOUND");
assert.equal(matchDemoItems("신발 세탁", [a, b]).length, 2);

const tag = parsed("아빠 이불 언제 빨았어").segments[0];
assert.equal(tag.intent, "QUERY"); assert.equal(tag.record_candidate, false);
assert.equal(tag.item_match.candidates[0].itemId, "bedding");
assert.equal(tag.item_match.candidates[0].matchType, "EXACT_TAG");
assert.equal(resolveDemoQuery(tag, demoItems).type, "FOUND");
assert.equal(parsed("아빠 이불 교체 언제 했어").segments[0].item_match.candidates.length, 0);
assert.equal(matchConfirmationAction("신발 교체", [shoes]).length, 0);
assert.equal(matchConfirmationAction("신발 세탁", [a, b]).length, 2);
assert.equal(appendDemoActivities([shoes], [draft(today, shoes.id, "신발 교체")], today), null);
assert.equal(appendDemoActivities([shoes], [draft("2026-02-30")], today), null);
assert.equal(appendDemoActivities([shoes], [draft("2099-01-01")], today), null);
assert.equal(appendDemoActivities([shoes], [draft(today, "deleted")], today), null);
assert.equal(appendDemoActivities([shoes], [draft(today), draft("2026-02-30")], today), null);
const created = appendDemoActivities([shoes], [draft(today, null, "신발 교체")], today);
assert.equal(created.length, 2); assert.equal(created[0].history.length, shoes.history.length);
for (const text of ["신발 안 빨았어", "신발 빨려고 했어", "가습기 말렸나 기억 안 나", "신발 언제 빨았어"]) {
  assert.equal(parsed(text).segments[0].record_candidate, false, text);
}
g.destroy();
console.log("Product integrity A-H: PASS (dates, history/cycle, ID write/query, tag/action, stale-save, atomicity)");
