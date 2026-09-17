import { NextResponse, type NextRequest } from "next/server";
import { parseNaturalLanguageRecord } from "@/lib/ai/parser";
import { getCurrentLocalDate } from "@/lib/ai/date";
import { validateRulePilot } from "@/lib/ai/rule-pilot";

export const runtime = "nodejs";

function pilotDisallowed() {
  return process.env.AI_PROVIDER === "rule-v21" && process.env.VERCEL_ENV === "production";
}

export function GET() {
  if (pilotDisallowed()) return NextResponse.json({ error: "PILOT_PREVIEW_ONLY" }, { status: 503 });
  return NextResponse.json({ provider: process.env.AI_PROVIDER || "mock", currentLocalDate: getCurrentLocalDate() },
    { headers: { "Cache-Control": "no-store" } });
}

const rateLimitWindowMs = 60_000;
const maxRequestsPerWindow = 20;
const buckets = new Map<string, number[]>();

function getClientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local-demo";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const active = (buckets.get(key) || []).filter((timestamp) => now - timestamp < rateLimitWindowMs);
  active.push(now);
  buckets.set(key, active);

  return active.length > maxRequestsPerWindow;
}

export async function POST(request: NextRequest) {
  if (pilotDisallowed()) return NextResponse.json({ ok: false, mode: "MANUAL", code: "AI_CONFIG_MISSING",
    message: "이 Parser는 시험 환경에서만 사용할 수 있어요." }, { status: 503 });
  if (isRateLimited(getClientKey(request))) {
    return NextResponse.json(
      {
        ok: false,
        mode: "MANUAL",
        code: "RATE_LIMITED",
        message: "잠시 후 다시 시도해주세요. 직접 기록으로 이어갈 수 있어요.",
      },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        mode: "MANUAL",
        code: "INPUT_INVALID",
        message: "기록할 내용을 입력해주세요.",
      },
      { status: 400 },
    );
  }

  const text = typeof body === "object" && body !== null && "text" in body ? body.text : undefined;
  if (process.env.AI_PROVIDER === "rule-v21") {
    const proposal = body as { rule_output?: unknown; rule_confidences?: unknown } | null;
    const result = validateRulePilot(text, proposal?.rule_output, proposal?.rule_confidences, getCurrentLocalDate());
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }
  const result = await parseNaturalLanguageRecord(text);

  const status = result.ok ? 200 : result.code === "AI_CONFIG_MISSING" ? 503 : 400;
  return NextResponse.json(result, { status });
}
