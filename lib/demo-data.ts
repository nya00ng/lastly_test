import type { LifecycleStatus } from "./types";

export type DemoCategory = "생활" | "교체" | "구독" | "건강" | "기타";

export type DemoItem = {
  id: string;
  name: string;
  category: DemoCategory;
  status: LifecycleStatus;
  memo: string;
  recentLabel: string;
  recentMemoryOrder?: number;
  dDayLabel: string;
  dueLabel: string;
  cycleLabel: string;
  cycleDays: number | null;
  lastPerformedDateLabel: string;
  nextDueDateLabel: string;
  detail: string;
  history: DemoHistoryEntry[];
};

export type DemoHistoryEntry = {
  id: string;
  dateLabel: string;
  actionLabel: string;
};

export const demoCategories: Array<"전체" | DemoCategory> = [
  "전체",
  "생활",
  "교체",
  "구독",
  "건강",
  "기타",
];

export const demoItems: DemoItem[] = [
  {
    id: "bedding",
    name: "이불 세탁",
    category: "생활",
    status: "DUE",
    memo: "아이 이불 · 아빠 이불",
    recentLabel: "32일 전",
    dDayLabel: "D+2",
    dueLabel: "관리일 2일 지남",
    cycleLabel: "30일마다",
    cycleDays: 30,
    lastPerformedDateLabel: "2026.08.05",
    nextDueDateLabel: "2026.09.04",
    detail: "오늘 확인하면 좋은 생활관리 항목이에요.",
    history: [
      { id: "bedding-20260805", dateLabel: "2026.08.05", actionLabel: "이불 세탁" },
      { id: "bedding-20260706", dateLabel: "2026.07.06", actionLabel: "이불 세탁" },
      { id: "bedding-20260606", dateLabel: "2026.06.06", actionLabel: "이불 세탁" },
    ],
  },
  {
    id: "water-filter",
    name: "정수기 필터",
    category: "교체",
    status: "DUE",
    memo: "주방 정수기",
    recentLabel: "98일 전",
    dDayLabel: "D+8",
    dueLabel: "관리일 8일 지남",
    cycleLabel: "90일마다",
    cycleDays: 90,
    lastPerformedDateLabel: "2026.05.29",
    nextDueDateLabel: "2026.08.27",
    detail: "교체 시점이 지나 알림 확인 대상입니다.",
    history: [
      { id: "water-filter-20260529", dateLabel: "2026.05.29", actionLabel: "정수기 필터 교체" },
      { id: "water-filter-20260228", dateLabel: "2026.02.28", actionLabel: "정수기 필터 교체" },
    ],
  },
  {
    id: "toothbrush",
    name: "칫솔 교체",
    category: "교체",
    status: "UPCOMING",
    memo: "아이 칫솔 · 엄마 칫솔",
    recentLabel: "3일 전",
    recentMemoryOrder: 3,
    dDayLabel: "D-3",
    dueLabel: "관리일까지 3일 남음",
    cycleLabel: "30일마다",
    cycleDays: 30,
    lastPerformedDateLabel: "2026.09.03",
    nextDueDateLabel: "2026.10.03",
    detail: "곧 바꿀 때가 다가와요.",
    history: [
      { id: "toothbrush-20260903", dateLabel: "2026.09.03", actionLabel: "칫솔 교체" },
      { id: "toothbrush-20260804", dateLabel: "2026.08.04", actionLabel: "칫솔 교체" },
    ],
  },
  {
    id: "washer",
    name: "세탁조 청소",
    category: "생활",
    status: "UPCOMING",
    memo: "드럼 세탁기",
    recentLabel: "25일 전",
    recentMemoryOrder: 25,
    dDayLabel: "D-5",
    dueLabel: "관리일까지 5일 남음",
    cycleLabel: "30일마다",
    cycleDays: 30,
    lastPerformedDateLabel: "2026.08.12",
    nextDueDateLabel: "2026.09.11",
    detail: "여유가 조금 남아 있어요.",
    history: [
      { id: "washer-20260812", dateLabel: "2026.08.12", actionLabel: "세탁조 청소" },
      { id: "washer-20260713", dateLabel: "2026.07.13", actionLabel: "세탁조 청소" },
    ],
  },
  {
    id: "aircon",
    name: "에어컨 청소",
    category: "생활",
    status: "NORMAL",
    memo: "거실 에어컨",
    recentLabel: "12일 전",
    recentMemoryOrder: 12,
    dDayLabel: "D-18",
    dueLabel: "관리일까지 18일 남음",
    cycleLabel: "30일마다",
    cycleDays: 30,
    lastPerformedDateLabel: "2026.08.24",
    nextDueDateLabel: "2026.09.23",
    detail: "아직은 편하게 지켜봐도 돼요.",
    history: [
      { id: "aircon-20260824", dateLabel: "2026.08.24", actionLabel: "에어컨 청소" },
      { id: "aircon-20260725", dateLabel: "2026.07.25", actionLabel: "에어컨 청소" },
    ],
  },
  {
    id: "lens",
    name: "렌즈 교체",
    category: "건강",
    status: "NORMAL",
    memo: "원데이 렌즈",
    recentLabel: "4일 전",
    dDayLabel: "D-10",
    dueLabel: "관리일까지 10일 남음",
    cycleLabel: "14일마다",
    cycleDays: 14,
    lastPerformedDateLabel: "2026.09.02",
    nextDueDateLabel: "2026.09.16",
    detail: "다음 교체일까지 여유가 있어요.",
    history: [
      { id: "lens-20260902", dateLabel: "2026.09.02", actionLabel: "렌즈 교체" },
      { id: "lens-20260819", dateLabel: "2026.08.19", actionLabel: "렌즈 교체" },
    ],
  },
  {
    id: "boiler",
    name: "보일러 점검",
    category: "기타",
    status: "NO_CYCLE",
    memo: "겨울철 대비",
    recentLabel: "9월 1일",
    dDayLabel: "주기 없음",
    dueLabel: "관리주기가 없어요",
    cycleLabel: "주기 없음",
    cycleDays: null,
    lastPerformedDateLabel: "2026.09.01",
    nextDueDateLabel: "주기 없음",
    detail: "전체관리에서 주기를 정할 수 있어요.",
    history: [
      { id: "boiler-20260901", dateLabel: "2026.09.01", actionLabel: "보일러 점검" },
    ],
  },
  {
    id: "fridge",
    name: "냉장고 정리",
    category: "생활",
    status: "NO_HISTORY",
    memo: "냉장실 · 냉동실",
    recentLabel: "기록 없음",
    dDayLabel: "기록 없음",
    dueLabel: "첫 기록이 필요해요",
    cycleLabel: "30일마다",
    cycleDays: 30,
    lastPerformedDateLabel: "기록 없음",
    nextDueDateLabel: "기록 후 계산",
    detail: "관리 대상은 있지만 수행기록은 아직 없어요.",
    history: [],
  },
  {
    id: "shoes",
    name: "신발 세탁",
    category: "생활",
    status: "NO_CYCLE",
    memo: "아이 신발 · 엄마 운동화 · 나이키 운동화",
    recentLabel: "8월 20일",
    dDayLabel: "주기 없음",
    dueLabel: "관리주기가 없어요",
    cycleLabel: "주기 없음",
    cycleDays: null,
    lastPerformedDateLabel: "2026.08.20",
    nextDueDateLabel: "주기 없음",
    detail: "원하면 반복 확인 주기를 둘 수 있어요.",
    history: [
      { id: "shoes-20260820", dateLabel: "2026.08.20", actionLabel: "신발 세탁" },
    ],
  },
  {
    id: "subscription",
    name: "구독 결제 확인",
    category: "구독",
    status: "NORMAL",
    memo: "정기 결제 서비스",
    recentLabel: "15일 전",
    dDayLabel: "D-18",
    dueLabel: "관리일까지 18일 남음",
    cycleLabel: "60일마다",
    cycleDays: 60,
    lastPerformedDateLabel: "2026.08.22",
    nextDueDateLabel: "2026.10.21",
    detail: "가끔 확인하면 좋은 항목이에요.",
    history: [
      { id: "subscription-20260822", dateLabel: "2026.08.22", actionLabel: "구독 결제 확인" },
      { id: "subscription-20260623", dateLabel: "2026.06.23", actionLabel: "구독 결제 확인" },
    ],
  },
];

export const dashboardDemoItems = demoItems.filter((item) =>
  ["DUE", "UPCOMING", "NORMAL"].includes(item.status),
);

export const statusCopy: Record<LifecycleStatus, string> = {
  ARCHIVED: "보관됨",
  NO_HISTORY: "아직 기록이 없어요",
  NO_CYCLE: "관리주기가 없어요",
  NORMAL: "아직 괜찮아요",
  UPCOMING: "곧 관리해요",
  DUE: "관리 필요",
};

export const statusTone: Record<LifecycleStatus, string> = {
  ARCHIVED: "bg-stone-100 text-stone-600",
  NO_HISTORY: "bg-[#f4f7f5] text-[var(--muted)]",
  NO_CYCLE: "bg-[#f4f7f5] text-[var(--muted)]",
  NORMAL: "bg-[var(--status-normal-bg)] text-[#31795f]",
  UPCOMING: "bg-[var(--status-upcoming-bg)] text-[#8a6619]",
  DUE: "bg-[var(--status-due-bg)] text-[#a95550]",
};

export function getDemoItemById(itemId: string) {
  return demoItems.find((item) => item.id === itemId);
}
