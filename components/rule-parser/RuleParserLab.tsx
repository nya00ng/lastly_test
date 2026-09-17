"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getCurrentLocalDate } from "@/lib/ai/date";

export default function RuleParserLab() {
  const worker = useRef<Worker | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const request = useRef(0);
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("V2.3 · Garu 0.9.17 / 저장 없는 독립 실험");
  const [result, setResult] = useState<unknown>(null);
  useEffect(() => () => { worker.current?.terminate(); if (timer.current) clearTimeout(timer.current); }, []);
  function run() {
    setBusy(true); setResult(null);
    if (!worker.current) {
      worker.current = new Worker(new URL("../../lib/rule-parser/worker.ts", import.meta.url), { type: "module" });
      worker.current.onmessage = ({ data }) => {
        if (data.id !== request.current) return;
        if (timer.current) clearTimeout(timer.current);
        setBusy(false);
        if (data.error) { worker.current?.terminate(); worker.current = null; setReady(false); setStatus(`실험 오류: ${data.error}`); return; }
        if (data.initializedMs !== undefined) { setReady(true); setStatus(`초기화 ${data.initializedMs.toFixed(1)}ms`); }
        if (data.result) { setResult(data.result); setStatus(`분석 ${data.result.ms.toFixed(1)}ms · 저장 없음`); }
      };
      worker.current.onerror = () => { if (timer.current) clearTimeout(timer.current); worker.current?.terminate(); worker.current = null; setReady(false); setBusy(false); setStatus("분석기를 불러오지 못했어요."); };
    }
    request.current += 1;
    worker.current.postMessage({ id: request.current, today: getCurrentLocalDate(), ...(ready ? { text } : {}) });
    timer.current = setTimeout(() => { worker.current?.terminate(); worker.current = null; setReady(false); setBusy(false); setStatus("시간 초과 · 다시 초기화해주세요."); }, 30000);
  }
  return <main style={{ maxWidth: 760, margin: "0 auto", padding: 20, overflowWrap: "anywhere" }}>
    <Link href="/">LASTLY</Link><h1 style={{ fontSize: 26, marginBlock: 20 }}>Rule Parser Lab V2.3</h1>
    <p>원문·형태소·해석을 비교하는 실험입니다. Product 저장과 연결되지 않습니다.</p>
    <label style={{ display: "block", marginTop: 20 }}>한국어 입력
      <textarea value={text} onChange={e => setText(e.target.value)} rows={4} style={{ display: "block", width: "100%", padding: 12, border: "1px solid #8d9994", borderRadius: 8 }} />
    </label>
    <button onClick={run} disabled={busy || ready && (!text.trim() || text.length > 500)} style={{ minHeight: 44, padding: 12, border: "1px solid #61766b", marginBlock: 12, borderRadius: 8 }}>
      {busy ? "분석 중" : ready ? "분석하기" : "분석기 초기화"}
    </button>
    <p role="status">{status}</p>
    {result !== null && <section aria-label="분석 결과"><h2 style={{ fontSize: 17 }}>확인 결과 · 자동 저장 없음</h2>
      <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: 13 }}>{JSON.stringify(result, null, 2)}</pre>
    </section>}
  </main>;
}
