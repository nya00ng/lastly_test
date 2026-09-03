import type {
  ActivityFixture,
  AiProcessingState,
  AiConfirmationFixture,
  ClarificationType,
  GuardVariant,
  ItemMatchType,
  ManagementFixture,
  MultiActionSegmentFixture,
  RecordInputState,
  VoiceState,
} from "./types";

export const managementFixtures: ManagementFixture[] = [
  {
    id: "fixture-bedding",
    name: "이불 세탁",
    status: "DUE",
    lastPerformedLabel: "8월 1일",
    nextDueLabel: "관리 필요",
    cycleLabel: "30일 주기",
    detail: "마지막 수행일 기준으로 다시 관리가 필요한 상태입니다.",
  },
  {
    id: "fixture-toothbrush",
    name: "칫솔 교체",
    status: "UPCOMING",
    lastPerformedLabel: "8월 18일",
    nextDueLabel: "곧 관리",
    cycleLabel: "21일 주기",
    detail: "관리 예정일이 가까워져 대시보드에 표시됩니다.",
  },
  {
    id: "fixture-filter",
    name: "에어컨 필터 청소",
    status: "NORMAL",
    lastPerformedLabel: "8월 24일",
    nextDueLabel: "아직 괜찮아요",
    cycleLabel: "45일 주기",
    detail: "최근 기록과 주기가 있어 정상 상태로 계산된 fixture입니다.",
  },
  {
    id: "fixture-medical-check",
    name: "건강검진 결과 정리",
    status: "NO_CYCLE",
    lastPerformedLabel: "8월 9일",
    nextDueLabel: "주기 없음",
    cycleLabel: "주기 미설정",
    detail: "수행 기록은 있지만 사용자가 반복 주기를 정하지 않았습니다.",
  },
  {
    id: "fixture-plant",
    name: "화분 분갈이",
    status: "NO_HISTORY",
    lastPerformedLabel: "기록 없음",
    nextDueLabel: "수행기록 없음",
    cycleLabel: "90일 주기",
    detail: "관리 대상은 있으나 아직 수행 기록이 없는 상태입니다.",
  },
  {
    id: "fixture-long-name",
    name: "거실 창가에 있는 큰 공기청정기 프리필터와 내부 먼지망 청소",
    status: "NO_HISTORY",
    lastPerformedLabel: "기록 없음",
    nextDueLabel: "수행기록 없음",
    cycleLabel: "60일 주기",
    detail: "긴 Item Name 줄바꿈과 NO_HISTORY 표시 확인용 fixture입니다.",
  },
  {
    id: "fixture-old-device",
    name: "예전 공유기 점검",
    status: "ARCHIVED",
    lastPerformedLabel: "5월 10일",
    nextDueLabel: "보관됨",
    cycleLabel: "보관 항목",
    detail: "보관 상태 lifecycle 확인용 fixture입니다.",
  },
];

export const statusLabels = {
  NO_HISTORY: "수행기록 없음",
  NO_CYCLE: "주기 없음",
  NORMAL: "아직 괜찮아요",
  UPCOMING: "곧 관리해요",
  DUE: "관리 필요",
  ARCHIVED: "보관됨",
} as const;

export const dashboardFixtures = managementFixtures.filter((item) =>
  ["DUE", "UPCOMING", "NORMAL"].includes(item.status),
);

export const activeManagementFixtures = managementFixtures.filter(
  (item) => item.status !== "ARCHIVED",
);

export const archivedManagementFixtures = managementFixtures.filter(
  (item) => item.status === "ARCHIVED",
);

export const activityFixtures: ActivityFixture[] = [
  {
    id: "activity-1",
    itemName: "이불 세탁",
    performedDate: "2026-08-01",
    source: "AI 확인",
    memo: "사용자가 확인 후 저장한 완료 기록 fixture입니다.",
  },
  {
    id: "activity-2",
    itemName: "이불 세탁",
    performedDate: "2026-07-02",
    source: "직접 입력",
    memo: "Manual fallback 흐름을 보여주는 이전 기록입니다.",
  },
  {
    id: "activity-3",
    itemName: "칫솔 교체",
    performedDate: "2026-08-18",
    source: "알림",
    memo: "알림에서 오늘 했어요를 선택한 fixture 기록입니다.",
  },
];

export const implicitTodayConfirmationFixture: AiConfirmationFixture = {
  originalInput: "칫솔 바꿨어",
  parsedIntent: "COMPLETED",
  parsedScope: "IN_SCOPE",
  normalizedAction: "칫솔 교체",
  resolvedDate: "2026-09-02",
  datePrecision: "EXACT",
  dateResolutionSource: "IMPLICIT_TODAY",
  itemMatchingCandidate: "칫솔 교체",
};

export const aiConfirmationFixture: AiConfirmationFixture = {
  originalInput: "오늘 이불 빨았어",
  parsedIntent: "COMPLETED",
  parsedScope: "IN_SCOPE",
  normalizedAction: "이불 세탁",
  resolvedDate: "2026-09-02",
  datePrecision: "EXACT",
  dateResolutionSource: "EXPLICIT",
  itemMatchingCandidate: "이불 세탁",
};

export const clarificationFixtures: Array<{
  type: ClarificationType;
  title: string;
  prompt: string;
  sampleAnswer: string;
}> = [
  {
    type: "COMPLETION",
    title: "완료 여부 확인",
    prompt: "이미 한 일인가요, 앞으로 할 일인가요?",
    sampleAnswer: "이미 했어요",
  },
  {
    type: "ACTION",
    title: "행동 확인",
    prompt: "무엇을 했는지 조금 더 정확히 알려주세요.",
    sampleAnswer: "이불 세탁",
  },
  {
    type: "DATE",
    title: "날짜 확인",
    prompt: "언제 완료했는지 정확한 날짜가 필요해요.",
    sampleAnswer: "2026-09-02",
  },
  {
    type: "SCOPE",
    title: "관리 대상 여부 확인",
    prompt: "이 기록이 생활주기 관리 대상인가요?",
    sampleAnswer: "반복해서 관리할 일이에요",
  },
];

export const itemMatchingCandidates = [
  "이불 세탁",
  "침구 정리",
  "세탁기 청소",
] as const;

export const recordInputStateFixtures: Array<{
  id: RecordInputState;
  label: string;
  title: string;
  description: string;
  details: string[];
}> = [
  {
    id: "EMPTY",
    label: "EMPTY",
    title: "빈 입력",
    description: "빈 입력은 AI로 전달하지 않고 CTA를 비활성화합니다.",
    details: ["Form Label: 오늘 한 일을 알려주세요.", "AI 입력 최대 길이: 500 chars"],
  },
  {
    id: "TYPING",
    label: "TYPING",
    title: "입력 중",
    description: "사용자가 작성 중인 원문을 보존하는 상태입니다.",
    details: ["예: 오늘 이불 빨았어", "뒤로가기/오류 후 가능한 한 입력을 유지"],
  },
  {
    id: "READY",
    label: "READY",
    title: "분석 가능",
    description: "입력이 있고 500자를 넘지 않아 AI 이해하기 fixture로 이동할 수 있습니다.",
    details: ["Primary CTA: AI로 이해하기", "자동 저장 없음"],
  },
  {
    id: "TOO_LONG",
    label: "TOO_LONG",
    title: "길이 초과",
    description: "500 chars를 넘으면 분석 CTA를 막고 입력을 줄이도록 안내합니다.",
    details: ["현재 예시: 526 / 500", "실제 AI 호출 없음"],
  },
  {
    id: "MULTIPLE_ACTION_EXAMPLE",
    label: "2~5 Actions",
    title: "복수 행동 예시",
    description: "2~5개 의미 행동은 Segment로 나누어 확인합니다.",
    details: ["이불 세탁 — 기록함", "세탁조 청소 예정 — 기록 안 함", "전체 저장 전 모든 Segment 검증"],
  },
];

export const voiceStateFixtures: Array<{
  id: VoiceState;
  label: string;
  title: string;
  description: string;
  details: string[];
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}> = [
  {
    id: "LISTENING",
    label: "LISTENING",
    title: "말하는 중",
    description: "녹음 중 fixture입니다. 실제 microphone runtime은 없습니다.",
    details: ["경과시간: 00:08", "Stop 또는 Cancel 선택 가능"],
    primaryHref: "/screens/S13",
    primaryLabel: "Stop",
  },
  {
    id: "PERMISSION_DENIED",
    label: "DENIED",
    title: "마이크를 사용할 수 없어요.",
    description: "권한 거부 상태에서도 Text 입력으로 전환할 수 있어야 합니다.",
    details: ["직접 입력하기", "브라우저 설정 안내"],
    primaryHref: "/screens/S11",
    primaryLabel: "직접 입력하기",
  },
  {
    id: "TRANSCRIBING",
    label: "TRANSCRIBING",
    title: "텍스트로 바꾸는 중",
    description: "STT 처리 중 fixture입니다. 무한 대기만 남기지 않습니다.",
    details: ["원문 음성 보존 가능성 안내", "실패 시 Text fallback"],
    primaryHref: "/screens/S13",
    primaryLabel: "결과 보기",
  },
  {
    id: "TRANSCRIPT_READY",
    label: "READY",
    title: "Transcript 준비",
    description: "사용자가 AI 분석 전에 내용을 확인하고 수정할 수 있습니다.",
    details: ["이렇게 들었어요.", "오늘 이불 빨았어"],
    primaryHref: "/screens/S14",
    primaryLabel: "분석하기",
  },
  {
    id: "STT_ERROR",
    label: "ERROR",
    title: "음성을 텍스트로 바꾸지 못했어요.",
    description: "STT 실패는 Core Loop 실패가 아니며 직접 입력으로 복구합니다.",
    details: ["다시 말하기", "직접 입력하기"],
    primaryHref: "/screens/S11",
    primaryLabel: "직접 입력하기",
    secondaryHref: "/screens/S12",
    secondaryLabel: "다시 말하기",
  },
];

export const aiProcessingStateFixtures: Array<{
  id: AiProcessingState;
  label: string;
  title: string;
  description: string;
  details: string[];
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}> = [
  {
    id: "PROCESSING",
    label: "PROCESSING",
    title: "내용을 이해하고 있어요.",
    description: "Intent, Scope, Action, Date를 fixture로 분석 중입니다.",
    details: ["기존 Item 탐색은 Parser 뒤 Item Matching에서 수행", "실제 AI Provider 호출 없음"],
    primaryHref: "/screens/S15",
    primaryLabel: "결과 보기",
  },
  {
    id: "TIMEOUT",
    label: "TIMEOUT",
    title: "응답이 오래 걸리고 있어요.",
    description: "무한 Spinner 대신 Retry와 Manual fallback을 제공합니다.",
    details: ["원문 유지", "재시도 가능"],
    primaryHref: "/screens/S14",
    primaryLabel: "다시 시도",
    secondaryHref: "/screens/S16",
    secondaryLabel: "직접 기록하기",
  },
  {
    id: "PARSE_ERROR",
    label: "PARSE_ERROR",
    title: "내용을 이해하지 못했어요.",
    description: "Invalid JSON 또는 Semantic Validation 실패 fixture입니다.",
    details: ["AI 실패 때문에 임의 COMPLETED 생성 금지", "Manual Record Flow로 복구"],
    primaryHref: "/screens/S16",
    primaryLabel: "직접 기록하기",
  },
  {
    id: "RETRY",
    label: "RETRY",
    title: "한 번 더 시도",
    description: "재시도해도 자동 저장으로 넘어가지 않습니다.",
    details: ["Double submit은 추가 Activity를 만들지 않음", "성공 전 S17 표시 금지"],
    primaryHref: "/screens/S15",
    primaryLabel: "Retry 결과 보기",
  },
  {
    id: "MANUAL_FALLBACK",
    label: "MANUAL",
    title: "직접 기록하기",
    description: "AI 결과를 사용할 수 없거나 거절했을 때 별도 Manual Flow로 전환합니다.",
    details: ["Action", "Performed Date", "생활관리 기록 확인"],
    primaryHref: "/screens/S16",
    primaryLabel: "Manual Flow 보기",
  },
];

export const guardVariantFixtures: Array<{
  id: GuardVariant;
  label: string;
  title: string;
  description: string;
  details: string[];
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}> = [
  {
    id: "TARGET",
    label: "TARGET",
    title: "어떤 항목을 말한 건가요?",
    description: "TARGET은 Parser Clarification enum이 아니라 Item Matching UI 상태입니다.",
    details: ["Candidate 선택", "신규 Item 선택", "Archived Item 자동 Match 제외"],
    primaryHref: "/screens/S15",
    primaryLabel: "선택 후 확인",
  },
  {
    id: "UNKNOWN",
    label: "UNKNOWN",
    title: "정확히 이해하지 못했어요.",
    description: "UNKNOWN을 조용히 COMPLETED로 바꾸지 않습니다.",
    details: ["직접 기록하기", "다시 입력하기", "취소"],
    primaryHref: "/screens/S11",
    primaryLabel: "다시 입력하기",
    secondaryHref: "/screens/S16",
    secondaryLabel: "직접 기록하기",
  },
  {
    id: "OUT_OF_SCOPE",
    label: "OUT",
    title: "반복 생활관리 기록으로 저장하지 않았어요.",
    description: "일반 Memo 저장 기능으로 전환하지 않습니다.",
    details: ["Activity Save CTA 없음", "다른 기록 입력만 제공"],
    primaryHref: "/screens/S11",
    primaryLabel: "다른 기록 입력",
  },
  {
    id: "PLANNED",
    label: "PLANNED",
    title: "앞으로 할 일로 이해했어요.",
    description: "LASTLY는 실제로 한 일을 기록해요.",
    details: ["To-do 생성 CTA 없음", "수행기록 저장 CTA 없음"],
    primaryHref: "/screens/S11",
    primaryLabel: "기록 화면으로",
  },
  {
    id: "NOT_COMPLETED",
    label: "NOT_DONE",
    title: "아직 완료하지 않은 것으로 이해했어요.",
    description: "수행기록으로 저장하지 않았어요.",
    details: ["False Completion 방지", "Activity 0"],
    primaryHref: "/screens/S11",
    primaryLabel: "다시 입력",
  },
  {
    id: "QUERY",
    label: "QUERY",
    title: "기억 조회 질문으로 이해했어요.",
    description: "실제 자연어 조회 기능은 NEXT이므로 구현하지 않습니다.",
    details: ["Activity Save CTA 없음", "일반 Memo 저장 없음"],
    primaryHref: "/screens/S10",
    primaryLabel: "홈으로",
  },
  {
    id: "DUPLICATE",
    label: "DUP",
    title: "오늘 이미 같은 기록이 있어요.",
    description: "추가로 기록할까요?",
    details: ["기존 기록 보기", "그래도 추가", "취소"],
    primaryHref: "/screens/S22",
    primaryLabel: "기존 기록 보기",
    secondaryHref: "/screens/S15",
    secondaryLabel: "그래도 추가",
  },
  {
    id: "TOO_MANY_ACTIONS",
    label: ">5",
    title: "한 번에 최대 5개까지 기록할 수 있어요.",
    description: "6개 이상은 일부만 저장하지 않고 입력을 나누도록 안내합니다.",
    details: ["TOO_MANY_ACTIONS", "Partial save 금지", "전체 저장 보류"],
    primaryHref: "/screens/S11",
    primaryLabel: "입력 나누기",
  },
  {
    id: "FUTURE_DATE",
    label: "FUTURE",
    title: "미래 날짜는 완료기록으로 저장할 수 없어요.",
    description: "User Today 이하의 정확한 날짜 선택이 필요합니다.",
    details: ["AI가 Exact Date를 임의 생성하지 않음", "Date 수정 전 Save 불가"],
    primaryHref: "/screens/S16",
    primaryLabel: "날짜 다시 선택",
  },
  {
    id: "APPROXIMATE_DATE",
    label: "APPROX",
    title: "정확한 날짜를 알려주세요.",
    description: "지난주쯤, 며칠 전 같은 표현은 임의 EXACT로 바꾸지 않습니다.",
    details: ["Exact Date 선택 요구", "선택 전 Activity 0"],
    primaryHref: "/screens/S16",
    primaryLabel: "날짜 선택",
  },
];

export const itemMatchStateFixtures: Array<{
  id: ItemMatchType;
  label: string;
  title: string;
  description: string;
  details: string[];
}> = [
  {
    id: "NEW",
    label: "NEW",
    title: "새 관리항목으로 만들어요",
    description: "기존 Active Item 후보가 없을 때 신규 Item 후보로 보여줍니다.",
    details: ["신규 Item + Activity를 함께 생성하는 흐름", "Empty Item Setup 아님"],
  },
  {
    id: "MATCHED",
    label: "MATCHED",
    title: "기존 관리항목에 기록해요",
    description: "충분히 명확한 후보 1개를 제안하되 사용자가 바꿀 수 있습니다.",
    details: ["이불 세탁", "사용자 확인 전 저장 없음"],
  },
  {
    id: "AMBIGUOUS",
    label: "AMBIGUOUS",
    title: "혹시 이 항목인가요?",
    description: "유사 후보는 자동 확정하지 않고 사용자가 선택합니다.",
    details: ["거실 에어컨 필터", "안방 에어컨 필터", "공기청정기 필터"],
  },
];

export const multiActionSegments: MultiActionSegmentFixture[] = [
  {
    id: "multi-1",
    sourceText: "이불 세탁했어",
    action: "이불 세탁",
    date: "2026-09-02",
    item: "이불 세탁",
    inclusion: "Include",
    recordability: "Recordable",
    note: "COMPLETED / IN_SCOPE / EXACT",
  },
  {
    id: "multi-2",
    sourceText: "세탁조 청소 예정",
    action: "세탁조 청소",
    date: "NOT_APPLICABLE",
    item: "새 관리항목 아님",
    inclusion: "Exclude",
    recordability: "Non-recordable",
    note: "PLANNED는 기록 안 함",
  },
  {
    id: "multi-3",
    sourceText: "지난주쯤 필터 청소했어",
    action: "필터 청소",
    date: "정확한 날짜 필요",
    item: "필터 후보 선택 필요",
    inclusion: "Include",
    recordability: "Invalid",
    note: "문제 Segment 때문에 전체 저장 보류",
  },
];

export const errorStateFixtures = [
  "Auth Error",
  "STT Error",
  "AI Error",
  "Network Error",
  "Save Error",
  "Session Expired",
  "Permission Error",
] as const;
