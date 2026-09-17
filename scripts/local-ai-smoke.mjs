import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const modules = new Map();
async function moduleUrl(path) {
  if (modules.has(path)) return modules.get(path);
  let source = ts.transpileModule(await readFile(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const imports = [...source.matchAll(/from "([.@][^"]+)"/g)];
  for (const [statement, specifier] of imports) {
    const dependency = resolve(specifier.startsWith("@/") ? root : dirname(path), specifier.replace(/^@\//, "")) + ".ts";
    source = source.replace(statement, `from "${await moduleUrl(dependency)}"`);
  }
  const url = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
  modules.set(path, url);
  return url;
}
const { validateLocalOutput, parserPrompt } = await import(await moduleUrl(resolve(root, "lib/local-ai/contract.ts")));
const { labCases } = await import(await moduleUrl(resolve(root, "lib/local-ai/cases.ts")));
const { matchDemoItems } = await import(await moduleUrl(resolve(root, "lib/ai/demo-matching.ts")));
const today = "2026-09-17";
const input = "테스트 수행했어";
const output = { schema_version: "1.0", prompt_version: "1.1", result_type: "OK", overflow_detected: false, segments: [{
  segment_id: "1", original_text: input, intent: "COMPLETED", scope: "IN_SCOPE", normalized_action: "테스트 수행", performed_date: today,
  date_precision: "EXACT", date_resolution_source: "IMPLICIT_TODAY", needs_clarification: false, clarification: null, tag_candidates: [],
}] };
const validate = (value) => validateLocalOutput(JSON.stringify(value), input, today);
const change = (fields) => ({ ...output, segments: [{ ...output.segments[0], ...fields }] });
assert.equal(validate(output).ok, true);
assert.equal(validate(output).diagnostics[0].recordCandidate, true);
for (const intent of ["QUERY", "NOT_COMPLETED", "PLANNED", "UNCERTAIN", "UNKNOWN"]) {
  const checked = validate(change({ intent, performed_date: null, date_precision: "NOT_APPLICABLE", date_resolution_source: "NONE" }));
  assert.equal(checked.ok, true, intent);
  assert.equal(checked.diagnostics[0].recordCandidate, false, intent);
}
for (const fields of [
  { performed_date: "2026-09-18", date_resolution_source: "EXPLICIT" },
  { performed_date: "2026-02-31", date_resolution_source: "EXPLICIT" },
  { performed_date: "" }, { performed_date: null },
  { date_resolution_source: "NONE" }, { date_precision: "NOT_APPLICABLE" },
  { item_id: "injected" }, { record_candidate: true },
  { original_text: "invented" }, { normalized_action: " " },
  { needs_clarification: true },
  { clarification: { type: "TARGET", question: "?" }, needs_clarification: true },
  { tag_candidates: Array.from({ length: 11 }, (_, i) => `tag${i}`) },
]) assert.equal(validate(change(fields)).ok, false, JSON.stringify(fields));
assert.equal(validateLocalOutput("```json\n{}\n```", input, today).ok, false);
assert.equal(validate({ ...output, segments: [] }).ok, false);
assert.equal(validate({ ...output, overflow_detected: true }).ok, false);
assert.equal(validate({ ...output, segments: [output.segments[0], output.segments[0]] }).ok, false);
assert.equal(validate({ ...output, segments: Array(6).fill(output.segments[0]) }).ok, false);
assert.equal(validate({ ...output, result_type: "TOO_MANY_ACTIONS", overflow_detected: true, segments: [] }).ok, true);
assert.equal(labCases.length, 28);
assert.equal(new Set(labCases.map((test) => test.id)).size, 28);
const prompt = parserPrompt(input, today);
for (const test of labCases) assert.equal(prompt.includes(test.text), false, "evaluation leakage");
const worker = await readFile(resolve(root, "lib/local-ai/worker.ts"), "utf8");
assert.equal(/MockAIAdapter|OpenAIAdapter|\.\/cases|api\/ai\/parse/.test(worker), false);
assert.equal(worker.includes('device: "webgpu"'), true);
assert.equal(worker.includes('env.remotePathTemplate = `{model}/resolve/${LOCAL_MODEL.revision}/`'), true);
assert.equal(worker.includes('"ASSET_GET_ONLY"'), true);
const lab = await readFile(resolve(root, "components/local-ai/LocalAiLab.tsx"), "utf8");
assert.equal(/addActivities|useDemoActivity|\/api\/ai\/parse/.test(lab), false, "no Product mutation/API path");
const page = await readFile(resolve(root, "app/local-ai-lab/page.tsx"), "utf8");
assert.equal(page.includes('process.env.LOCAL_AI_LAB_ENABLED !== "1"'), true);
// Characterization of the unchanged matcher: the lab must surface this risk, not hide it.
const mismatch = matchDemoItems("신발 방수스프레이 뿌리기");
assert.equal(mismatch.some((candidate) => candidate.name === "신발 세탁"), true);
console.log("local-ai harness contracts: PASS (not model accuracy)");
console.log("existing matching open-vocabulary gap reproduced: 신발 방수스프레이 -> 신발 세탁 DEMO_FUZZY; product adoption blocked pending review");
