import type { RouteKey, ScreenId } from "@/lib/types";

export type ScreenGroup =
  | "Entry"
  | "Dashboard"
  | "Record"
  | "Management"
  | "Notification"
  | "Settings"
  | "Error";

export const screenDefinitions: Array<{
  id: ScreenId;
  title: string;
  group: ScreenGroup;
}> = [
  { id: "S00", title: "Splash / App Entry", group: "Entry" },
  { id: "S01", title: "Login / Sign Up", group: "Entry" },
  { id: "S02", title: "Onboarding / Empty", group: "Entry" },
  { id: "S10", title: "Dashboard", group: "Dashboard" },
  { id: "S11", title: "Record Input", group: "Record" },
  { id: "S12", title: "Voice Listening", group: "Record" },
  { id: "S13", title: "STT Result", group: "Record" },
  { id: "S14", title: "AI Processing", group: "Record" },
  { id: "S15", title: "AI Confirmation", group: "Record" },
  { id: "S16", title: "Clarification", group: "Record" },
  { id: "S17", title: "Record Saved", group: "Record" },
  { id: "S20", title: "All Management Items", group: "Management" },
  { id: "S21", title: "Management Item Detail", group: "Management" },
  { id: "S22", title: "Activity History", group: "Management" },
  { id: "S23", title: "Record Edit", group: "Management" },
  { id: "S24", title: "Item Edit", group: "Management" },
  { id: "S25", title: "Cycle Setting", group: "Management" },
  { id: "S30", title: "Notification Landing", group: "Notification" },
  { id: "S31", title: "Complete Today", group: "Notification" },
  { id: "S32", title: "Complete Other Date", group: "Notification" },
  { id: "S33", title: "Snooze", group: "Notification" },
  { id: "S40", title: "Settings", group: "Settings" },
  {
    id: "S41",
    title: "Notification Permission / Device Setting",
    group: "Settings",
  },
  { id: "S50", title: "Generic Error / Recovery", group: "Error" },
];

export const screenIds = screenDefinitions.map((screen) => screen.id);

export function isScreenId(value: string): value is ScreenId {
  return screenIds.includes(value as ScreenId);
}

export function routeForScreen(screenId: ScreenId): RouteKey {
  if (screenId.startsWith("S2")) return "items";
  if (screenId.startsWith("S4")) return "settings";
  if (screenId.startsWith("S1") && screenId !== "S10") return "record";
  return "home";
}
