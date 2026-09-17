import type { DemoItem } from "../demo-data";
import type { ParserOutput } from "../ai/types";
import type { contextualMatches } from "./matching-v21";
type Result = { output: ParserOutput; matching: ReturnType<typeof contextualMatches>[];
  confidences: string[]; names: (string | null)[]; initMs: number; parseMs: number };
let worker: Worker | null = null;
let sequence = 0;
const pending = new Map<number, { resolve: (r: Result) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }>();
function fail() {
  worker?.terminate(); worker = null;
  for (const entry of pending.values()) {
    clearTimeout(entry.timer); entry.reject(new Error("로컬 Parser를 준비하지 못했어요. 연결을 확인하고 다시 시도해주세요."));
  }
  pending.clear();
}
// One lazy worker per browser page lifetime, reused across Composer mounts.
export function parseProductRule(text: string, today: string, items: DemoItem[]): Promise<Result> {
  if (!worker) {
    worker = new Worker(new URL("./product-worker.ts", import.meta.url), { type: "module" });
    worker.onerror = fail;
    worker.onmessage = ({ data }: MessageEvent<{ id: number; result?: Result; error?: string }>) => {
      if (data.error) { fail(); return; }
      const request = pending.get(data.id);
      if (!request || !data.result) return;
      clearTimeout(request.timer); pending.delete(data.id); request.resolve(data.result);
    };
  }
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, timer: setTimeout(fail, 30000) });
    try { worker!.postMessage({ id, text, today, items }); } catch { fail(); }
  });
}
