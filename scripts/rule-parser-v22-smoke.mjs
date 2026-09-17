import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import ts from "typescript";
import { createHash } from "node:crypto";
import { Garu } from "garu-ko";
const root = process.cwd(), cache = new Map();
async function url(path) {
  if (cache.has(path)) return cache.get(path);
  let source = ts.transpileModule(await readFile(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  for (const [statement, specifier] of [...source.matchAll(/from "([.@][^"]+)"/g)]) source = source.replace(statement, `from "${await url(resolve(specifier.startsWith("@/") ? root : dirname(path), specifier.replace(/^@\//, "")) + ".ts")}"`);
  const value = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`; cache.set(path, value); return value;
}
const load = async name => import(await url(resolve(root, `lib/${name}.ts`)));
const { parseRuleV22 } = await load("rule-parser/engine-v22");
const { prepareProductRule } = await load("rule-parser/product-pipeline");
const { validateRulePilot } = await load("ai/rule-pilot");
const { demoItems } = await load("demo-data");
const garu = await Garu.load(), analyze = text => garu.analyze(text).tokens, today = "2026-09-17";
const texts = process.argv.slice(2);
const cases = texts.length ? texts : [
  "나 오늘 화분 물줬어!", "오늘 내가 화분에 물 줬어", "아 나 화분 물줬어", "나 방금 화분 물줬어!",
  "오늘은 화분에 물을 줬어", "그러고 보니 오늘 화분 물줬어", "음... 나 화분 물줬어",
  "오늘 내가 신발 빨았어", "아 나 정수기 필터 갈았어", "음... 신발 언제 빨았지?",
  "나 오늘 화분 물 안 줬어", "나 내일 화분 물 줄 거야", "나 화분 물 줬나?", "나 화분 언제 물줬지?",
  "아이가 약 먹었어", "남편이 필터 갈았어", "나 어제 화분 물줬어", "나 2026년 8월 1일 화분 물줬어",
  "화분은 물 줬어", "나 오늘 신발 안 빨았어", "나 내일 렌즈 갈 거야",
];
const rows = cases.map(text => {
  const parsed = parseRuleV22(text, analyze, today);
  const p = prepareProductRule(text, analyze, today, demoItems);
  const response = validateRulePilot(text, p.output, p.confidences, today);
  assert.ok(response.ok, text);
  return { text, core: parsed.utterance.coreClause, output: response.segments, names: p.names, diagnostics: parsed.diagnostics, matching: p.matching };
});
if (!texts.length) {
  const expected = ["COMPLETED","COMPLETED","COMPLETED","COMPLETED","COMPLETED","COMPLETED","COMPLETED","COMPLETED","COMPLETED","QUERY","NOT_COMPLETED","PLANNED","UNCERTAIN","QUERY","UNCERTAIN","UNCERTAIN","COMPLETED","COMPLETED","COMPLETED","NOT_COMPLETED","PLANNED"];
  for (let i = 0; i < rows.length; i++) {
    assert.equal(rows[i].output[0].intent, expected[i], rows[i].text);
    assert.equal(rows[i].output[0].original_text, rows[i].text);
    assert.equal(rows[i].output[0].record_candidate, expected[i] === "COMPLETED", rows[i].text);
  }
  assert.equal(rows[16].output[0].performed_date, "2026-09-16");
  assert.equal(rows[17].output[0].performed_date, "2026-08-01");
  assert.equal(rows[17].output[0].date_resolution_source, "EXPLICIT");
  for (const text of ["나 지난주 화분 물줬어", "나 2099년 1월 1일 화분 물줬어", "나 2026년 2월 30일 화분 물줬어"]) {
    const p = prepareProductRule(text, analyze, today, demoItems);
    const r = validateRulePilot(text, p.output, p.confidences, today);
    assert.ok(r.ok); assert.equal(r.segments[0].record_candidate, false, text);
    assert.equal(r.segments[0].clarification.type, "DATE");
  }
  for (const [text, dates] of [
    ["나 어제 신발 빨고 오늘 화분 물줬어!", ["2026-09-16", today]],
    ["나 2026년 8월 1일 신발 빨고 화분 물줬어!", ["2026-08-01", "2026-08-01"]],
    ["나  오늘  신발 빨고   화분 물줬어!", [today, today]],
  ]) {
    const p = parseRuleV22(text, analyze, today);
    assert.deepEqual(p.output.segments.map(s => s.performed_date), dates);
    assert.ok(p.output.segments.every(s => text.includes(s.original_text) && s.original_text.length));
    assert.ok(p.output.segments[0].original_text.startsWith("나"));
    assert.ok(p.output.segments.at(-1).original_text.endsWith("!"));
  }
  const six=parseRuleV22("아 오늘 나는 수건 빨고 문 열고 상자 닫고 매트 털고 텐트 접고 그릇 씻었어!",analyze,today);
  assert.equal(six.output.result_type,"TOO_MANY_ACTIONS"); assert.equal(six.output.segments.length,0);
  assert.equal(parseRuleV22("아빠가 화분 물줬어",analyze,today).utterance.coreClause,"아빠가 화분 물줬어");
}
await mkdir("output/rule-parser-v22", { recursive: true });
await writeFile("output/rule-parser-v22/probes.json", JSON.stringify(rows, null, 2));
if (texts.length) console.log(JSON.stringify(rows.map(r => ({text:r.text,core:r.core,intent:r.output.map(s=>s.intent),candidate:r.output.map(s=>s.record_candidate),date:r.output.map(s=>s.performed_date),name:r.names,target:r.diagnostics.map(d=>d.target),action:r.diagnostics.map(d=>d.action)})), null, 2));
else {
  // Constructed after the first implementation. Never feed these expectations to the parser.
  const source = (await Promise.all(["utterance", "engine-v22"].map(n => readFile(`lib/rule-parser/${n}.ts`, "utf8")))).join("\n");
  const objects = [
    ["수건","빨다","빨았어","빨았어요","빨","빨았나","빨고","세탁"],
    ["창문","닦다","닦았어","닦았습니다","닦을","닦았나","닦고","청소"],
    ["칼","갈다","갈았어","갈았어요","갈","갈았나","갈고","갈다"],
    ["커피","갈다","갈았어","갈았습니다","갈","갈았나","갈고","갈다"],
    ["렌즈","갈다","갈았어","갈았어요","갈","갈았나","갈고","교체"],
    ["정수기 필터","갈다","갈았어","갈았습니다","갈","갈았나","갈고","교체"],
    ["가습기","말리다","말렸어","말렸어요","말릴","말렸나","말리고","말리다"],
    ["문","열다","열었어","열었습니다","열","열었나","열고","열다"],
    ["텐트","접다","접었어","접었어요","접을","접었나","접고","접다"],
  ];
  const corpus=[];
  const add=(group,text,intent,target,action,date=today)=>corpus.push({group,text,intents:[intent],targets:[target],actions:[action],dates:[intent==="COMPLETED"?date:null]});
  const speakers=["제가","난","저는","나는","내가","저","나","제가","난"];
  const times=["어제","그저께","방금","아까","조금 전에","오늘은","2026년 8월 1일","2026-09-01","3일 전"];
  const dates=["2026-09-16","2026-09-15",today,today,today,today,"2026-08-01","2026-09-01","2026-09-14"];
  const fillers=["아 맞다","생각해보니","그러고 보니","음...","아","어","참","음…","아 맞다!"];
  const endings=["！","!","...","～","~","。","．","!!","…"];
  objects.forEach(([target,action,done,honor,future,uncertain],i)=>{
    add("speaker",`${speakers[i]} ${target} ${done}~`,"COMPLETED",target,action);
    add("temporal",`저는 ${times[i]} ${target} ${done}!`,"COMPLETED",target,action,dates[i]);
    add("filler",`${fillers[i]} 제가 ${target} ${done}！`,"COMPLETED",target,action);
    add("punctuation",`음… 오늘은 ${target} ${done}${endings[i]}`,"COMPLETED",target,action);
    const topic=/[가-힣]/.test(target.at(-1))&&(target.at(-1).charCodeAt(0)-0xac00)%28?"은":"는";
    add("topic",`아 맞다 나는 ${target}${topic} ${done}.`,"COMPLETED",target,action);
    add("honorific",`그러고 보니 제가 어제 ${target} ${honor}.`,"COMPLETED",target,action,"2026-09-16");
    add("query",`참 저는 ${target} 언제 ${done}？`,"QUERY",target,action);
    add("negative",`아 맞다 내가 오늘 ${target} 안 ${done}!`,"NOT_COMPLETED",target,action);
    add("planned",`음... 저는 내일 ${target} ${future} 거야.`,"PLANNED",target,action);
    add("uncertain",`그러고 보니 나는 ${target} ${uncertain}?`,"UNCERTAIN",target,action);
  });
  for(let i=0;i<10;i++){
    const a=objects[i%9],b=objects[(i+2)%9];
    corpus.push({group:"multi-action",text:`${i%2?"제가 어제":"아 맞다 오늘은"} ${a[0]} ${a[6]} ${b[0]} ${b[2]}!`,intents:["COMPLETED","COMPLETED"],targets:[a[0],b[0]],actions:[a[1],b[1]],dates:Array(2).fill(i%2?"2026-09-16":today)});
  }
  assert.equal(corpus.length,100); assert.equal(new Set(corpus.map(c=>c.text)).size,100);
  const {allRuleCases}=await load("rule-parser/evaluation");
  const {v2Controls,safetyHoldout,queryMatchCases}=await load("rule-parser/evaluation-v2");
  const {contextHoldout,targetedCases}=await load("rule-parser/evaluation-v21");
  const prior=new Set([...allRuleCases,...v2Controls,...safetyHoldout,...queryMatchCases,...contextHoldout,...targetedCases].map(c=>c.text));
  for(const c of corpus){assert.ok(!prior.has(c.text));assert.ok(!source.includes(c.text));}
  const metrics={falseCompletion:0,queryToRecord:0,negativeToCompleted:0,plannedToCompleted:0,uncertainToCompleted:0,wrongItemMatch:0,wrongDate:0};
  const holdout=corpus.map(c=>{
    const p=prepareProductRule(c.text,analyze,today,demoItems), parsed=parseRuleV22(c.text,analyze,today);
    const response=validateRulePilot(c.text,p.output,p.confidences,today); assert.ok(response.ok,c.text);
    const errors=[];
    if(response.segments.length!==c.intents.length)errors.push("SEGMENT_COUNT");
    response.segments.forEach((s,i)=>{
      const d=parsed.diagnostics[i],expected=c.intents[i];
      if(s.intent!==expected)errors.push(`INTENT:${s.intent}`);
      if(expected!=="COMPLETED"&&(s.record_candidate||s.intent==="COMPLETED")){
        metrics.falseCompletion++;
        const key={QUERY:"queryToRecord",NOT_COMPLETED:"negativeToCompleted",PLANNED:"plannedToCompleted",UNCERTAIN:"uncertainToCompleted"}[expected]; if(key)metrics[key]++;
      }
      if(s.performed_date!==c.dates[i]){metrics.wrongDate++;errors.push("DATE");}
      if(expected==="COMPLETED"&&(!s.record_candidate||d.target!==c.targets[i]||d.action!==c.actions[i]))errors.push("EXTRACTION_OR_CANDIDATE");
      const allowed=c.targets[i]==="렌즈"?["lens"]:c.targets[i]==="정수기 필터"?["water-filter"]:[];
      if(p.matching[i].candidates.some(m=>!allowed.includes(m.itemId))){metrics.wrongItemMatch++;errors.push("MATCH");}
      assert.ok(c.text.includes(s.original_text),c.text);
    });
    return {...c,output:response.segments,names:p.names,diagnostics:parsed.diagnostics,matching:p.matching,errors};
  });
  const report={ruleHash:createHash("sha256").update(source).digest("hex"),total:100,passed:holdout.filter(r=>!r.errors.length).length,metrics,rows:holdout};
  await writeFile("output/rule-parser-v22/holdout.json",JSON.stringify(report,null,2));
  console.log(JSON.stringify({...report,rows:holdout.filter(r=>r.errors.length).map(r=>({text:r.text,errors:r.errors,intents:r.output.map(s=>s.intent),names:r.names}))},null,2));
  if(report.passed!==100||Object.values(metrics).some(Boolean))process.exitCode=1;
}
garu.destroy();
