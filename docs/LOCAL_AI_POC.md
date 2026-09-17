# Local Parser PoC (2026-09-17)

Status: PARTIAL. Product provider remains mock. No Product route, voice hook,
store, matching algorithm, parser endpoint, or fixture is replaced by this PoC.
The attached GEMMA MOBILE PARSER POC request authorizes this isolated experiment;
it does not change the production server candidate/save contract.

## Non-duplicate audit

A. Existing evidence: README records R1-R8, D2 Mock, confirmation-first, query
no-mutation, existing browser voice and user device verification. The cycle and
month smoke scripts exist. These are historical Product checks, not local-model
accuracy evidence. This repository has no original Sebin MiniLM/Qwen experiment
logs. The user's prior-work summary is accepted without rerunning those trials.

B. New evidence needed: open-vocabulary Korean JSON parsing, negative/planned/
uncertain safety, novel-action matching compatibility, download/cache behavior,
cold/warm latency and stability on the four named mobile environments.

C. Out of scope: MiniLM/Qwen, native STT research, general WebGPU feasibility,
Gemma direct audio, voice integration before text passes on both devices,
production provider switch, DB/Auth/Push/PWA, broad dependency upgrades.

## Candidate and dependency decision

First measured candidate: `onnx-community/gemma-3-1b-it-ONNX`, q4, revision
`a58439f40017d3b99c7d378ff525e54e0ba08ebf`. This is a size-first hypothesis, NOT
a claim that it is the smallest model capable of Korean parsing. 270M remains a
smaller candidate, but its unmeasured Korean instruction/structured-output quality
does not establish practicality. 1B is the first comparison point; do not silently
escalate to another model if it fails.

Gemma 4 E2B is not the default merely because it is newer: public q4f16 decoder
and embedding files total 3,111,069,636 bytes before tokenizer/encoders. The 1B q4
model files total 859,454,179 bytes; tokenizer files total 20,325,340 bytes.
These are registry metadata, NOT actual transferred bytes or peak memory.
Gemma 4 mobile QAT needs a separately verified browser artifact/runtime path;
the Python Transformers artifact name is not proof of Transformers.js support.

Transformers.js 4.3.0 is pinned. Its transitive onnxruntime-web is
1.31.0-dev.20260914-8d85527a0 (a development runtime). It loads only in the lab
Worker. No runtime inference is performed in Next.js server functions.
No external STT or UI dependency is added. Model redistribution/use must follow
Gemma 3 terms; Gemma 4's Apache license does not apply to Gemma 3.

Sources checked:
- https://ai.google.dev/gemma/docs/core/model_card_3
- https://huggingface.co/onnx-community/gemma-3-1b-it-ONNX
- https://huggingface.co/onnx-community/gemma-4-E2B-it-ONNX
- https://huggingface.co/google/gemma-4-E2B-it-qat-mobile-transformers
- npm registry metadata for @huggingface/transformers (2026-09-17)

## Isolation and contract

`/local-ai-lab` is enabled in development only. Production/preview must explicitly
set `LOCAL_AI_LAB_ENABLED=1`; otherwise this route renders Next.js not-found UI
without the lab. A streamed Next.js response may have HTTP 200 with the 404
boundary; the lab is still unavailable. This was observed in the gate test. Keep
`AI_PROVIDER=mock`. Do not set AI_PROVIDER=local: the existing server factory has
no such adapter. This separate feature flag is intentional production protection.

The worker receives only input and date, not the test answers, item dictionary,
or matching candidates. One inference attempt is allowed; malformed JSON becomes
a visible failure, with no Mock or paid fallback. The model output uses the
existing ParserOutput schema, not the illustrative alternative field names.
Candidate diagnostics are computed by application code for evaluation only;
they are not server authorization and cannot commit anything. All matching
results are observational. No candidate is auto-selected in the lab.

The lab reuses the current matcher unchanged. Known issue reproduced:
`신발 방수스프레이 뿌리기` can produce `신발 세탁` DEMO_FUZZY, because unrecognized
action semantics bypass the four-group compatibility check. This is an adoption
blocker, not permission to change Product rules in this experiment. The case
runner explicitly marks the forbidden candidate FAIL.

Strict lab validation rejects unknown keys (including item IDs/save decisions),
invalid enums, invented original text, invalid dates, future completions,
duplicate segment IDs, contradictory clarification, and overflow partial output.
Valid JSON does not prove correct interpretation: negation and action semantics
must also pass case expectations and human review. No model ground truth is
inserted into prompts. All 28 requested evaluation cases live separately.

## Measurement procedure

1. Use HTTPS on each phone. Choose the correct device label; inspect UA/OS.
2. Run capability probe. Storage is tested by actual write/read, not presence only.
3. On Wi-Fi, clear only the lab cache, then load. Export the report after load.
4. Run 28 cases and additional genuinely unseen sentences. Inspect original JSON,
   candidate diagnostics, matching and meaning. Record failures without patching
   a sentence dictionary. A human PASS cannot override an automatic FAIL.
5. Repeat inference for warm latency. Export before closing/reloading the page.
6. Reload and load again without clearing cache. Compare cache hits and measured
   model response-body bytes. Browser HTTP cache is distinct from Cache Storage.
7. Release Worker memory. Enable cache-only mode and load again. Separately test
   airplane mode on an already loaded page. Runtime WASM may still need its cache;
   cache-only blocks model/runtime fetches, not proof of total network isolation.
8. Record heat, battery, responsiveness, tab termination and repeated-use results.
   A pending-run breadcrumb after reopening means an interrupted run; it does not
   prove an OOM crash. Exported reports are local downloads, not uploads.

Downloads are explicitly opt-in. Metrics count model and runtime response-body bytes as read,
network request attempts, load wall time, cache hits/writes/errors, and inference
times. HTTP headers/compression and Next.js chunks are not included in that byte
counter. Model/runtime counters are separate. A fetch can use the HTTP cache;
these are not guaranteed wire-byte totals. GPU peak memory is unavailable through the current probe; deviceMemory
is an approximate device hint, not measured model RAM. Missing values remain null.
Cold/warm labels require the above procedure; the app does not infer them from a
fast timer. Full offline page reload is NOT implemented (no service worker).

## Device matrix

All M cells mean MANUAL DEVICE REQUIRED, not PASS.

| Environment | WebGPU | Model Load | Cold Load | Warm Load | Text Parse | Korean | Memory Stable | Cache Reuse | Offline | Crash | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| iPhone 16 Pro Safari | M | M | M | M | M | M | M | M | M | M | PARTIAL |
| iPhone 16 Pro Chrome | M | M | M | M | M | M | M | M | M | M | PARTIAL |
| Z Flip3 Chrome | M | M | M | M | M | M | M | M | M | M | PARTIAL |
| Z Flip3 Samsung Internet | M | M | M | M | M | M | M | M | M | M | PARTIAL |

The desktop viewport is never evidence for these four device results. Voice stays
untouched until text is practical on both phones. No API billing path exists in
the lab. Hosting, model delivery bandwidth, storage, mobile data and power remain
separate costs. Do not describe the entire service as free.

## Desktop evidence (2026-09-17)

Actual Windows Headless Chrome 152 / Intel gen-12lp WebGPU inference was run,
not a mobile simulation. Evidence: `output/playwright/local-ai-desktop-prompt-v2.json`.
The first schema-heavy prompt failed its first two completed trials; the compact,
generic Korean contract prompt then completed all 28 cases without test answers.

| Measurement | Observed result |
| --- | --- |
| Strict output validation | 0/28 accepted; 28 FAIL |
| Open vocabulary / Query | 0/10 / 0/6 accepted |
| Negative / Planned / Uncertain / Action mismatch | 0/5 / 0/2 / 0/3 / 0/2 accepted |
| First model load | 34.6 seconds |
| Model response-body bytes, first load | 879,781,744 |
| Runtime response-body bytes, first load | 26,914,834 |
| Reload model load | 32.0 seconds |
| Reload model response-body bytes | 859,106,817 |
| Cache outcome | QuotaExceededError; large weights not retained |
| First / second inference | 18.69 / 15.28 seconds |
| Mean / median / maximum inference | 28.36 / 18.76 / 72.75 seconds |
| Paid inference calls / Product mutations | 0 / 0 |

Markdown-fenced output failed strict parsing. Inspection without the fences also
found UNKNOWN/null actions and malformed/truncated output, so removing fences
alone does not establish semantic quality. Rejected output cannot save anything;
that is containment, not a PASS for negative/planned/uncertain classification.

An offline-emulated cache-only attempt did not reach the expected completion
within the automation timeout. Offline operation is NOT VERIFIED. No tab crash
was observed during the 28 desktop trials; peak memory, heat, battery and sustained
mobile stability remain unmeasured. HTTP caching means body bytes above must not
be described as proven wire re-downloads.

Desktop viewport checks at 360/390/430 found no horizontal overflow. An explicitly
simulated missing WebGPU environment showed the unsupported message and disabled
inference. Product six routes and all 24 fixture routes returned 200; existing
Mock completion/query/negative/new-action API smoke passed. No Product source,
voice hook, matching rules or Activity store was changed.

Final checks: `npm run typecheck`, `npm run lint`, `npm run build` and
`node scripts/local-ai-smoke.mjs` PASS. Harness PASS is not model accuracy PASS.
Existing cycle/month smoke PASS; the cycle runner retains its pre-existing Node
module-type warning. `git diff --check` found no whitespace errors (Git printed
LF-to-CRLF notices). No commit, push or public deployment was performed.

Decision: **PARTIAL** for the four-device feasibility question (manual device
evidence missing). The tested Gemma 3 1B q4 + prompts are **not suitable for Product
adoption** on observed accuracy, latency and cache behavior. This does not prove
every Gemma model impossible. Keep Product Mock/Rule behavior and voice unchanged;
do not remove its API or integrate local inference based on this experiment.
