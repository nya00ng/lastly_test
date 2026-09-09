import { readFile } from "node:fs/promises";
import ts from "typescript";

function transpile(source) {
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}

function dataModule(source) {
  return `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
}

const cycleSource = await readFile(new URL("../lib/cycle.ts", import.meta.url), "utf8");
const cycleUrl = dataModule(transpile(cycleSource));
const monthSource = await readFile(new URL("../lib/month-view.ts", import.meta.url), "utf8");
const monthModule = transpile(monthSource).replace('from "./cycle"', `from "${cycleUrl}"`);
const {
  buildMonthEvents,
  getMonthGrid,
  groupEventsByDate,
  isDateInMonth,
  moveMonth,
} = await import(dataModule(monthModule));

function equal(actual, expected, name) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${name}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

equal(getMonthGrid("2026-09").length, 42, "fixed grid");
equal(moveMonth("2026-12", 1), "2027-01", "next year boundary");
equal(moveMonth("2027-01", -1), "2026-12", "previous year boundary");
equal(getMonthGrid("2028-02").filter((cell) => cell.inCurrentMonth).at(-1)?.day, 29, "leap year grid");
equal(isDateInMonth("2026.09.01", "2026-09"), true, "dot date normalization");
equal(isDateInMonth("2026-09-01", "2026-09"), true, "ISO date normalization");

const baseItem = {
  category: "생활",
  cycle: { unit: "day", interval: 14 },
  dDayLabel: "D-3",
  detail: "",
  dueLabel: "",
  history: [{ id: "a1", dateLabel: "2026.09.15", actionLabel: "테스트" }],
  id: "active",
  lastPerformedDateLabel: "2026.09.15",
  name: "테스트",
  nextDueDate: "2026-09-15",
  nextDueDateLabel: "2026-09-15",
  note: null,
  recentLabel: "",
  status: "UPCOMING",
  tags: [],
};
const noCycle = { ...baseItem, cycle: null, id: "no-cycle", nextDueDate: null, status: "NO_CYCLE" };
const noHistory = { ...baseItem, history: [], id: "no-history", nextDueDate: null, status: "NO_HISTORY" };
const archived = { ...baseItem, id: "archived", status: "ARCHIVED" };
const events = buildMonthEvents([baseItem, noCycle, noHistory, archived], "2026-09");
equal(events.filter((event) => event.itemId === "active").map((event) => event.type), ["ACTIVITY", "DUE"], "activity and due are not deduped");
equal(events.filter((event) => event.itemId === "no-cycle").map((event) => event.type), ["ACTIVITY"], "no cycle activity only");
equal(events.some((event) => event.itemId === "no-history"), false, "no history has no event");
equal(events.some((event) => event.itemId === "archived"), false, "archived exclusion");
equal(buildMonthEvents([baseItem], "2026-10").length, 0, "month event filtering");
equal(groupEventsByDate(events).get("2026-09-15")?.length, 3, "event grouping");

console.log("month view contract smoke: PASS");
