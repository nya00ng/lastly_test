import { NextResponse, type NextRequest } from "next/server";
import { parseNaturalLanguageRecord } from "@/lib/ai/parser";

export const runtime = "nodejs";

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
  const result = await parseNaturalLanguageRecord(text);

  const status = result.ok ? 200 : result.code === "AI_CONFIG_MISSING" ? 503 : 400;
  return NextResponse.json(result, { status });
}
