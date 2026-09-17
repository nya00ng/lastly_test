import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const origin=process.env.SMOKE_ORIGIN||"http://127.0.0.1:3102";
const routes=[];
for(const route of ["/","/record","/items","/items/bedding","/notification","/settings"]){
  const r=await fetch(origin+route);assert.equal(r.status,200,route);routes.push({route,status:r.status});
}
const ids=["00","01","02","10","11","12","13","14","15","16","17","20","21","22","23","24","25","30","31","32","33","40","41","50"];
for(const id of ids)assert.equal((await fetch(`${origin}/screens/S${id}`)).status,200,id);
const api=[];
for(const [text,intent,candidate] of [["신발빨았어","COMPLETED",true],["정수기 필터 언제 갈았어?","QUERY",false],["신발 안 빨았어","NOT_COMPLETED",false],["선풍기 청소했어","COMPLETED",true]]){
  const r=await fetch(origin+"/api/ai/parse",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})});
  const j=await r.json();assert.equal(r.status,200);assert.equal(j.mode,"MOCK");assert.equal(j.segments[0].intent,intent);assert.equal(j.segments[0].record_candidate,candidate);
  api.push({text,intent,mode:j.mode,candidate});
}
const result={routes,fixtures:ids.length,api};
await writeFile("output/rule-parser-v21/product-smoke.json",JSON.stringify(result,null,2));console.log(JSON.stringify(result));
