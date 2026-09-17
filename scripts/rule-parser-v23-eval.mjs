import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { createHash } from "node:crypto";
import ts from "typescript";
import { Garu } from "garu-ko";
const root=process.cwd(), cache=new Map();
async function url(path){
  if(cache.has(path))return cache.get(path);
  let source=ts.transpileModule(await readFile(path,"utf8"),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  for(const [statement,specifier] of [...source.matchAll(/from "([.@][^"]+)"/g)])source=source.replace(statement,`from "${await url(resolve(specifier.startsWith("@/")?root:dirname(path),specifier.replace(/^@\//,""))+".ts")}"`);
  const value=`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;cache.set(path,value);return value;
}
const load=async name=>import(await url(resolve(root,`lib/${name}.ts`)));
const {parseRuleV23}=await load("rule-parser/engine-v23");
const {prepareProductRule}=await load("rule-parser/product-pipeline");
const {validateRulePilot}=await load("ai/rule-pilot");
const {demoItems}=await load("demo-data");
const {extractClauseDate}=await load("rule-parser/date-v23");
const {recoverNegation}=await load("rule-parser/grammar-v23");
const today="2026-09-17", output="output/rule-parser-v23";
const subjects=[
  ["화분","물 줬어","물 줄",null], ["신발","빨았어","빨","shoes"],
  ["정수기 필터","갈았어","갈","water-filter"], ["렌즈","갈았어","갈","lens"],
  ["칼","갈았어","갈",null], ["커피","갈았어","갈",null],
  ["그릇","씻었어","씻을",null], ["가습기","말렸어","말릴",null],
  ["문","열었어","열",null], ["텐트","접었어","접을",null],
  ["상자","닫았어","닫을",null], ["수건","빨았어","빨",null],
];
const C="COMPLETED", N="NOT_COMPLETED", P="PLANNED", U="UNCERTAIN", Q="QUERY";
const corpus=[];
const add=(group,text,intents,targets,dates)=>corpus.push({group,text,intents,targets,dates});
const relative=["하루 전에","이틀 전에","사흘 전에","3일 전에","일주일 전에","2주 전에","한 달 전에","2개월 전에","며칠 전에","얼마 전에","한참 전에","나흘 전에"];
const relativeDates=["2026-09-16","2026-09-15","2026-09-14","2026-09-14","2026-09-10","2026-09-03","2026-08-17","2026-07-17",null,null,null,"2026-09-13"];
subjects.forEach(([target,done,future],i)=>{
  const b=subjects[(i+3)%subjects.length],past=done.slice(0,-1),otherPast=b[1].slice(0,-1);
  add("speculation",`어, ${i%2?"아마도":"아마"} 제가 ${target} ${done}.`,[U],[target],[null]);
  add("probability",`참 ${target} ${past}을 수도 있어요!`,[U],[target],[null]);
  add("relative-date",`아, 저는 ${relative[i]} ${target} ${done}~`,[C],[target],[relativeDates[i]]);
  add("attached-negation",`음... ${target.replaceAll(" ","")}${i%2?"못":"안"}${done.replaceAll(" ","")}`, [N],[target],[null]);
  const link=[`${past}고`,`${past}고 나서`,`${done}. 그리고`,`${done}. 또`,`${done}. 그다음`,`${past}는데`][i%6];
  add("multi-action",`참 나는 ${target} ${link} ${b[0]} ${b[1]}!`,[C,C],[target,b[0]],[today,today]);
  if(i%4===0)add("mixed-intent",`어 ${target} ${past}고 ${b[0]} 안 ${b[1]}.`,[C,N],[target,b[0]],[today,null]);
  if(i%4===1)add("mixed-intent",`어 ${target} ${past}고 ${b[0]} 내일 ${b[2]} 거야.`,[C,P],[target,b[0]],[today,null]);
  if(i%4===2)add("mixed-intent",`어 ${target} ${past}고 ${b[0]} 언제 ${b[1]}?`,[C,Q],[target,b[0]],[today,null]);
  if(i%4===3)add("mixed-intent",`어 ${target} 안 ${done}. 그리고 ${b[0]} ${otherPast}어.`,[N,C],[target,b[0]],[null,today]);
  add("filler",`어, 참 그러고 보니 ${target} ${done}!`,[C],[target],[today]);
  add("speaker",`난 어제 ${target} ${done}！`,[C],[target],["2026-09-16"]);
  add("punctuation",`음… 저 오늘은 ${target} ${done}！！`,[C],[target],[today]);
  add("query",`아 맞다, ${target} 마지막으로 언제 ${done}？`,[Q],[target],[null]);
  add("planned",`참 제가 내일 ${target} ${future} 거야~`,[P],[target],[null]);
  add("uncertain",`음 ${target} ${past}${i%2?"나 봐":"던 것 같아"}.`,[U],[target],[null]);
});
assert.equal(corpus.length,144);assert.equal(new Set(corpus.map(c=>c.text)).size,144);
const sources=(await Promise.all(["engine-v23","date-v23","grammar-v23"].map(n=>readFile(`lib/rule-parser/${n}.ts`,"utf8")))).join("\n");
for(const c of corpus)assert.ok(!sources.includes(c.text));
const previous=JSON.parse(await readFile("output/rule-parser-v22/holdout.json","utf8"));
const old54=JSON.parse(await readFile("output/rule-parser-v22/adversarial.json","utf8"));
const old369=JSON.parse(await readFile("output/rule-parser-v21/results.json","utf8"));
const seen=new Set([...previous.rows,...old54.rows,...old369.rows].map(r=>r.text));
for(const c of corpus)assert.ok(!seen.has(c.text),`duplicate: ${c.text}`);
await mkdir(output,{recursive:true});
await writeFile(`${output}/corpus.json`,JSON.stringify(corpus,null,2));
const start=performance.now();const g=await Garu.load(),initMs=performance.now()-start;
const analyze=text=>g.analyze(text).tokens;
const metrics={speculativeToCompleted:0,negativeToCompleted:0,plannedToCompleted:0,uncertainToCompleted:0,queryToRecord:0,wrongDate:0,wrongExistingItem:0,actionConflictAutoMatch:0};
const rows=corpus.map(c=>{
 const started=performance.now();
 try {
  const p=prepareProductRule(c.text,analyze,today,demoItems),r=validateRulePilot(c.text,p.output,p.confidences,today),ms=performance.now()-started;
  assert.ok(r.ok,c.text);const d=parseRuleV23(c.text,analyze,today).diagnostics;
  const errors=[];
  if(r.segments.length!==c.intents.length)errors.push("SEGMENT_COUNT");
  r.segments.forEach((s,i)=>{
   const expected=c.intents[i];
   if(s.intent!==expected)errors.push(`INTENT_${i}:${s.intent}`);
   if(expected!==C&&(s.intent===C||s.record_candidate)){
    const key={[N]:"negativeToCompleted",[P]:"plannedToCompleted",[U]:"uncertainToCompleted",[Q]:"queryToRecord"}[expected];if(key)metrics[key]++;
    if(["speculation","probability"].includes(c.group))metrics.speculativeToCompleted++;
   }
   if(s.performed_date!==c.dates[i]){errors.push("DATE");metrics.wrongDate++;}
   if(expected===C&&c.dates[i]&&(!s.record_candidate||d[i]?.target!==c.targets[i]))errors.push(`USABILITY_${i}`);
   if(expected===C&&!c.dates[i]&&(s.record_candidate||s.date_precision!=="APPROXIMATE"||s.clarification?.type!=="DATE"))errors.push("VAGUE_DATE");
   const id=subjects.find(v=>v[0]===c.targets[i])?.[3];
   if(p.matching[i].candidates.some(m=>m.itemId!==id)){metrics.wrongExistingItem++;errors.push("MATCH");}
   if(p.matching[i].autoMatch||p.matching[i].selectedItemId!==null){metrics.actionConflictAutoMatch++;errors.push("AUTO_MATCH");}
   if(!c.text.includes(s.original_text))errors.push("SOURCE");
  });
  return {...c,segments:r.segments,matching:p.matching,diagnostics:d,ms,errors};
 }catch(error){return {...c,ms:performance.now()-started,segments:[],errors:[String(error)]};}
});
const all=rows.flatMap(r=>r.intents.map((intent,i)=>({intent,actual:r.segments[i],date:r.dates[i]})));
const completed=all.filter(s=>s.intent===C&&s.date),relativeRows=rows.filter(r=>r.group==="relative-date"),mixed=rows.filter(r=>r.group==="mixed-intent"),neg=rows.filter(r=>r.group==="attached-negation");
const times=rows.map(r=>r.ms).sort((a,b)=>a-b);
const summary={total:rows.length,passed:rows.filter(r=>!r.errors.length).length,metrics,
 usability:{completedUsable:{passed:completed.filter(s=>s.actual?.record_candidate).length,total:completed.length},clarification:{count:all.filter(s=>s.actual?.needs_clarification).length,total:all.length},segmentRecall:{actual:all.filter(s=>s.actual).length,expected:all.length},relativeDateExactness:{passed:relativeRows.filter(r=>!r.errors.length).length,total:relativeRows.length},attachedNegationRecall:{passed:neg.filter(r=>!r.errors.length).length,total:neg.length},mixedIntentAccuracy:{passed:mixed.filter(r=>!r.errors.length).length,total:mixed.length}},
 performance:{initMs,firstParseMs:rows[0].ms,medianParseMs:times[Math.floor(times.length/2)],maxParseMs:times.at(-1),batch100Ms:rows.slice(0,100).reduce((a,r)=>a+r.ms,0),meanMultiActionMs:rows.filter(r=>r.intents.length>1).reduce((a,r)=>a+r.ms,0)/rows.filter(r=>r.intents.length>1).length},
 sourceHash:createHash("sha256").update(sources).digest("hex")};
const report={summary,rows};
try{await access(`${output}/first-run.json`);}catch{await writeFile(`${output}/first-run.json`,JSON.stringify(report,null,2));}
await writeFile(`${output}/results.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify({summary,failures:rows.filter(r=>r.errors.length).map(r=>({text:r.text,errors:r.errors,actual:r.segments.map(s=>({intent:s.intent,action:s.normalized_action,date:s.performed_date,candidate:s.record_candidate}))}))},null,2));
// Additional grammar safeguards and calendar boundary assertions, not corpus tuning.
for(const text of ["안경 닦았어","보안 점검했어","아이 안아줬어","물안개 봤어"])assert.equal(recoverNegation(text,analyze).recovered,false,text);
assert.equal(extractClauseDate("한 달 전에", "2026-03-31").info.date,"2026-02-28");
assert.equal(extractClauseDate("한 달 전에", "2028-03-31").info.date,"2028-02-29");
assert.equal(extractClauseDate("2주 전에", "2026-01-05").info.date,"2025-12-22");
assert.equal(extractClauseDate("2026년 8월 1일 이틀 전에", today).info.date,"2026-08-01");
for(const text of ["신발 빨고 싶어", "신발 빨고 있었던 것 같아"]){const p=prepareProductRule(text,analyze,today,demoItems);const r=validateRulePilot(text,p.output,p.confidences,today);assert.ok(r.ok);assert.ok(!r.segments.some(s=>s.record_candidate),text);}
// The auxiliary stays in the first planned clause; the second independent action is completed.
const auxiliary=parseRuleV23("신발 빨고 싶고 화분 물줬어",analyze,today);
assert.deepEqual(auxiliary.output.segments.map(s=>s.intent),[P,C]);
for(const [text,count] of [["수건 빨고 문 열고 상자 닫고 매트 털고 텐트 접었어",5],["수건 빨고 문 열고 상자 닫고 매트 털고 텐트 접고 그릇 씻었어",0]]){const p=parseRuleV23(text,analyze,today);assert.equal(p.output.segments.length,count);if(!count)assert.equal(p.output.result_type,"TOO_MANY_ACTIONS");}
const required=[
 ["나 아마 화분에 물 줬어",[U]], ["정수기 필터 갈았을 수도 있어",[U]],
 ["신발 빨았던 것 같아",[U]], ["화분 물 줬을지도 몰라",[U]],
 ["신발을 빤 듯해",[U]], ["렌즈 교체한 것 같아",[U]], ["렌즈 교체했나 봐",[U]],
 ["오늘 화분물안줬어",[N]], ["신발안빨았어",[N]], ["필터못갈았어",[N]], ["약안먹었어",[N]],
 ["화분 물 줬고 신발은 안 빨았어",[C,N]], ["필터 갈았고 렌즈는 다음주에 갈 거야",[C,P]],
 ["약 먹었고 운동은 못 했어",[C,N]], ["신발 빨려고 했고 화분에는 물 줬어",[P,C]],
 ["화분 물 줬고 신발 언제 빨았지",[C,Q]],
];
for(const [text,intents] of required){const p=parseRuleV23(text,analyze,today);assert.deepEqual(p.output.segments.map(s=>s.intent),intents,text);}
for(const text of ["아마 화분 물 줬고 신발 빨았어","남편이 신발 빨았고 화분 물줬어"]){
 const p=prepareProductRule(text,analyze,today,demoItems),r=validateRulePilot(text,p.output,p.confidences,today);
 assert.ok(r.ok);assert.ok(!r.segments.some(s=>s.record_candidate),text);
}
const actor=parseRuleV23("남편이 신발 빨았고 나는 화분 물줬어",analyze,today);
assert.deepEqual(actor.output.segments.map(s=>s.intent),[U,C]);
console.log("Required grammar, calendar boundary, auxiliary and 5/6-action assertions: PASS");
g.destroy();
if(summary.passed!==summary.total||Object.values(metrics).some(Boolean))process.exitCode=1;
