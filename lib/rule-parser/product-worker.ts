import { Garu } from "garu-ko/browser";
import { prepareProductRule } from "./product-pipeline";
import type { DemoItem } from "../demo-data";

let initialization: Promise<Garu> | null = null;
let analyzer: Garu | null = null;
const analyze = (text: string) => {
  const result = analyzer!.analyze(text);
  return (Array.isArray(result) ? result[0] : result).tokens;
};
self.onmessage = async ({ data }: MessageEvent<{ id: number; text: string; today: string; items: DemoItem[] }>) => {
  try {
    let initMs = 0;
    if (!analyzer) {
      const start = performance.now();
      initialization ??= Garu.load();
      analyzer = await initialization;
      initMs = performance.now() - start;
    }
    const start = performance.now();
    const result = prepareProductRule(data.text, analyze, data.today, data.items);
    self.postMessage({ id: data.id, result: { ...result, initMs, parseMs: performance.now() - start } });
  } catch {
    initialization = null;
    self.postMessage({ id: data.id, error: "RULE_PARSER_UNAVAILABLE" });
  }
};
