import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { Garu } from "garu-ko";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");const cache=new Map();
async function url(path){
 if(cache.has(path))return cache.get(path);
 let source=ts.transpileModule(await readFile(path,"utf8"),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 for(const [statement,specifier] of [...source.matchAll(/from "([.@][^"]+)"/g)])source=source.replace(statement,`from "${await url(resolve(specifier.startsWith("@/")?root:dirname(path),specifier.replace(/^@\//,""))+".ts")}"`);
 const value=`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;cache.set(path,value);return value;
}
const load=async name=>import(await url(resolve(root,`lib/${name}.ts`)));
const {prepareProductRule}=await load("rule-parser/product-pipeline");
const {validateRulePilot}=await load("ai/rule-pilot");
const {resolveDemoQuery}=await load("demo-query");
const {demoItems}=await load("demo-data");
const g=await Garu.load(),analyze=text=>g.analyze(text).tokens,today="2026-09-17";
const cases=[
 ["화분 물줬어","COMPLETED",true,null], ["자동차 워셔액 넣었어","COMPLETED",true,null], ["가습기 말렸어","COMPLETED",true,null],
 ["신발 언제 빨았어","QUERY",false,"신발 세탁"], ["렌즈 언제 갈았어","QUERY",false,"렌즈 교체"], ["정수기 필터 언제 갈았어","QUERY",false,"정수기 필터"],
 ["정수기 필터 갈았어","COMPLETED",true,"정수기 필터"], ["칼 갈았어","COMPLETED",true,null], ["커피 갈았어","COMPLETED",true,null], ["그릇 씻었어","COMPLETED",true,null],
 // V2.2 explicitly permits SELF prefixes; this previously required clarification.
 ["신발 빨려고 했어","PLANNED",false,null], ["화분 물 안 줬어","NOT_COMPLETED",false,null], ["나 화장실 청소했어","COMPLETED",true,null],
 // V2.3 recovers productive attached negation; candidate remains false.
 ["화분물안줬어","NOT_COMPLETED",false,null], ["렌즈 다음주에 갈꺼야","PLANNED",false,null], ["가습기 말렸나 기억 안 나","UNCERTAIN",false,null],
];
const before=JSON.stringify(demoItems);
const rows=cases.map(([text,intent,candidate,match])=>{
 const p=prepareProductRule(text,analyze,today,demoItems);const response=validateRulePilot(text,p.output,p.confidences,today);
 assert.ok(response.ok);const s=response.segments[0];assert.equal(s.intent,intent);assert.equal(s.record_candidate,candidate);
 assert.deepEqual(p.matching[0].candidates.map(c=>c.name),match?[match]:[]);
 if(intent==="QUERY")assert.equal(resolveDemoQuery({...s,item_match:{candidates:p.matching[0].candidates,needs_review:false}},demoItems).type,"FOUND");
 return {text,intent,candidate,matching:p.matching[0].candidates,name:p.names[0]};
});
assert.equal(JSON.stringify(demoItems),before);
const positive=prepareProductRule("화분 물줬어",analyze,today,demoItems);
const created={...demoItems[0],id:"test-only",name:positive.names[0],history:[{id:"test",dateLabel:today,actionLabel:positive.names[0]}]};
const repeated=prepareProductRule("화분 언제 물줬어",analyze,today,[...demoItems,created]);
assert.deepEqual(repeated.matching[0].candidates.map(c=>c.name),[created.name]);
const low=validateRulePilot("화분 물줬어",positive.output,["LOW"],today);assert.equal(low.segments[0].record_candidate,false);
const future=structuredClone(positive.output);future.segments[0].performed_date="2099-01-01";
assert.equal(validateRulePilot("화분 물줬어",future,["HIGH"],today).segments[0].record_candidate,false);
assert.equal(validateRulePilot("x",{},[],today).ok,false);
for(const [text,count] of [["신발 빨고 화분에 물 줬어",2],["수건 빨고 문 열고 상자 닫고 매트 털고 텐트 접었어",5],["수건 빨고 문 열고 상자 닫고 매트 털고 텐트 접고 그릇 씻었어",0]]){
 const p=prepareProductRule(text,analyze,today,demoItems);assert.equal(p.output.segments.length,count);
 assert.ok(validateRulePilot(text,p.output,p.confidences,today).ok);if(!count)assert.equal(p.output.result_type,"TOO_MANY_ACTIONS");
}
await mkdir("output/rule-pilot",{recursive:true});await writeFile("output/rule-pilot/contract.json",JSON.stringify({status:"PASS",rows,newItemQuery:"PASS",lowGuard:"PASS",futureGuard:"PASS",multi:"2/5/6 PASS",mutation:0},null,2));
console.log("rule-v21 Product adapter/candidate/query/new-item/multi contract: PASS");g.destroy();
