import type { DemoItem } from "../demo-data";
import type { AiParseApiResponse } from "./types";

export async function parseProductInput(text: string, items: DemoItem[]): Promise<AiParseApiResponse> {
  const configResponse = await fetch("/api/ai/parse", { cache: "no-store" });
  if (!configResponse.ok) throw new Error("Parser 설정을 확인하지 못했어요. 다시 시도해주세요.");
  const config = await configResponse.json() as { provider: string; currentLocalDate: string };
  let rule: Awaited<ReturnType<typeof import("../rule-parser/product-client").parseProductRule>> | undefined;
  if (config.provider === "rule-v21") {
    try {
      const { parseProductRule } = await import("../rule-parser/product-client");
      rule = await parseProductRule(text, config.currentLocalDate, items);
    } catch {
      throw new Error("로컬 Parser를 준비하지 못했어요. 연결을 확인하고 다시 시도해주세요.");
    }
  }
  const response = await fetch("/api/ai/parse", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, ...(rule ? { rule_output: rule.output, rule_confidences: rule.confidences } : {}) }) });
  const payload = await response.json() as AiParseApiResponse;
  if (rule && payload.ok) {
    if (payload.mode !== "RULE" || payload.segments.length !== rule.matching.length) throw new Error("Parser 설정이 변경됐어요. 다시 시도해주세요.");
    return { ...payload, timing: { initMs: rule.initMs, parseMs: rule.parseMs }, segments: payload.segments.map((s, i) => ({ ...s,
      suggested_item_name: rule.names[i], item_match: { candidates: rule.matching[i].candidates, needs_review: rule.matching[i].candidates.length > 1 } })) };
  }
  return payload;
}
