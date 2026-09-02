import type {
  ActivityFixture,
  AiConfirmationFixture,
  ClarificationType,
  ManagementFixture,
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

export const aiConfirmationFixture: AiConfirmationFixture = {
  originalInput: "오늘 이불 빨았어",
  parsedIntent: "COMPLETED",
  parsedScope: "IN_SCOPE",
  normalizedAction: "이불 세탁",
  resolvedDate: "2026-09-02",
  datePrecision: "EXACT",
  dateResolutionSource: "IMPLICIT_TODAY",
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
