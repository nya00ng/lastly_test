export type RouteKey = "home" | "record" | "items" | "settings";

export type ScreenId =
  | "S00"
  | "S01"
  | "S02"
  | "S10"
  | "S11"
  | "S12"
  | "S13"
  | "S14"
  | "S15"
  | "S16"
  | "S17"
  | "S20"
  | "S21"
  | "S22"
  | "S23"
  | "S24"
  | "S25"
  | "S30"
  | "S31"
  | "S32"
  | "S33"
  | "S40"
  | "S41"
  | "S50";

export type LifecycleStatus =
  | "NO_HISTORY"
  | "NO_CYCLE"
  | "NORMAL"
  | "UPCOMING"
  | "DUE"
  | "ARCHIVED";

export type ParserIntent =
  | "COMPLETED"
  | "PLANNED"
  | "NOT_COMPLETED"
  | "UNCERTAIN"
  | "QUERY"
  | "UNKNOWN";

export type ParserScope = "IN_SCOPE" | "OUT_OF_SCOPE" | "UNCERTAIN";

export type DatePrecision = "EXACT" | "APPROXIMATE" | "UNKNOWN" | "NOT_APPLICABLE";

export type DateResolutionSource = "EXPLICIT" | "IMPLICIT_TODAY" | "NONE";

export type ItemMatchType = "NEW" | "MATCHED" | "AMBIGUOUS";

export type RecordInputState =
  | "EMPTY"
  | "TYPING"
  | "READY"
  | "TOO_LONG"
  | "MULTIPLE_ACTION_EXAMPLE";

export type VoiceState =
  | "LISTENING"
  | "PERMISSION_DENIED"
  | "TRANSCRIBING"
  | "TRANSCRIPT_READY"
  | "STT_ERROR";

export type AiProcessingState =
  | "PROCESSING"
  | "TIMEOUT"
  | "PARSE_ERROR"
  | "RETRY"
  | "MANUAL_FALLBACK";

export type GuardVariant =
  | "TARGET"
  | "UNKNOWN"
  | "OUT_OF_SCOPE"
  | "PLANNED"
  | "NOT_COMPLETED"
  | "QUERY"
  | "DUPLICATE"
  | "TOO_MANY_ACTIONS"
  | "FUTURE_DATE"
  | "APPROXIMATE_DATE";

export type ClarificationType = "COMPLETION" | "ACTION" | "DATE" | "SCOPE";

export type ManagementFixture = {
  id: string;
  name: string;
  status: LifecycleStatus;
  lastPerformedLabel: string;
  nextDueLabel: string;
  cycleLabel: string;
  detail: string;
};

export type ActivityFixture = {
  id: string;
  itemName: string;
  performedDate: string;
  source: "AI 확인" | "직접 입력" | "알림";
  memo: string;
};

export type AiConfirmationFixture = {
  originalInput: string;
  parsedIntent: ParserIntent;
  parsedScope: ParserScope;
  normalizedAction: string;
  resolvedDate: string;
  datePrecision: DatePrecision;
  dateResolutionSource: DateResolutionSource;
  itemMatchingCandidate: string;
};

export type MultiActionSegmentFixture = {
  id: string;
  sourceText: string;
  action: string;
  date: string;
  item: string;
  inclusion: "Include" | "Exclude";
  recordability: "Recordable" | "Non-recordable" | "Invalid";
  note: string;
};
