import { aiParserJsonSchema } from "./schema";
import type { ParserOutput, ParserSegment } from "./types";

export type ProviderRequest = {
  text: string;
  currentLocalDate: string;
  retryReason?: string;
};

export interface AIAdapter {
  parse(request: ProviderRequest): Promise<unknown>;
}

type OpenAiResponse = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

export class AiProviderError extends Error {
  code: "AI_CONFIG_MISSING" | "AI_PROVIDER_ERROR" | "AI_TIMEOUT" | "AI_INVALID_OUTPUT";

  constructor(code: AiProviderError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

function getSchemaVersion() {
  return process.env.AI_PARSER_SCHEMA_VERSION || "1.0";
}

function getPromptVersion() {
  return process.env.AI_PARSER_PROMPT_VERSION || "1.1";
}

function createSegment(
  text: string,
  currentLocalDate: string,
  overrides: Omit<ParserSegment, "segment_id" | "original_text">,
): ParserSegment {
  return {
    segment_id: crypto.randomUUID(),
    original_text: text,
    ...overrides,
    performed_date: overrides.date_resolution_source === "IMPLICIT_TODAY" ? currentLocalDate : overrides.performed_date,
  };
}

function createOutput(segments: ParserSegment[]): ParserOutput {
  return {
    schema_version: getSchemaVersion(),
    prompt_version: getPromptVersion(),
    result_type: "OK",
    overflow_detected: false,
    segments,
  };
}

function createTooManyOutput(): ParserOutput {
  return {
    schema_version: getSchemaVersion(),
    prompt_version: getPromptVersion(),
    result_type: "TOO_MANY_ACTIONS",
    overflow_detected: true,
    segments: [],
  };
}

export class MockAIAdapter implements AIAdapter {
  async parse({ text, currentLocalDate }: ProviderRequest) {
    const normalized = text.trim();
    const futureDate = "2099-01-01";

    switch (normalized) {
      case "오늘 이불 빨았어":
        return createOutput([
          createSegment(normalized, currentLocalDate, {
            intent: "COMPLETED",
            scope: "IN_SCOPE",
            normalized_action: "이불 세탁",
            performed_date: currentLocalDate,
            date_precision: "EXACT",
            date_resolution_source: "EXPLICIT",
            needs_clarification: false,
            clarification: null,
          }),
        ]);
      case "칫솔 바꿨어":
        return createOutput([
          createSegment(normalized, currentLocalDate, {
            intent: "COMPLETED",
            scope: "IN_SCOPE",
            normalized_action: "칫솔 교체",
            performed_date: currentLocalDate,
            date_precision: "EXACT",
            date_resolution_source: "IMPLICIT_TODAY",
            needs_clarification: false,
            clarification: null,
          }),
        ]);
      case "오늘 이불 빨려고 해":
        return createOutput([
          createSegment(normalized, currentLocalDate, {
            intent: "PLANNED",
            scope: "IN_SCOPE",
            normalized_action: "이불 세탁",
            performed_date: currentLocalDate,
            date_precision: "EXACT",
            date_resolution_source: "EXPLICIT",
            needs_clarification: false,
            clarification: null,
          }),
        ]);
      case "오늘 이불 못 빨았어":
        return createOutput([
          createSegment(normalized, currentLocalDate, {
            intent: "NOT_COMPLETED",
            scope: "IN_SCOPE",
            normalized_action: "이불 세탁",
            performed_date: currentLocalDate,
            date_precision: "EXACT",
            date_resolution_source: "EXPLICIT",
            needs_clarification: false,
            clarification: null,
          }),
        ]);
      case "이불 언제 빨았지?":
        return createOutput([
          createSegment(normalized, currentLocalDate, {
            intent: "QUERY",
            scope: "IN_SCOPE",
            normalized_action: "이불 세탁",
            performed_date: null,
            date_precision: "NOT_APPLICABLE",
            date_resolution_source: "NONE",
            needs_clarification: false,
            clarification: null,
          }),
        ]);
      case "지난주쯤 이불 빨았던 것 같아":
        return createOutput([
          createSegment(normalized, currentLocalDate, {
            intent: "UNCERTAIN",
            scope: "IN_SCOPE",
            normalized_action: "이불 세탁",
            performed_date: null,
            date_precision: "APPROXIMATE",
            date_resolution_source: "EXPLICIT",
            needs_clarification: true,
            clarification: {
              type: "DATE",
              question: "정확히 어느 날 이불을 빨았나요?",
            },
          }),
        ]);
      case "오늘 영화 봤어":
        return createOutput([
          createSegment(normalized, currentLocalDate, {
            intent: "COMPLETED",
            scope: "OUT_OF_SCOPE",
            normalized_action: "영화 보기",
            performed_date: currentLocalDate,
            date_precision: "EXACT",
            date_resolution_source: "EXPLICIT",
            needs_clarification: false,
            clarification: null,
          }),
        ]);
      case "asdf qwer zxcv":
        return createOutput([
          createSegment(normalized, currentLocalDate, {
            intent: "UNKNOWN",
            scope: "UNCERTAIN",
            normalized_action: null,
            performed_date: null,
            date_precision: "UNKNOWN",
            date_resolution_source: "NONE",
            needs_clarification: true,
            clarification: {
              type: "ACTION",
              question: "무엇을 완료했는지 다시 적어주세요.",
            },
          }),
        ]);
      case "내일 이불 빨았어":
        return createOutput([
          createSegment(normalized, currentLocalDate, {
            intent: "COMPLETED",
            scope: "IN_SCOPE",
            normalized_action: "이불 세탁",
            performed_date: futureDate,
            date_precision: "EXACT",
            date_resolution_source: "EXPLICIT",
            needs_clarification: true,
            clarification: {
              type: "DATE",
              question: "미래 날짜처럼 보여요. 실제로 완료한 날짜를 확인해주세요.",
            },
          }),
        ]);
      case "오늘 이불 빨고 칫솔 바꾸고 세탁조 청소하고 정수기 필터 갈고 렌즈 바꾸고 에어컨 청소했어":
        return createTooManyOutput();
      default:
        return createOutput([
          createSegment(normalized, currentLocalDate, {
            intent: "UNKNOWN",
            scope: "UNCERTAIN",
            normalized_action: null,
            performed_date: null,
            date_precision: "UNKNOWN",
            date_resolution_source: "NONE",
            needs_clarification: true,
            clarification: {
              type: "ACTION",
              question: "생활관리로 기록할 일을 한 문장으로 다시 적어주세요.",
            },
          }),
        ]);
    }
  }
}

function getTimeoutMs() {
  const raw = Number(process.env.AI_PARSER_TIMEOUT_MS || "15000");
  return Number.isFinite(raw) && raw > 0 ? raw : 15000;
}

function extractOutputText(response: OpenAiResponse) {
  if (typeof response.output_text === "string") return response.output_text;

  for (const output of response.output ?? []) {
    for (const content of output.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return null;
}

function buildInstructions(currentLocalDate: string, retryReason?: string) {
  return [
    "You are LASTLY's natural-language parser for Korean 생활관리 records.",
    "Return structured JSON only. Do not include markdown or commentary.",
    `schema_version must be ${getSchemaVersion()}.`,
    `prompt_version must be ${getPromptVersion()}.`,
    `Server current_local_date is ${currentLocalDate} in Asia/Seoul.`,
    "The parser must not choose item_id, database IDs, record_candidate, cycle, save decisions, or item matching.",
    "Clarification type must be one of COMPLETION, ACTION, DATE, SCOPE. Never use TARGET.",
    "If 6 or more semantic actions are present, return result_type TOO_MANY_ACTIONS, overflow_detected true, and segments [].",
    "A completed record needs COMPLETED intent, IN_SCOPE scope, normalized_action, exact non-future performed_date, and no clarification. The server decides record_candidate later.",
    "Explicit date expressions such as 오늘 use date_resolution_source EXPLICIT. Missing date with otherwise completed in-scope action may use IMPLICIT_TODAY.",
    "Planned, not completed, query, unknown, out-of-scope, approximate date, future date, or unresolved ambiguity must not be made into a completed save-ready fact.",
    retryReason ? `Previous output was invalid: ${retryReason}. Correct the JSON contract now.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export class OpenAIAdapter implements AIAdapter {
  async parse({ text, currentLocalDate, retryReason }: ProviderRequest) {
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL || "gpt-4.1-mini";

    if (!apiKey) {
      throw new AiProviderError("AI_CONFIG_MISSING", "AI_API_KEY 설정이 필요합니다.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), getTimeoutMs());

    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        body: JSON.stringify({
          input: [
            {
              role: "system",
              content: buildInstructions(currentLocalDate, retryReason),
            },
            {
              role: "user",
              content: text,
            },
          ],
          model,
          store: false,
          text: {
            format: {
              type: "json_schema",
              name: "lastly_parser_response",
              description: "LASTLY Parser JSON Schema 1.0 response",
              strict: true,
              schema: aiParserJsonSchema,
            },
          },
        }),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new AiProviderError("AI_PROVIDER_ERROR", "AI Provider 요청이 실패했습니다.");
      }

      const payload = (await response.json()) as OpenAiResponse;
      const outputText = extractOutputText(payload);

      if (!outputText) {
        throw new AiProviderError("AI_INVALID_OUTPUT", "AI Provider 응답에서 JSON 텍스트를 찾지 못했습니다.");
      }

      try {
        return JSON.parse(outputText) as unknown;
      } catch {
        throw new AiProviderError("AI_INVALID_OUTPUT", "AI Provider 응답 JSON 파싱에 실패했습니다.");
      }
    } catch (error) {
      if (error instanceof AiProviderError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new AiProviderError("AI_TIMEOUT", "AI Provider 응답 시간이 초과되었습니다.");
      }
      throw new AiProviderError("AI_PROVIDER_ERROR", "AI Provider 요청 중 오류가 발생했습니다.");
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function createAIAdapter(): AIAdapter {
  const provider = process.env.AI_PROVIDER || "openai";

  if (provider === "mock") {
    return new MockAIAdapter();
  }

  if (provider === "openai") {
    return new OpenAIAdapter();
  }

  throw new AiProviderError("AI_CONFIG_MISSING", "지원되는 AI Provider 설정이 필요합니다.");
}

export function getAIAdapterMode() {
  return process.env.AI_PROVIDER === "mock" ? "MOCK" : "REAL";
}

export async function requestParserOutput(request: ProviderRequest) {
  return createAIAdapter().parse(request);
}
