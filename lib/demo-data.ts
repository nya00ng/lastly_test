import type { LifecycleStatus } from "./types";
import type { Cycle } from "./cycle";

export type DemoCategory = "생활" | "교체" | "구독" | "건강" | "기타";

export type DemoItem = {
  id: string;
  name: string;
  category: DemoCategory;
  status: LifecycleStatus;
  tags: string[];
  note: string | null;
  recentLabel: string;
  recentMemoryOrder?: number;
  dDayLabel: string;
  dueLabel: string;
  cycle: Cycle;
  lastPerformedDateLabel: string;
  nextDueDate: string | null;
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
    tags: ["아이 이불", "아빠 이불"],
    note: null,
    recentLabel: "32일 전",
    dDayLabel: "D+2",
    dueLabel: "관리일 2일 지남",
    cycle: { unit: "day", interval: 30 },
    lastPerformedDateLabel: "2026.08.05",
    nextDueDate: "2026-09-04",
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
    tags: ["주방 정수기"],
    note: null,
    recentLabel: "98일 전",
    dDayLabel: "D+8",
    dueLabel: "관리일 8일 지남",
    cycle: { unit: "day", interval: 90 },
    lastPerformedDateLabel: "2026.05.29",
    nextDueDate: "2026-08-27",
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
    tags: ["아이 칫솔", "엄마 칫솔"],
    note: null,
    recentLabel: "3일 전",
    recentMemoryOrder: 3,
    dDayLabel: "D-3",
    dueLabel: "관리일까지 3일 남음",
    cycle: { unit: "day", interval: 30 },
    lastPerformedDateLabel: "2026.09.03",
    nextDueDate: "2026-10-03",
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
    tags: ["드럼 세탁기"],
    note: null,
    recentLabel: "25일 전",
    recentMemoryOrder: 25,
    dDayLabel: "D-5",
    dueLabel: "관리일까지 5일 남음",
    cycle: { unit: "day", interval: 30 },
    lastPerformedDateLabel: "2026.08.12",
    nextDueDate: "2026-09-11",
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
    tags: ["거실 에어컨"],
    note: null,
    recentLabel: "12일 전",
    recentMemoryOrder: 12,
    dDayLabel: "D-18",
    dueLabel: "관리일까지 18일 남음",
    cycle: { unit: "day", interval: 30 },
    lastPerformedDateLabel: "2026.08.24",
    nextDueDate: "2026-09-23",
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
    tags: ["원데이 렌즈"],
    note: null,
    recentLabel: "4일 전",
    dDayLabel: "D-10",
    dueLabel: "관리일까지 10일 남음",
    cycle: { unit: "day", interval: 14 },
    lastPerformedDateLabel: "2026.09.02",
    nextDueDate: "2026-09-16",
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
    tags: [],
    note: "겨울철 대비",
    recentLabel: "9월 1일",
    dDayLabel: "주기 없음",
    dueLabel: "관리주기가 없어요",
    cycle: null,
    lastPerformedDateLabel: "2026.09.01",
    nextDueDate: null,
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
    tags: ["냉장실", "냉동실"],
    note: null,
    recentLabel: "기록 없음",
    dDayLabel: "기록 없음",
    dueLabel: "첫 기록이 필요해요",
    cycle: { unit: "day", interval: 30 },
    lastPerformedDateLabel: "기록 없음",
    nextDueDate: null,
    nextDueDateLabel: "기록 후 계산",
    detail: "관리 대상은 있지만 수행기록은 아직 없어요.",
    history: [],
  },
  {
    id: "shoes",
    name: "신발 세탁",
    category: "생활",
    status: "NO_CYCLE",
    tags: ["아이 신발", "엄마 운동화", "나이키 운동화"],
    note: null,
    recentLabel: "8월 20일",
    dDayLabel: "주기 없음",
    dueLabel: "관리주기가 없어요",
    cycle: null,
    lastPerformedDateLabel: "2026.08.20",
    nextDueDate: null,
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
    tags: [],
    note: "정기 결제 서비스",
    recentLabel: "15일 전",
    dDayLabel: "D-18",
    dueLabel: "관리일까지 18일 남음",
    cycle: { unit: "day", interval: 60 },
    lastPerformedDateLabel: "2026.08.22",
    nextDueDate: "2026-10-21",
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
