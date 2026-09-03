import { calculateRecordCandidate } from "./candidate";
import { getCurrentLocalDate, SERVER_TIMEZONE } from "./date";
import { mapActionToDemoCategory, matchDemoItems } from "./demo-matching";
import { AiProviderError, getAIAdapterMode, requestParserOutput } from "./provider";
import { validateParserOutput } from "./schema";
import type { AiParseApiResponse, EnrichedParserSegment, ParserSegment } from "./types";

const maxInputLength = Number(process.env.MAX_AI_INPUT_LENGTH || "500");

function sanitizeInput(input: unknown) {
  if (typeof input !== "string") {
    return { ok: false as const, message: "기록할 내용을 입력해주세요." };
  }

  const text = input.trim();
  if (!text) {
    return { ok: false as const, message: "기록할 내용을 입력해주세요." };
  }

  if (text.length > maxInputLength) {
    return { ok: false as const, message: `기록은 ${maxInputLength}자 이하로 입력해주세요.` };
  }

  return { ok: true as const, text };
}

function enrichSegments(segments: ParserSegment[], currentLocalDate: string): EnrichedParserSegment[] {
  return segments.map((segment) => {
    const candidate = calculateRecordCandidate(segment, currentLocalDate);
    const itemCandidates = matchDemoItems(segment.normalized_action);

    return {
      ...segment,
      demo_category: mapActionToDemoCategory(segment.normalized_action),
      item_match: {
        candidates: itemCandidates,
        needs_review: itemCandidates.length > 1,
      },
      record_candidate: candidate.recordCandidate,
      record_candidate_reason: candidate.reason,
    };
  });
}

export async function parseNaturalLanguageRecord(input: unknown): Promise<AiParseApiResponse> {
  const sanitized = sanitizeInput(input);
  if (!sanitized.ok) {
    return {
      ok: false,
      mode: "MANUAL",
      code: "INPUT_INVALID",
      message: sanitized.message,
    };
  }

  const currentLocalDate = getCurrentLocalDate();

  try {
    let rawOutput = await requestParserOutput({ currentLocalDate, text: sanitized.text });
    let validated = validateParserOutput(rawOutput);

    if (!validated.ok) {
      rawOutput = await requestParserOutput({
        currentLocalDate,
        retryReason: validated.reason,
        text: sanitized.text,
      });
      validated = validateParserOutput(rawOutput);
    }

    if (!validated.ok) {
      return {
        ok: false,
        mode: "MANUAL",
        code: "AI_INVALID_OUTPUT",
        message: "기록을 구조화하지 못했어요. 직접 기록으로 이어갈 수 있어요.",
      };
    }

    return {
      ok: true,
      mode: getAIAdapterMode(),
      parse_id: crypto.randomUUID(),
      prompt_version: validated.value.prompt_version,
      result_type: validated.value.result_type,
      schema_version: validated.value.schema_version,
      overflow_detected: validated.value.overflow_detected,
      server_context: {
        current_local_date: currentLocalDate,
        timezone: SERVER_TIMEZONE,
      },
      segments: enrichSegments(validated.value.segments, currentLocalDate),
    };
  } catch (error) {
    if (error instanceof AiProviderError) {
      return {
        ok: false,
        mode: "MANUAL",
        code: error.code,
        message:
          error.code === "AI_CONFIG_MISSING"
            ? "지금은 기록 이해 기능을 설정해야 해요. 직접 기록으로 이어갈 수 있어요."
            : "지금은 기록을 이해하기 어려워요. 직접 기록으로 이어갈 수 있어요.",
      };
    }

    return {
      ok: false,
      mode: "MANUAL",
      code: "AI_PROVIDER_ERROR",
      message: "지금은 기록을 이해하기 어려워요. 직접 기록으로 이어갈 수 있어요.",
    };
  }
}
