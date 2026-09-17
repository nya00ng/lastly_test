import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import ts from "typescript";
import { Garu } from "garu-ko";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const cache=new Map();
async function url(path){
  if(cache.has(path)) return cache.get(path);
  let source=ts.transpileModule(await readFile(path,"utf8"),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  for(const [statement,specifier] of [...source.matchAll(/from "([.@][^"]+)"/g)]) source=source.replace(statement,`from "${await url(resolve(specifier.startsWith("@/")?root:dirname(path),specifier.replace(/^@\//,""))+".ts")}"`);
  const value=`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;cache.set(path,value);return value;
}
const load=async name=>import(await url(resolve(root,`lib/${name}.ts`)));
const {parseRuleV2}=await load("rule-parser/engine-v2");
const {parseRule}=await load("rule-parser/engine");
const {safeMatches,comparisonKey}=await load("rule-parser/matching-v2");
const {allRuleCases,extractionRubric}=await load("rule-parser/evaluation");
const {v2Controls,safetyHoldout,queryMatchCases}=await load("rule-parser/evaluation-v2");
const {calculateRecordCandidate}=await load("ai/candidate");
const {validateParserOutput}=await load("ai/schema");
const {demoItems}=await load("demo-data");
const start=performance.now();const garu=await Garu.load();const initMs=performance.now()-start;
const analyze=text=>garu.analyze(text).tokens;const today="2026-09-17";
const cases=[...allRuleCases.map(c=>({...c,expected:[c.intent],noCandidate:c.intent!=="COMPLETED"})),...v2Controls,...safetyHoldout,...queryMatchCases];
const rows=cases.map(c=>{
  const t=performance.now();const parsed=parseRuleV2(c.text,analyze,today);const ms=performance.now()-t;
  const s=parsed.output.segments[0],d=parsed.diagnostics[0];const matching=safeMatches(d,analyze);
  const candidate=calculateRecordCandidate(s,today).recordCandidate;
  const rubric=extractionRubric[c.text]||(c.target?{targets:[c.target],actions:[c.action]}:null);
  const targetCorrect=rubric?rubric.targets.some(v=>comparisonKey(v)===comparisonKey(d.target)):null;
  const actionCorrect=rubric?rubric.actions.includes(d.action):null;
  const matchCorrect=c.expectedMatch===undefined?null:c.expectedMatch===null?matching.candidates.length===0:matching.candidates.some(v=>v.name===c.expectedMatch);
  const newItemCandidate=candidate&&d.confidence==="HIGH"&&matching.candidates.length===0;
  const criticalCompletion=!c.expected.includes("COMPLETED")&&s.intent==="COMPLETED";
  return {...c,parsed,ms,matching,candidate,newItemCandidate,intentCorrect:c.expected.includes(s.intent),targetCorrect,actionCorrect,matchCorrect,criticalCompletion,
    v1Intent:parseRule(c.text,analyze,today).output.segments[0].intent,schema:validateParserOutput(parsed.output)};
});
const groups=Object.fromEntries([...new Set(rows.map(r=>r.group))].map(g=>{const rs=rows.filter(r=>r.group===g);return [g,{correct:rs.filter(r=>r.intentCorrect).length,total:rs.length,critical:rs.filter(r=>r.criticalCompletion).length}];}));
const conflicts=["신발 교체했어","정수기 필터 청소했어","신발 방수스프레이 뿌렸어","화분 분갈이했어"].map(text=>{
  const fixture={...demoItems[0],id:"temporary-plant",name:"화분 물주기",tags:[],note:null,history:[{id:"temporary",dateLabel:today,actionLabel:"화분 물주기"}]};
  const p=parseRuleV2(text,analyze,today);return {text,...safeMatches(p.diagnostics[0],analyze,[...demoItems,fixture])};
});
const duplicate={...demoItems.find(i=>i.id==="shoes"),id:"temporary-shoes",name:"신발 빨래",history:[{id:"temporary",dateLabel:today,actionLabel:"신발 세탁"}]};
const ambiguousDiagnostic=parseRuleV2("신발 언제 빨았어",analyze,today).diagnostics[0];
const ambiguous=safeMatches(ambiguousDiagnostic,analyze,[duplicate,{...duplicate,id:"temporary-shoes-2",name:"신발 빨래 별도"}]);
const dates=["오늘 수건 빨았어","어제 수건 빨았어","그저께 수건 빨았어","3일 전에 수건 빨았어","지난주 수건 빨았어","내일 수건 빨았어"].map(text=>({text,...parseRuleV2(text,analyze,today)}));
const multi=["신발 빨고 화분에 물 줬어","수건 빨고 문 열고 상자 닫고 매트 털고 텐트 접었어","수건 빨고 문 열고 상자 닫고 매트 털고 텐트 접고 그릇 씻었어"].map(text=>({text,...parseRuleV2(text,analyze,today)}));
const criticalRows=rows.filter(r=>r.criticalCompletion||r.noCandidate&&r.candidate);
const report={version:"V2",package:"garu-ko@0.9.17",initMs,meanMs:rows.reduce((s,r)=>s+r.ms,0)/rows.length,batch100Ms:rows.filter(r=>r.group==="combinatorial").reduce((s,r)=>s+r.ms,0),groups,
  metrics:{criticalFalseCompletion:criticalRows.length,queryToRecord:rows.filter(r=>r.expected.includes("QUERY")&&(r.candidate||r.parsed.output.segments[0].intent==="COMPLETED")).length,
    negativeToCompleted:rows.filter(r=>r.expected.length===1&&r.expected[0]==="NOT_COMPLETED"&&r.criticalCompletion).length,
    plannedToCompleted:rows.filter(r=>r.expected.length===1&&r.expected[0]==="PLANNED"&&r.criticalCompletion).length,
    uncertainToCompleted:rows.filter(r=>r.expected.length===1&&r.expected[0]==="UNCERTAIN"&&r.criticalCompletion).length,
    actionConflictCandidates:conflicts.filter(c=>c.candidates.length).length,actionConflictAutoMatch:conflicts.filter(c=>c.autoMatch).length,
    wrongExistingCandidates:rows.filter(r=>r.matchCorrect===false).length,wrongExistingAutoMatch:rows.filter(r=>r.matchCorrect===false&&r.matching.autoMatch).length,
    target:{correct:rows.filter(r=>r.targetCorrect===true).length,total:rows.filter(r=>r.targetCorrect!==null).length},action:{correct:rows.filter(r=>r.actionCorrect===true).length,total:rows.filter(r=>r.actionCorrect!==null).length},
    newItemUsable:{correct:rows.filter(r=>r.group==="core"&&r.intent==="COMPLETED"&&r.newItemCandidate&&r.targetCorrect&&r.actionCorrect).length,total:12},
    clarificationRate:rows.filter(r=>r.parsed.output.segments[0].needs_clarification).length/rows.length},
  criticalRows,conflicts,ambiguous,dates,multi,rows};
report.ruleHash=createHash("sha256").update(await readFile(resolve(root,"lib/rule-parser/engine-v2.ts"))).update(await readFile(resolve(root,"lib/rule-parser/safety-v2.ts"))).digest("hex");
assert.ok(safetyHoldout.length>=50);assert.ok(rows.every(r=>r.schema.ok));
assert.equal(multi[2].output.result_type,"TOO_MANY_ACTIONS");assert.equal(multi[2].output.segments.length,0);
assert.equal(multi[0].output.segments.length,2);assert.equal(multi[1].output.segments.length,5);
assert.equal(ambiguous.confidence,"AMBIGUOUS");assert.equal(ambiguous.selectedItemId,null);
for(const [a,b] of [["렌즈교체","렌즈 교체"],["정수기필터","정수기 필터"],["에어컨필터","에어컨 필터"],["신발세탁","신발 세탁"]]) assert.equal(comparisonKey(a),comparisonKey(b));
assert.deepEqual(dates.slice(0,4).map(d=>d.output.segments[0].performed_date),["2026-09-17","2026-09-16","2026-09-15","2026-09-14"]);
assert.ok(dates.slice(4).every(d=>!calculateRecordCandidate(d.output.segments[0],today).recordCandidate));
assert.ok(rows.every(r=>r.matching.selectedItemId===null&&!r.matching.autoMatch));
assert.ok(rows.filter(r=>r.parsed.diagnostics[0].confidence!=="HIGH").every(r=>!r.candidate&&!r.parsed.diagnostics[0].canonical_action));
const source=(await readFile(resolve(root,"lib/rule-parser/engine-v2.ts"),"utf8"))+(await readFile(resolve(root,"lib/rule-parser/safety-v2.ts"),"utf8"));
for(const c of cases) assert.ok(!source.includes(c.text));
report.harness="PASS";report.qualityGate=criticalRows.length||report.metrics.actionConflictCandidates||report.metrics.wrongExistingCandidates?"FAIL":"MANUAL_DEVICE_REQUIRED";
await mkdir(resolve(root,"output/rule-parser-v2"),{recursive:true});
await writeFile(resolve(root,"output/rule-parser-v2/results.json"),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,rows:undefined,criticalRows:criticalRows.map(r=>({text:r.text,intent:r.parsed.output.segments[0].intent,candidate:r.candidate})),dates:undefined,multi:undefined},null,2));garu.destroy();
if(report.qualityGate==="FAIL") process.exitCode=1;
