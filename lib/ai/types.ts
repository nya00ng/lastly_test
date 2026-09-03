export const parserIntents = [
  "COMPLETED",
  "PLANNED",
  "NOT_COMPLETED",
  "UNCERTAIN",
  "QUERY",
  "UNKNOWN",
] as const;

export const parserScopes = ["IN_SCOPE", "OUT_OF_SCOPE", "UNCERTAIN"] as const;
export const datePrecisions = ["EXACT", "APPROXIMATE", "UNKNOWN", "NOT_APPLICABLE"] as const;
export const dateResolutionSources = ["EXPLICIT", "IMPLICIT_TODAY", "NONE"] as const;
export const clarificationTypes = ["COMPLETION", "ACTION", "DATE", "SCOPE"] as const;
export const parserResultTypes = ["OK", "TOO_MANY_ACTIONS"] as const;

export type ParserIntent = (typeof parserIntents)[number];
export type ParserScope = (typeof parserScopes)[number];
export type DatePrecision = (typeof datePrecisions)[number];
export type DateResolutionSource = (typeof dateResolutionSources)[number];
export type ClarificationType = (typeof clarificationTypes)[number];
export type ParserResultType = (typeof parserResultTypes)[number];

export type ParserClarification = {
  type: ClarificationType;
  question: string;
};

export type ParserSegment = {
  segment_id: string;
  original_text: string;
  intent: ParserIntent;
  scope: ParserScope;
  normalized_action: string | null;
  performed_date: string | null;
  date_precision: DatePrecision;
  date_resolution_source: DateResolutionSource;
  needs_clarification: boolean;
  clarification: ParserClarification | null;
};

export type ParserOutput = {
  schema_version: string;
  prompt_version: string;
  result_type: ParserResultType;
  overflow_detected: boolean;
  segments: ParserSegment[];
};

export type AiRuntimeMode = "REAL" | "ERROR" | "MANUAL";

export type ItemMatchingCandidate = {
  name: string;
  matchType: "EXACT_NAME" | "EXACT_ALIAS" | "DEMO_FUZZY" | "NONE";
};

export type EnrichedParserSegment = ParserSegment & {
  record_candidate: boolean;
  record_candidate_reason: string;
  demo_category: string;
  item_match: {
    candidates: ItemMatchingCandidate[];
    needs_review: boolean;
  };
};

export type AiParseSuccessResponse = {
  ok: true;
  mode: "REAL" | "MOCK";
  parse_id: string;
  schema_version: string;
  prompt_version: string;
  result_type: ParserResultType;
  overflow_detected: boolean;
  server_context: {
    timezone: "Asia/Seoul";
    current_local_date: string;
  };
  segments: EnrichedParserSegment[];
};

export type AiParseErrorCode =
  | "AI_CONFIG_MISSING"
  | "AI_PROVIDER_ERROR"
  | "AI_TIMEOUT"
  | "AI_INVALID_OUTPUT"
  | "INPUT_INVALID"
  | "RATE_LIMITED";

export type AiParseErrorResponse = {
  ok: false;
  mode: "ERROR" | "MANUAL";
  code: AiParseErrorCode;
  message: string;
};

export type AiParseApiResponse = AiParseSuccessResponse | AiParseErrorResponse;
