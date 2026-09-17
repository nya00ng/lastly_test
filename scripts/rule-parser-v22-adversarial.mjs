import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { createHash } from "node:crypto";
import ts from "typescript";
import { Garu } from "garu-ko";

// Independent acceptance criteria. No parser corrections are made by this runner.
const cases = [];
const add = (group, text, expected) => cases.push({ group, text, expected });
for (const text of ["저는 오늘 화분에 물을 줬어요!", "아 맞다, 내가 어제 신발을 빨았어.", "생각해보니 나는 칼을 갈았어~", "참 제가 정수기 필터를 갈았어요", "음… 오늘은 제가 렌즈를 교체했어요", "오늘 제가 화장실을 청소했습니다."]) add("clear-completion", text, { intent: "COMPLETED", candidate: true });
for (const text of ["난 오늘 신발을 안 빨았어!", "아 맞다 화분에 물 못 줬어", "저는 렌즈를 교체하지 않았어요", "나 신발 빨았어 아니 안 빨았어", "오늘 화분물안줬어", "신발을 빨지는 않았어"]) add("negative", text, { noCandidate: true, intent: "NOT_COMPLETED" });
for (const text of ["나 아마 화분에 물 줬어", "신발 빨았던 것 같아", "화분에 물 줬는지 모르겠어", "내가 렌즈를 갈았나?", "정수기 필터 갈았을 수도 있어", "화분에 물 준 줄 알았어"]) add("uncertain", text, { noCandidate: true });
for (const text of ["나 내일 신발 빨 거야", "화분에 물 주려고 했어", "신발을 빨 뻔했어", "렌즈를 갈아야겠어", "다음 달에 정수기 필터 갈 거야", "내가 화분 물 주면 좋겠어"]) add("planned-or-nonassertion", text, { noCandidate: true });
add("date", "저는 2026년 9월 16일 신발을 빨았어요", { candidate: true, dates: ["2026-09-16"] });
add("date", "나는 이틀 전에 화분에 물 줬어", { allowedCandidateDates: ["2026-09-15"] });
add("date", "나는 지난달에 신발 빨았어", { noCandidate: true });
add("date", "나 2099년 1월 1일 렌즈 갈았어", { noCandidate: true });
add("date", "나 2026년 2월 30일 화분에 물 줬어", { noCandidate: true });
add("date", "어제 아니 오늘 화분에 물 줬어", { allowedCandidateDates: ["2026-09-17"] });
for (const text of ["아이가 화분에 물 줬어", "남편이 신발을 빨았어", "엄마가 렌즈를 갈았다고 했어", "나는 아빠가 필터 갈았다고 들었어", "아빠는 신발을 빨았대", "친구가 화분에 물 줬는지 모르겠어"]) add("third-person-or-reported", text, { noCandidate: true });
add("multi", "나 어제 신발 빨고 화분에 물 줬어", { segments: 2, candidates: [true, true], dates: ["2026-09-16", "2026-09-16"] });
add("multi", "어제 신발 빨고 오늘 화분에 물 줬어", { segments: 2, candidates: [true, true], dates: ["2026-09-16", "2026-09-17"] });
add("multi", "나 화분에 물 줬고 신발은 안 빨았어", { segments: 2, candidates: [true, false] });
add("multi", "내일 신발 빨고 화분에 물 줄 거야", { noCandidate: true });
add("multi", "신발 빨고 화분에 물 줬는지 모르겠어", { noCandidate: true });
add("multi", "저는 수건 빨고 문 열고 상자 닫고 매트 털고 텐트 접고 그릇 씻었어", { segments: 0, resultType: "TOO_MANY_ACTIONS" });
for (const [text, forbidden] of [["나 신발을 교체했어", "shoes"], ["정수기 필터를 청소했어", "water-filter"], ["아 칼을 갈았어", "toothbrush"], ["커피를 갈았어", "lens"], ["그릇을 씻었어", "shoes"], ["아빠 이불 교체 언제 했어?", "bedding"]]) add("action-compatibility", text, { forbidden });
for (const text of ["아 맞다 신발 언제 빨았더라?", "나는 정수기 필터 마지막으로 언제 갈았지?", "음 렌즈 언제 교체했어요?", "아빠 이불 언제 빨았지?", "언제 했더라?", "마지막으로 한 게 언제였지?"]) add("query", text, { intent: "QUERY", noCandidate: true });

const root = process.cwd(), cache = new Map();
async function url(path) {
  if (cache.has(path)) return cache.get(path);
  let source = ts.transpileModule(await readFile(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  for (const [statement, specifier] of [...source.matchAll(/from "([.@][^"]+)"/g)]) source = source.replace(statement, `from "${await url(resolve(specifier.startsWith("@/") ? root : dirname(path), specifier.replace(/^@\//, "")) + ".ts")}"`);
  const value = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`; cache.set(path, value); return value;
}
const load = async name => import(await url(resolve(root, `lib/${name}.ts`)));
const { prepareProductRule } = await load("rule-parser/product-pipeline");
const { validateRulePilot } = await load("ai/rule-pilot");
const useV23=process.env.RULE_ENGINE==="v23";
const parseRuleV22 = useV23 ? (await load("rule-parser/engine-v23")).parseRuleV23 : (await load("rule-parser/engine-v22")).parseRuleV22;
const { demoItems } = await load("demo-data");
const g = await Garu.load(), analyze = text => g.analyze(text).tokens, today = "2026-09-17";
const before = JSON.stringify(demoItems);
const rows = cases.map(c => {
  try {
    const p = prepareProductRule(c.text, analyze, today, demoItems);
    const r = validateRulePilot(c.text, p.output, p.confidences, today);
    const d = parseRuleV22(c.text, analyze, today);
    const failures = [], e = c.expected, segments = r.ok ? r.segments : [];
    if (!r.ok) failures.push("SCHEMA_OR_VALIDATION");
    if (e.resultType && r.result_type !== e.resultType) failures.push("OVERFLOW");
    if (e.segments !== undefined && segments.length !== e.segments) failures.push("SEGMENT_COUNT");
    if (e.intent && segments.some(s => s.intent !== e.intent)) failures.push("INTENT");
    if (e.candidate && (segments.length !== 1 || !segments[0].record_candidate)) failures.push("MISSED_COMPLETION");
    if (e.noCandidate && segments.some(s => s.record_candidate)) failures.push("UNSAFE_CANDIDATE");
    if (e.dates && JSON.stringify(segments.map(s => s.performed_date)) !== JSON.stringify(e.dates)) failures.push("WRONG_DATE");
    if (e.allowedCandidateDates && segments.some(s => s.record_candidate && !e.allowedCandidateDates.includes(s.performed_date))) failures.push("WRONG_CANDIDATE_DATE");
    if (e.candidates && JSON.stringify(segments.map(s => s.record_candidate)) !== JSON.stringify(e.candidates)) failures.push("MIXED_CANDIDATES");
    if (e.forbidden && p.matching.some(m => m.candidates.some(v => v.itemId === e.forbidden))) failures.push("WRONG_MATCH");
    if (segments.some(s => !s.original_text || !c.text.includes(s.original_text))) failures.push("SOURCE_LOSS");
    return { ...c, failures, segments, matching: p.matching, names: p.names, core: d.utterance.coreClause };
  } catch (error) { return { ...c, failures: ["THREW"], error: String(error) }; }
});
const summary = { total: rows.length, passed: rows.filter(r => !r.failures.length).length, failed: rows.filter(r => r.failures.length).length,
  unsafeCandidates: rows.filter(r => r.failures.includes("UNSAFE_CANDIDATE")).length,
  wrongCandidateDates: rows.filter(r => r.failures.includes("WRONG_CANDIDATE_DATE")).length,
  wrongMatches: rows.filter(r => r.failures.includes("WRONG_MATCH")).length,
  demoDataUnchanged: JSON.stringify(demoItems) === before };
const sources = await Promise.all(["utterance", "engine-v22", "engine-v21", "safety-v2",...(useV23?["engine-v23","grammar-v23","date-v23"]:[])].map(n => readFile(`lib/rule-parser/${n}.ts`, "utf8")));
const directory=useV23?"output/rule-parser-v23":"output/rule-parser-v22";
await mkdir(directory, { recursive: true });
await writeFile(`${directory}/adversarial.json`, JSON.stringify({ today, summary, sourceHash: createHash("sha256").update(sources.join("\n")).digest("hex"), rows }, null, 2));
console.log(JSON.stringify({ summary, failed: rows.filter(r => r.failures.length).map(r => ({ text: r.text, failures: r.failures, actual: r.segments?.map(s => ({ intent: s.intent, candidate: s.record_candidate, action: s.normalized_action, date: s.performed_date })) })) }, null, 2));
g.destroy();
if (summary.failed || !summary.demoDataUnchanged) process.exitCode = 1;
