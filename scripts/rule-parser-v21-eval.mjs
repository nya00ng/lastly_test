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
  if(cache.has(path))return cache.get(path);
  let source=ts.transpileModule(await readFile(path,"utf8"),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  for(const [statement,specifier] of [...source.matchAll(/from "([.@][^"]+)"/g)])source=source.replace(statement,`from "${await url(resolve(specifier.startsWith("@/")?root:dirname(path),specifier.replace(/^@\//,""))+".ts")}"`);
  const value=`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;cache.set(path,value);return value;
}
const load=async name=>import(await url(resolve(root,`lib/${name}.ts`)));
const useV22=process.env.RULE_ENGINE==="v22";
const useV23=process.env.RULE_ENGINE==="v23";
const parseRuleV21=useV23?(await load("rule-parser/engine-v23")).parseRuleV23:useV22?(await load("rule-parser/engine-v22")).parseRuleV22:(await load("rule-parser/engine-v21")).parseRuleV21;
const {contextualMatches,comparisonKey}=await load("rule-parser/matching-v21");
const {allRuleCases,extractionRubric}=await load("rule-parser/evaluation");
const {v2Controls,safetyHoldout,queryMatchCases}=await load("rule-parser/evaluation-v2");
const {contextHoldout,targetedCases}=await load("rule-parser/evaluation-v21");
const {calculateRecordCandidate}=await load("ai/candidate");
const {validateParserOutput}=await load("ai/schema");
const {demoItems}=await load("demo-data");
const original=[...allRuleCases.map(c=>({...c,expected:[c.intent]})),...v2Controls,...safetyHoldout,...queryMatchCases];
const oldTexts=new Set(original.map(c=>c.text));
const unseen=contextHoldout.filter(c=>!oldTexts.has(c.text)).map(c=>({...c,
  expectedMatch:c.target==="칫솔"?"칫솔 교체":c.target==="정수기 필터"?"정수기 필터":null}));
assert.ok(new Set(unseen.map(c=>c.text)).size>=80);
const t=performance.now();const garu=await Garu.load();const initMs=performance.now()-t;
const analyze=text=>garu.analyze(text).tokens;const today="2026-09-17";
const rows=[...original.map(c=>({...c,corpus:"v2-251"})),...targetedCases.map(c=>({...c,corpus:"targeted"})),...unseen.map(c=>({...c,corpus:"unseen"}))].map(c=>{
  const start=performance.now();const parsed=parseRuleV21(c.text,analyze,today);const d=parsed.diagnostics[0],s=parsed.output.segments[0];
  const matching=contextualMatches(d,analyze);const candidate=calculateRecordCandidate(s,today).recordCandidate;
  const rubric=c.target?{targets:[c.target],actions:c.actions||[c.action]}:extractionRubric[c.text];
  const targetCorrect=rubric?rubric.targets.some(v=>comparisonKey(v)===comparisonKey(d.target)):null;
  const actionCorrect=rubric?rubric.actions.includes(d.action):null;
  const matchCorrect=c.expectedMatch===undefined?null:c.expectedMatch===null?!matching.candidates.length:matching.candidates.length>0&&matching.candidates.every(v=>v.name===c.expectedMatch);
  return {...c,parsed,matching,candidate,targetCorrect,actionCorrect,matchCorrect,ms:performance.now()-start,
    critical:!c.expected.includes("COMPLETED")&&(candidate||s.intent==="COMPLETED"),intentCorrect:c.expected.includes(s.intent),
    newItemCandidate:candidate&&!matching.candidates.length&&d.confidence==="HIGH",schema:validateParserOutput(parsed.output)};
});
// Competing same-target items deliberately exist only in this test.
const probePairs=[["칼 갈았어","칼 교체"],["커피 갈았어","커피 교체"],["그릇 씻었어","그릇 세탁"],["창문 닦았어","창문 세탁"],["신발 교체했어","신발 세탁"],["정수기 필터 청소했어","정수기 필터 교체"]];
const conflicts=probePairs.map(([text,name])=>{
 const p=parseRuleV21(text,analyze,today);const item={...demoItems[0],id:"test-only",name,history:[{id:"test",dateLabel:today,actionLabel:name}]};
 return {text,name,...contextualMatches(p.diagnostics[0],analyze,[item])};
});
const duplicate={...demoItems.find(i=>i.id==="shoes"),id:"test-1"};
const ambiguous=contextualMatches(parseRuleV21("신발 빨았어",analyze,today).diagnostics[0],analyze,[duplicate,{...duplicate,id:"test-2"}]);
assert.equal(ambiguous.confidence,"AMBIGUOUS");
const core=rows.filter(r=>r.corpus==="v2-251"&&r.group==="core"&&r.expected[0]==="COMPLETED");
const usable=core.filter(r=>r.newItemCandidate&&r.targetCorrect&&r.actionCorrect);
const wrongNames=rows.filter(r=>r.newItemCandidate&&(r.targetCorrect===false||r.actionCorrect===false));
const highWrong=(key)=>rows.filter(r=>r.parsed.diagnostics[0].confidence==="HIGH"&&r[key]===false);
const metrics={criticalFalseCompletion:rows.filter(r=>r.critical).length,
 queryToRecord:rows.filter(r=>r.expected[0]==="QUERY"&&r.critical).length,
 negativeToCompleted:rows.filter(r=>r.expected[0]==="NOT_COMPLETED"&&r.critical).length,
 plannedToCompleted:rows.filter(r=>r.expected[0]==="PLANNED"&&r.critical).length,
 uncertainToCompleted:rows.filter(r=>r.expected[0]==="UNCERTAIN"&&r.critical).length,
 HIGH_CONFIDENCE_WRONG_ACTION:highWrong("actionCorrect").length,HIGH_CONFIDENCE_WRONG_TARGET:highWrong("targetCorrect").length,
 HIGH_CONFIDENCE_WRONG_MATCH:highWrong("matchCorrect").length+conflicts.filter(c=>c.candidates.length).length,
 wrongExistingAutoMatch:rows.filter(r=>r.matching.autoMatch||r.matching.selectedItemId!==null).length,
 conflictCandidates:conflicts.filter(c=>c.candidates.length).length,
 newItem:{usable:usable.length,clarification:core.filter(r=>!r.newItemCandidate).length,wrongName:core.filter(r=>r.newItemCandidate&&(!r.targetCorrect||!r.actionCorrect)).length,total:core.length},
 wrongNames:wrongNames.map(r=>({text:r.text,name:r.parsed.diagnostics[0].suggestedItemName})),
 clarification:rows.filter(r=>r.parsed.output.segments[0].needs_clarification).length,total:rows.length};
const multi=["신발 빨고 화분에 물 줬어","수건 빨고 문 열고 상자 닫고 매트 털고 텐트 접었어","수건 빨고 문 열고 상자 닫고 매트 털고 텐트 접고 그릇 씻었어"].map(s=>parseRuleV21(s,analyze,today));
assert.deepEqual(multi.map(p=>p.output.segments.length),[2,5,0]);assert.equal(multi[2].output.result_type,"TOO_MANY_ACTIONS");
assert.ok(rows.every(r=>r.schema.ok));assert.ok(rows.every(r=>!r.matching.autoMatch&&r.matching.selectedItemId===null));
assert.ok(rows.filter(r=>r.parsed.diagnostics[0].confidence!=="HIGH").every(r=>!r.candidate&&!r.parsed.diagnostics[0].canonical_action));
const source=(await Promise.all(["engine-v21","matching-v21","context-v21",...(useV22||useV23?["engine-v22","utterance"]:[]),...(useV23?["engine-v23","date-v23","grammar-v23"]:[])].map(f=>readFile(resolve(root,`lib/rule-parser/${f}.ts`),"utf8")))).join("\n");
for(const c of unseen)assert.ok(!source.includes(c.text));
const groups=Object.fromEntries(["v2-251","targeted","unseen"].map(corpus=>{const rs=rows.filter(r=>r.corpus===corpus);return [corpus,{total:rs.length,intentCorrect:rs.filter(r=>r.intentCorrect).length,critical:rs.filter(r=>r.critical).length,clarification:rs.filter(r=>r.parsed.output.segments[0].needs_clarification).length,semanticUnderstood:rs.filter(r=>r.targetCorrect&&r.actionCorrect&&r.parsed.diagnostics[0].confidence==="HIGH").length}];}));
const report={version:useV23?"V2.3 on V2.1 corpus":useV22?"V2.2 on V2.1 corpus":"V2.1",ruleHash:createHash("sha256").update(source).digest("hex"),initMs,meanPipelineMs:rows.reduce((s,r)=>s+r.ms,0)/rows.length,batch100PipelineMs:rows.filter(r=>r.group==="combinatorial").reduce((s,r)=>s+r.ms,0),groups,metrics,conflicts,ambiguous,rows,
 highWrongAction:highWrong("actionCorrect").map(r=>r.text),highWrongTarget:highWrong("targetCorrect").map(r=>r.text),
 harness:"PASS",gate:metrics.criticalFalseCompletion||metrics.HIGH_CONFIDENCE_WRONG_ACTION||metrics.HIGH_CONFIDENCE_WRONG_TARGET||metrics.HIGH_CONFIDENCE_WRONG_MATCH||wrongNames.length?"V2.1 NEEDS MORE LAB WORK":"V2.1 READY FOR DEVICE QA"};
const outputDirectory=useV23?"output/rule-parser-v23/regression":useV22?"output/rule-parser-v22/regression":"output/rule-parser-v21";
await mkdir(resolve(root,outputDirectory),{recursive:true});await writeFile(resolve(root,`${outputDirectory}/results.json`),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,rows:undefined},null,2));garu.destroy();
if(report.gate!=="V2.1 READY FOR DEVICE QA")process.exitCode=1;
