import type { LifecycleStatus } from "./types";

export type DemoCategory = "생활" | "교체" | "구독" | "건강" | "기타";

export type DemoItem = {
  id: string;
  name: string;
  category: DemoCategory;
  status: LifecycleStatus;
  lastLabel: string;
  dueLabel: string;
  cycleLabel: string;
  detail: string;
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
    lastLabel: "마지막 32일 전",
    dueLabel: "2일 지났어요",
    cycleLabel: "30일마다",
    detail: "오늘 확인하면 좋은 생활관리 항목이에요.",
  },
  {
    id: "water-filter",
    name: "정수기 필터",
    category: "교체",
    status: "DUE",
    lastLabel: "마지막 98일 전",
    dueLabel: "8일 지났어요",
    cycleLabel: "90일마다",
    detail: "교체 시점이 지나 알림 데모 대상입니다.",
  },
  {
    id: "toothbrush",
    name: "칫솔 교체",
    category: "교체",
    status: "UPCOMING",
    lastLabel: "마지막 27일 전",
    dueLabel: "3일 후 관리",
    cycleLabel: "30일마다",
    detail: "곧 바꿀 때가 다가와요.",
  },
  {
    id: "washer",
    name: "세탁조 청소",
    category: "생활",
    status: "UPCOMING",
    lastLabel: "마지막 25일 전",
    dueLabel: "5일 후 관리",
    cycleLabel: "30일마다",
    detail: "여유가 조금 남아 있어요.",
  },
  {
    id: "aircon",
    name: "에어컨 청소",
    category: "생활",
    status: "NORMAL",
    lastLabel: "마지막 12일 전",
    dueLabel: "18일 남았어요",
    cycleLabel: "30일마다",
    detail: "아직은 편하게 지켜봐도 돼요.",
  },
  {
    id: "lens",
    name: "렌즈 교체",
    category: "건강",
    status: "NORMAL",
    lastLabel: "마지막 4일 전",
    dueLabel: "10일 남았어요",
    cycleLabel: "14일마다",
    detail: "다음 교체일까지 여유가 있어요.",
  },
  {
    id: "netflix",
    name: "넷플릭스 결제 확인",
    category: "구독",
    status: "NO_CYCLE",
    lastLabel: "마지막 9월 1일",
    dueLabel: "관리주기가 없어요",
    cycleLabel: "주기 없음",
    detail: "전체관리에서 주기를 정할 수 있어요.",
  },
  {
    id: "vitamin",
    name: "영양제 보충",
    category: "건강",
    status: "NO_HISTORY",
    lastLabel: "아직 기록이 없어요",
    dueLabel: "첫 기록이 필요해요",
    cycleLabel: "30일마다",
    detail: "관리 대상은 있지만 수행기록은 아직 없어요.",
  },
  {
    id: "cloud",
    name: "클라우드 서비스 정리",
    category: "구독",
    status: "NO_CYCLE",
    lastLabel: "마지막 8월 20일",
    dueLabel: "관리주기가 없어요",
    cycleLabel: "주기 없음",
    detail: "원하면 반복 확인 주기를 둘 수 있어요.",
  },
  {
    id: "etc",
    name: "현관 센서 배터리",
    category: "기타",
    status: "NORMAL",
    lastLabel: "마지막 15일 전",
    dueLabel: "45일 남았어요",
    cycleLabel: "60일마다",
    detail: "가끔 확인하면 좋은 항목이에요.",
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
  NO_HISTORY: "bg-[var(--sun)] text-[#6b5523]",
  NO_CYCLE: "bg-[#edf0ea] text-[#5b655f]",
  NORMAL: "bg-[var(--mint)] text-[var(--primary-strong)]",
  UPCOMING: "bg-[var(--lime)] text-[#596616]",
  DUE: "bg-[#ffe2dc] text-[#9f3e30]",
};
