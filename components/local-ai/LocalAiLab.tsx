"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { labCases, type LabCase } from "@/lib/local-ai/cases";
import { LAB_CACHE, LAB_RUN_KEY, LOAD_TIMEOUT_MS, LOCAL_MODEL, PARSE_TIMEOUT_MS } from "@/lib/local-ai/config";
import { validateLocalOutput } from "@/lib/local-ai/contract";
import { probeCapabilities } from "@/lib/local-ai/probe";
import { getCurrentLocalDate } from "@/lib/ai/date";
import { matchDemoItems } from "@/lib/ai/demo-matching";

type WorkerResult = { id: number; type: string; operation?: string; raw?: string; ms?: number; error?: string; metrics?: Record<string, number>; progress?: unknown; offlineOnly?: boolean };
type Row = { id: string; text: string; raw: string; ms: number; checked: ReturnType<typeof validateLocalOutput>; matches: ReturnType<typeof matchDemoItems>[]; automaticChecks: string[]; verdict: "FAIL" | "MANUAL_REVIEW"; semanticReview: "PENDING" | "PASS" | "FAIL" };
const button = "min-h-11 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";

export default function LocalAiLab() {
  const [probe, setProbe] = useState<Awaited<ReturnType<typeof probeCapabilities>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("미측정");
  const [text, setText] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loads, setLoads] = useState<WorkerResult[]>([]);
  const [errors, setErrors] = useState<Array<{ at: string; elapsedMs: number; message: string }>>([]);
  const [progress, setProgress] = useState<unknown>(null);
  const [offlineOnly, setOfflineOnly] = useState(false);
  const [priorRun, setPriorRun] = useState<string | null>(null);
  const [deviceLabel, setDeviceLabel] = useState("DESKTOP / OTHER");
  const [manualNotes, setManualNotes] = useState("");
  const worker = useRef<Worker | null>(null);
  const pending = useRef<{ resolve: (value: WorkerResult) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> } | null>(null);
  const operation = useRef(false);
  const cancelled = useRef(false);
  const sequence = useRef(0);
  const capturedPrior = useRef(false);

  useEffect(() => {
    return () => {
      cancelled.current = true;
      worker.current?.terminate();
      if (pending.current) { clearTimeout(pending.current.timer); pending.current.reject(Error("UNMOUNTED")); pending.current = null; }
    };
  }, []);

  function markRun(value: string | null) {
    try { if (value) localStorage.setItem(LAB_RUN_KEY, value); else localStorage.removeItem(LAB_RUN_KEY); } catch { /* Optional crash breadcrumb only. */ }
  }

  function stop() {
    cancelled.current = true;
    worker.current?.terminate(); worker.current = null;
    if (pending.current) { clearTimeout(pending.current.timer); pending.current.reject(Error("CANCELLED")); pending.current = null; }
    setReady(false);
    setMessage("중지됨. 모델을 다시 불러오세요.");
  }

  async function request(type: "load" | "parse", input?: string): Promise<WorkerResult> {
    if (!worker.current) {
      worker.current = new Worker(new URL("../../lib/local-ai/worker.ts", import.meta.url), { type: "module" });
      worker.current.onmessage = (event: MessageEvent<WorkerResult>) => {
        if (event.data.type === "progress") { setProgress(event.data); return; }
        const current = pending.current;
        if (!current) return;
        clearTimeout(current.timer); pending.current = null;
        if (event.data.type === "error") {
          if (event.data.operation === "load") setLoads((previous) => [...previous, event.data]);
          current.reject(Error(event.data.error ?? "WORKER_ERROR"));
        }
        else current.resolve(event.data);
      };
      worker.current.onerror = () => {
        if (pending.current) { clearTimeout(pending.current.timer); pending.current.reject(Error("WORKER_CRASH_OR_LOAD_FAILURE")); pending.current = null; }
      };
    }
    const instance = worker.current;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        instance.terminate(); worker.current = null; pending.current = null; setReady(false);
        reject(Error(`${type.toUpperCase()}_TIMEOUT`));
      }, type === "load" ? LOAD_TIMEOUT_MS : PARSE_TIMEOUT_MS);
      pending.current = { resolve, reject, timer };
      instance.postMessage({ id: ++sequence.current, type, text: input, today: getCurrentLocalDate(), offlineOnly });
    });
  }

  async function run(task: () => Promise<void>) {
    if (operation.current) return;
    if (!capturedPrior.current) {
      try { setPriorRun(localStorage.getItem(LAB_RUN_KEY)); } catch { /* Optional breadcrumb. */ }
      capturedPrior.current = true;
    }
    operation.current = true; cancelled.current = false; setBusy(true);
    const started = performance.now();
    markRun(JSON.stringify({ startedAt: new Date().toISOString(), deviceLabel, model: LOCAL_MODEL.id }));
    try { await task(); }
    catch (error) {
      worker.current?.terminate(); worker.current = null; setReady(false);
      const reason = error instanceof Error ? error.message : "실험 실패";
      setErrors((previous) => [...previous, { at: new Date().toISOString(), elapsedMs: performance.now() - started, message: reason }]);
      setMessage(reason);
    } finally { operation.current = false; setBusy(false); markRun(null); }
  }

  async function load() {
    worker.current?.terminate(); worker.current = null; setReady(false); setProgress(null);
    const capability = await probeCapabilities(); setProbe(capability);
    if (cancelled.current) return;
    if (!capability.device) throw Error("WEBGPU_UNAVAILABLE: 직접 입력 Product는 그대로 사용할 수 있습니다.");
    setMessage("모델을 불러오는 중");
    const result = await request("load");
    setLoads((previous) => [...previous, result]); setReady(true); setMessage("모델 준비 완료. Parser 정확도는 아직 미검증입니다.");
  }

  async function parse(input: string, test?: LabCase) {
    const today = getCurrentLocalDate();
    const result = await request("parse", input);
    const raw = result.raw ?? "";
    const checked = validateLocalOutput(raw, input, today);
    const matches = checked.ok ? checked.value.segments.map((segment) => matchDemoItems(segment.normalized_action, undefined, segment.tag_candidates, { requireTagMatch: segment.intent === "QUERY" })) : [];
    const failures: string[] = [];
    if (!checked.ok) failures.push(checked.reason);
    else if (test) {
      if (checked.value.segments.length !== 1 || !test.intents.includes(checked.value.segments[0]?.intent)) failures.push("INTENT_MISMATCH");
      if (checked.value.segments.some((segment) => !segment.normalized_action)) failures.push("ACTION_MISSING");
      if (!test.intents.includes("COMPLETED") && checked.diagnostics.some((candidate) => candidate.recordCandidate)) failures.push("FALSE_COMPLETION");
      if (test.intents.includes("COMPLETED") && !checked.diagnostics.some((candidate) => candidate.recordCandidate)) failures.push("COMPLETION_NOT_CANDIDATE");
      if (test.intents.includes("COMPLETED") && checked.value.segments.some((segment) => segment.date_resolution_source !== "IMPLICIT_TODAY")) failures.push("DATE_SOURCE_MISMATCH");
      if (test.forbiddenMatch && matches.flat().some((match) => match.name === test.forbiddenMatch)) failures.push("ACTION_MISMATCH_CANDIDATE");
    }
    setRows((previous) => [...previous, { id: `${Date.now()}-${sequence.current}`, text: input, raw, ms: result.ms ?? 0, checked, matches, automaticChecks: failures.length ? failures : ["STRUCTURE_AND_INTENT_CHECKS_OK; SEMANTIC_REVIEW_REQUIRED"], verdict: failures.length ? "FAIL" : "MANUAL_REVIEW", semanticReview: "PENDING" }]);
  }

  function downloadReport() {
    const times = rows.map((row) => row.ms).sort((a, b) => a - b);
    const report = {
      capturedAt: new Date().toISOString(), deviceLabel, model: LOCAL_MODEL, probe, loads, rows, errors, progress, priorInterruptedRun: priorRun, manualNotes,
      latency: { count: times.length, firstMs: rows[0]?.ms ?? null, secondMs: rows[1]?.ms ?? null, meanMs: times.length ? times.reduce((a, b) => a + b, 0) / times.length : null, p50Ms: times.length ? times[Math.floor((times.length - 1) / 2)] : null, maxMs: times.at(-1) ?? null },
      verdict: "PARTIAL", paidInferenceRequests: 0, mutationPaths: 0,
      deviceMemoryStability: "MANUAL DEVICE REQUIRED", heatBattery: "MANUAL DEVICE REQUIRED",
      offlinePageReload: "NOT IMPLEMENTED (no service worker)",
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = `lastly-local-parser-${Date.now()}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 text-neutral-900">
    <header className="flex items-center justify-between gap-3"><h1 className="text-xl font-semibold">Local Parser Lab</h1><Link href="/" className="underline">LASTLY</Link></header>
    <p className="text-sm">TEXT ONLY · 실험 · 저장 기능 없음 · 자동 유료 API 전환 없음</p>
    <label className="block text-sm">검증 기기<select className="mt-2 block min-h-11 w-full rounded-lg border p-2" value={deviceLabel} onChange={(event) => setDeviceLabel(event.target.value)} disabled={busy}>{["DESKTOP / OTHER", "iPhone 16 Pro Safari", "iPhone 16 Pro Chrome", "Z Flip3 Chrome", "Z Flip3 Samsung Internet"].map((device) => <option key={device}>{device}</option>)}</select></label>
    <section className="space-y-3 border-y py-4">
      <h2 className="font-semibold">실행 환경</h2>
      <button className={button} disabled={busy} onClick={() => run(async () => { setProbe(await probeCapabilities()); setMessage("환경 검사 완료"); })}>환경 검사</button>
      {probe && <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-all text-xs">{JSON.stringify(probe, null, 2)}</pre>}
      {priorRun && <p role="status" className="text-sm">이전 실행이 종료 기록 없이 남았습니다. 탭 종료·새로고침·중단 여부를 수동 기록하세요: {priorRun}</p>}
    </section>
    <section className="space-y-3">
      <h2 className="font-semibold">Gemma 3 1B · q4 · WebGPU</h2>
      <p className="text-sm">공개 파일 크기: 가중치 {(LOCAL_MODEL.publishedWeightBytes / 1e6).toFixed(1)} MB + tokenizer 약 20.3 MB. 실측 다운로드·RAM과 다릅니다. Wi-Fi 사용을 권장합니다.</p>
      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={offlineOnly} disabled={busy || ready} onChange={(event) => setOfflineOnly(event.target.checked)} />모델 파일 캐시 전용 (네트워크 다운로드 차단)</label>
      <div className="flex flex-wrap gap-2">
        <button className={button} disabled={busy} onClick={() => run(load)}>모델 불러오기 / 다시 로드</button>
        <button className={button} disabled={!busy && !ready} onClick={stop}>중지 / 메모리 해제</button>
        <button className={button} disabled={busy || ready} onClick={() => run(async () => { await caches.delete(LAB_CACHE); setMessage("실험 전용 모델 캐시 삭제 완료"); })}>실험 캐시 삭제</button>
      </div>
      <p role="status" aria-live="polite" className="break-words text-sm">{message}</p>
      {progress !== null && <details><summary>다운로드 진행</summary><pre className="overflow-auto whitespace-pre-wrap break-all text-xs">{JSON.stringify(progress, null, 2)}</pre></details>}
      {loads.length > 0 && <pre className="overflow-auto whitespace-pre-wrap break-all text-xs">{JSON.stringify(loads, null, 2)}</pre>}
    </section>
    <section className="space-y-3 border-y py-4">
      <label className="block font-semibold" htmlFor="lab-text">자유 입력</label>
      <textarea id="lab-text" className="min-h-28 w-full rounded-lg border p-3 text-base" value={text} onChange={(event) => setText(event.target.value)} disabled={busy} />
      <div className="flex flex-wrap gap-2">
        <button className={button} disabled={busy || !ready || !text.trim() || text.length > 500} onClick={() => run(async () => { await parse(text.trim()); setMessage("추론 완료. 의미 정확도를 검토하세요."); })}>분석</button>
        <button className={button} disabled={busy || !ready} onClick={() => run(async () => { for (const test of labCases) { if (cancelled.current) break; setMessage(`${test.id}: ${test.text}`); await parse(test.text, test); } if (!cancelled.current) setMessage("28문장 실행 완료. FAIL과 의미 검토 결과를 확인하세요."); })}>28문장 평가 실행</button>
      </div>
      {text.length > 500 && <p className="text-sm">500자 이하로 입력해주세요.</p>}
    </section>
    <section className="space-y-3"><h2 className="font-semibold">결과 ({rows.length})</h2>{rows.map((row) => <article key={row.id} className="space-y-2 border-b py-3">
      <h3 className="font-medium">{row.text}</h3><p className="break-words text-sm">{row.verdict} · {(row.ms / 1000).toFixed(2)}초 · {row.automaticChecks.join(", ")}</p>
      <label className="block text-sm">사람의 의미 검토<select className="ml-2 min-h-11 border" value={row.semanticReview} onChange={(event) => setRows((previous) => previous.map((item) => item.id === row.id ? { ...item, semanticReview: event.target.value as Row["semanticReview"] } : item))}>{["PENDING", "PASS", "FAIL"].map((value) => <option key={value}>{value}</option>)}</select></label>
      <details><summary>원본 JSON / 검증 / Matching</summary><pre className="max-h-96 overflow-auto whitespace-pre-wrap break-all text-xs">{JSON.stringify({ raw: row.raw, checked: row.checked, matches: row.matches }, null, 2)}</pre></details>
    </article>)}</section>
    <label className="block text-sm">발열·배터리·탭 종료·캐시·오프라인 수동 관찰<textarea className="mt-2 min-h-24 w-full rounded-lg border p-3 text-base" value={manualNotes} onChange={(event) => setManualNotes(event.target.value)} /></label>
    <button className={button} onClick={downloadReport} disabled={busy}>검증 결과 JSON 내려받기</button>
  </main>;
}
