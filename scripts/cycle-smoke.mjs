import {
  addCalendarMonths,
  calculateLifecycle,
  calculateMonthlyPreviews,
  calculateNextDue,
  formatCycle,
  validateCycle,
} from "../lib/cycle.ts";

function equal(actual, expected, name) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${name}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

equal(calculateNextDue("2026-09-01", { unit: "day", interval: 14 }), "2026-09-15", "day");
const overdue = calculateLifecycle({ cycle: { unit: "day", interval: 14 }, historyCount: 1, lastPerformedDate: "2026-09-01", today: "2026-09-20" });
equal([overdue.dDayLabel, overdue.status], ["D+5", "DUE"], "overdue");
equal(calculateNextDue("2026-09-01", { unit: "week", interval: 2 }), "2026-09-15", "week");
equal(calculateNextDue("2026-09-01", { unit: "week", interval: 1, weekdays: [6] }), "2026-09-05", "weekly Saturday");
equal(calculateNextDue("2026-09-07", { unit: "week", interval: 1, weekdays: [1, 4] }), "2026-09-10", "weekly multiple Monday");
equal(calculateNextDue("2026-09-10", { unit: "week", interval: 1, weekdays: [1, 4] }), "2026-09-14", "weekly multiple Thursday");
equal(validateCycle({ unit: "week", interval: 2, weekdays: [1, 4] }).valid, false, "invalid weekly combination");
equal(calculateNextDue("2026-09-10", { unit: "month", interval: 1 }), "2026-10-10", "month");
equal(addCalendarMonths("2026-01-31", 1), "2026-02-28", "month end");
equal(addCalendarMonths("2028-01-31", 1), "2028-02-29", "leap year");
equal(calculateMonthlyPreviews("2026-01-31", 1, 2), ["2026-02-28", "2026-03-31"], "month drift");
equal(calculateNextDue("2026-02-28", { unit: "month", interval: 1 }), "2026-03-28", "actual activity anchor");
equal(calculateLifecycle({ cycle: { unit: "day", interval: 14 }, historyCount: 0, lastPerformedDate: null, today: "2026-09-01" }).status, "NO_HISTORY", "no history");
equal(calculateLifecycle({ cycle: null, historyCount: 1, lastPerformedDate: "2026-09-01", today: "2026-09-01" }).status, "NO_CYCLE", "no cycle");
equal(formatCycle({ unit: "week", interval: 1, weekdays: [1, 4] }), "매주 월요일 · 목요일", "format cycle");

console.log("cycle contract smoke: PASS");
