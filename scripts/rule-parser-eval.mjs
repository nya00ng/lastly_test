import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import ts from "typescript";
import assert from "node:assert/strict";
import { Garu } from "garu-ko";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cache = new Map();
async function load(path) {
  if (cache.has(path)) return cache.get(path);
  let source = ts.transpileModule(await readFile(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  for (const [statement, specifier] of [...source.matchAll(/from "([.@][^"]+)"/g)]) {
    const dependency = resolve(specifier.startsWith("@/") ? root : dirname(path), specifier.replace(/^@\//, "")) + ".ts";
    source = source.replace(statement, `from "${await load(dependency)}"`);
  }
  const url = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
  cache.set(path, url); return url;
}
const { parseRule } = await import(await load(resolve(root, "lib/rule-parser/engine.ts")));
const { guardedMatches } = await import(await load(resolve(root, "lib/rule-parser/matching.ts")));
const { allRuleCases, extractionRubric } = await import(await load(resolve(root, "lib/rule-parser/evaluation.ts")));
const { calculateRecordCandidate } = await import(await load(resolve(root, "lib/ai/candidate.ts")));
const { validateParserOutput } = await import(await load(resolve(root, "lib/ai/schema.ts")));
const start = performance.now();
const useKiwi = process.argv.includes("--kiwi");
let garu;
let analyze;
if (useKiwi) {
  const { KiwiBuilder } = await import("../output/rule-parser/node_modules/kiwi-nlp/dist/index.js");
  const builder = await KiwiBuilder.create(resolve(root,"output/rule-parser/node_modules/kiwi-nlp/dist/kiwi-wasm.wasm"));
  const modelFiles = {};
  for (const folder of ["cong/base"]) {
    const dir = resolve(root,"output/rule-parser/kiwi/models",folder);
    for (const name of await readdir(dir)) modelFiles[name] = new Uint8Array(await readFile(resolve(dir,name)));
  }
  const kiwi = await builder.build({modelFiles, modelType:"cong"});
  analyze = text => kiwi.analyze(text).tokens.map(t=>({text:t.str,pos:t.tag.replace(/-[RI]$/,""),start:t.position,end:t.position+t.length}));
} else {
  garu = await Garu.load();
  analyze = text => garu.analyze(text).tokens;
}
const initializationMs = performance.now() - start;
const today = "2026-09-17";
const rows = allRuleCases.map(c => {
  const t = performance.now(); const parsed = parseRule(c.text, analyze, today); const ms = performance.now() - t;
  const segment = parsed.output.segments[0]; const d = parsed.diagnostics[0];
  const match = guardedMatches(segment.normalized_action, d, analyze);
  const intentCorrect = segment.intent === c.intent;
  const rubric = extractionRubric[c.text] || (c.target ? {targets:[c.target],actions:[c.action]} : null);
  const targetCorrect = rubric === null ? null : rubric.targets.some(t=>d.target.replace(/\s/g, "") === t.replace(/\s/g, ""));
  const actionCorrect = rubric === null ? null : rubric.actions.includes(d.action);
  const candidate = calculateRecordCandidate(segment, today).recordCandidate;
  return { ...c, parsed, match, ms, intentCorrect, targetCorrect, actionCorrect, candidate, newItemCandidate: candidate && match.noMatch, schema: validateParserOutput(parsed.output), error: !intentCorrect ? "Intent rule or morphology failure" : targetCorrect === false ? "Target extraction failure" : actionCorrect === false ? "Action extraction failure" : null };
});
const group = key => Object.fromEntries([...new Set(rows.map(r => r[key]))].map(g => {const rs=rows.filter(r=>r[key]===g); return [g,{correct:rs.filter(r=>r.intentCorrect).length,total:rs.length}];}));
const conflicts = ["신발 방수스프레이 뿌렸어", "정수기 필터 청소했어"].map(text => {const p=parseRule(text,analyze,today);return {text,...guardedMatches(p.output.segments[0].normalized_action,p.diagnostics[0],analyze)};});
const dates = ["오늘 수건 빨았어", "어제 수건 빨았어", "그저께 수건 빨았어", "3일 전에 수건 빨았어", "지난주 수건 빨았어", "내일 수건 빨았어"].map(text=>({text,...parseRule(text,analyze,today)}));
const multi = ["신발 빨고 화분에 물 줬어", "수건 빨고 문 열고 상자 닫고 매트 털고 텐트 접었어", "수건 빨고 문 열고 상자 닫고 매트 털고 텐트 접고 그릇 씻었어"].map(text=>({text,...parseRule(text,analyze,today)}));
const report={package:"garu-ko@0.9.17",engineSha256:createHash("sha256").update(await readFile(resolve(root,"lib/rule-parser/engine.ts"))).digest("hex"),initializationMs,groups:group("group"),intents:group("intent"),warmMeanMs:rows.reduce((s,r)=>s+r.ms,0)/rows.length,batch100Ms:rows.filter(r=>r.group==="combinatorial").reduce((s,r)=>s+r.ms,0),falseCandidates:rows.filter(r=>r.intent!=="COMPLETED"&&r.candidate).map(r=>r.text),extraction:{total:rows.filter(r=>r.target!==undefined).length,target:rows.filter(r=>r.targetCorrect===true).length,action:rows.filter(r=>r.actionCorrect===true).length},memory:process.memoryUsage(),conflicts,dates,multi,rows};
await mkdir(resolve(root,"output/rule-parser"),{recursive:true});
report.package = useKiwi ? "kiwi-nlp@0.24.0" : "garu-ko@0.9.17";
report.extraction.total = rows.filter(r=>r.targetCorrect!==null).length;
report.newItemSemanticAccuracy = {correct: rows.filter(r=>r.group==="core"&&r.intent==="COMPLETED"&&r.newItemCandidate&&r.targetCorrect&&r.actionCorrect).length,total:12};
report.holdoutFull = {correct: rows.filter(r=>r.group==="holdout"&&r.intentCorrect&&r.targetCorrect!==false&&r.actionCorrect!==false).length,total:30};
report.schemaFailures = rows.filter(r=>!r.schema.ok).length;
report.harnessChecks = "PASS";
assert.equal(rows.length, 168);
assert.equal(report.schemaFailures, 0);
assert.equal(multi[2].output.result_type, "TOO_MANY_ACTIONS");
assert.equal(multi[2].output.segments.length, 0);
assert.equal(conflicts.every(c=>c.candidates.length===0),true);
assert.equal(rows.filter(r=>r.parsed.output.segments[0].intent!=="COMPLETED").every(r=>!r.candidate),true);
assert.equal(dates.slice(-2).every(r=>!calculateRecordCandidate(r.output.segments[0],today).recordCandidate),true);
const engineSource = await readFile(resolve(root,"lib/rule-parser/engine.ts"),"utf8");
for (const c of allRuleCases) assert.equal(engineSource.includes(c.text),false,"evaluation input must not be a rule");
report.qualityGate = rows.every(r=>r.intentCorrect&&r.targetCorrect!==false&&r.actionCorrect!==false)&&report.falseCandidates.length===0 ? "PASS" : "FAIL";
report.additionalSafetyProbe = ["신발 빨려고 했어", "약 먹었다고 말했어", "신발 빨았으면 좋겠어", "화분에 물 주지 않았어", "신발 안 빨고 창문 열었어"].map(text=>{
  const p=parseRule(text,analyze,today);
  return {text,...p,candidates:p.output.segments.map(s=>calculateRecordCandidate(s,today))};
});
report.queryResolutionProbe = ["신발 언제 빨았어", "렌즈교체 언제 했어", "정수기 필터 언제 갈았어", "언제했어"].map(text=>{
  const p=parseRule(text,analyze,today);
  return {text,...p,matching:guardedMatches(p.output.segments[0].normalized_action,p.diagnostics[0],analyze)};
});
await writeFile(resolve(root,`output/rule-parser/${useKiwi ? "kiwi" : "garu"}-results.json`),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,rows:undefined,dates:undefined,multi:multi.map(r=>({text:r.text,result:r.output.result_type,count:r.output.segments.length})),conflicts},null,2));
garu?.destroy();
