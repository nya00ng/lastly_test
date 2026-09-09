import {
  clarificationTypes,
  datePrecisions,
  dateResolutionSources,
  parserIntents,
  parserResultTypes,
  parserScopes,
  type ParserClarification,
  type ParserOutput,
  type ParserSegment,
} from "./types";

const parserSchemaVersion = process.env.AI_PARSER_SCHEMA_VERSION || "1.0";
const parserPromptVersion = process.env.AI_PARSER_PROMPT_VERSION || "1.1";

export const aiParserJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["schema_version", "prompt_version", "result_type", "overflow_detected", "segments"],
  properties: {
    schema_version: { type: "string" },
    prompt_version: { type: "string" },
    result_type: { type: "string", enum: parserResultTypes },
    overflow_detected: { type: "boolean" },
    segments: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "segment_id",
          "original_text",
          "intent",
          "scope",
          "normalized_action",
          "performed_date",
          "date_precision",
          "date_resolution_source",
          "needs_clarification",
          "clarification",
        ],
        properties: {
          segment_id: { type: "string" },
          original_text: { type: "string" },
          intent: { type: "string", enum: parserIntents },
          scope: { type: "string", enum: parserScopes },
          normalized_action: { anyOf: [{ type: "string" }, { type: "null" }] },
          performed_date: { anyOf: [{ type: "string" }, { type: "null" }] },
          date_precision: { type: "string", enum: datePrecisions },
          date_resolution_source: { type: "string", enum: dateResolutionSources },
          needs_clarification: { type: "boolean" },
          clarification: {
            anyOf: [
              {
                type: "object",
                additionalProperties: false,
                required: ["type", "question"],
                properties: {
                  type: { type: "string", enum: clarificationTypes },
                  question: { type: "string" },
                },
              },
              { type: "null" },
            ],
          },
          tag_candidates: {
            type: "array",
            maxItems: 10,
            items: { type: "string", maxLength: 30 },
          },
        },
      },
    },
  },
} as const;

type ValidationResult<T> = { ok: true; value: T } | { ok: false; reason: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends readonly string[]>(value: unknown, allowed: T): value is T[number] {
  return typeof value === "string" && allowed.includes(value);
}

function validateClarification(value: unknown): ValidationResult<ParserClarification | null> {
  if (value === null) return { ok: true, value };
  if (!isRecord(value)) return { ok: false, reason: "clarification must be an object or null" };
  if (!isOneOf(value.type, clarificationTypes)) return { ok: false, reason: "invalid clarification type" };
  if (typeof value.question !== "string") return { ok: false, reason: "clarification question required" };
  return { ok: true, value: { type: value.type, question: value.question } };
}

function validateSegment(value: unknown): ValidationResult<ParserSegment> {
  if (!isRecord(value)) return { ok: false, reason: "segment must be an object" };

  const clarification = validateClarification(value.clarification);
  if (!clarification.ok) return clarification;

  if (typeof value.segment_id !== "string") return { ok: false, reason: "segment_id required" };
  if (typeof value.original_text !== "string") return { ok: false, reason: "original_text required" };
  if (!isOneOf(value.intent, parserIntents)) return { ok: false, reason: "invalid intent" };
  if (!isOneOf(value.scope, parserScopes)) return { ok: false, reason: "invalid scope" };
  if (value.normalized_action !== null && typeof value.normalized_action !== "string") {
    return { ok: false, reason: "normalized_action must be string or null" };
  }
  if (value.performed_date !== null && typeof value.performed_date !== "string") {
    return { ok: false, reason: "performed_date must be string or null" };
  }
  if (!isOneOf(value.date_precision, datePrecisions)) return { ok: false, reason: "invalid date precision" };
  if (!isOneOf(value.date_resolution_source, dateResolutionSources)) {
    return { ok: false, reason: "invalid date resolution source" };
  }
  if (typeof value.needs_clarification !== "boolean") {
    return { ok: false, reason: "needs_clarification required" };
  }
  if (value.tag_candidates !== undefined && (
    !Array.isArray(value.tag_candidates) ||
    value.tag_candidates.some((candidate) => typeof candidate !== "string" || candidate.trim().length === 0 || candidate.trim().length > 30)
  )) {
    return { ok: false, reason: "tag_candidates must be non-empty strings up to 30 characters" };
  }

  return {
    ok: true,
    value: {
      segment_id: value.segment_id,
      original_text: value.original_text,
      intent: value.intent,
      scope: value.scope,
      normalized_action: value.normalized_action,
      performed_date: value.performed_date,
      date_precision: value.date_precision,
      date_resolution_source: value.date_resolution_source,
      needs_clarification: value.needs_clarification,
      clarification: clarification.value,
      tag_candidates: Array.isArray(value.tag_candidates)
        ? Array.from(new Set(value.tag_candidates.map((candidate) => candidate.trim())))
        : [],
    },
  };
}

export function validateParserOutput(value: unknown): ValidationResult<ParserOutput> {
  if (!isRecord(value)) return { ok: false, reason: "parser output must be an object" };
  if (value.schema_version !== parserSchemaVersion) return { ok: false, reason: "schema version mismatch" };
  if (value.prompt_version !== parserPromptVersion) return { ok: false, reason: "prompt version mismatch" };
  if (!isOneOf(value.result_type, parserResultTypes)) return { ok: false, reason: "invalid result type" };
  if (typeof value.overflow_detected !== "boolean") return { ok: false, reason: "overflow flag required" };
  if (!Array.isArray(value.segments)) return { ok: false, reason: "segments must be an array" };
  if (value.segments.length > 5) return { ok: false, reason: "too many segments in output" };

  if (value.result_type === "TOO_MANY_ACTIONS") {
    if (!value.overflow_detected || value.segments.length !== 0) {
      return { ok: false, reason: "TOO_MANY_ACTIONS must have overflow_detected=true and no segments" };
    }
    return {
      ok: true,
      value: {
        schema_version: value.schema_version,
        prompt_version: value.prompt_version,
        result_type: value.result_type,
        overflow_detected: value.overflow_detected,
        segments: [],
      },
    };
  }

  const segments: ParserSegment[] = [];
  for (const segment of value.segments) {
    const validated = validateSegment(segment);
    if (!validated.ok) return validated;
    segments.push(validated.value);
  }

  return {
    ok: true,
    value: {
      schema_version: value.schema_version,
      prompt_version: value.prompt_version,
      result_type: value.result_type,
      overflow_detected: value.overflow_detected,
      segments,
    },
  };
}
