/** 기존 GET /v1/items 응답 모양을 Edge Function에서도 유지한다. */
export interface ItemRow {
  id: string;
  name: string;
  status: 'active' | 'archived';
  cadence_unit: 'day' | 'week' | 'month';
  cadence_interval: number;
  cadence_weekdays: number[] | null;
  notify_time: string | null;
  cadence_source: 'user' | 'personal' | 'community' | 'default';
  last_done_on: string | null;
  next_due_on: string | null;
  snoozed_until: string | null;
  average_interval_days: number | null;
  log_count: number;
  created_at: string;
  updated_at: string;
}

export const ITEM_COLUMNS =
  'id, name, status, cadence_unit, cadence_interval, cadence_weekdays, notify_time, cadence_source, last_done_on, next_due_on, snoozed_until, average_interval_days, log_count, created_at, updated_at';

/** 날짜만 비교해 서버 지역이나 DST에 따라 D-n이 달라지지 않게 한다. */
function calendarDays(from: string, to: string): number {
  const fromMs = Date.parse(`${from}T00:00:00Z`);
  const toMs = Date.parse(`${to}T00:00:00Z`);
  return Math.round((toMs - fromMs) / 86_400_000);
}

export function toItem(row: ItemRow, today: string) {
  const daysUntilDue = row.next_due_on ? calendarDays(today, row.next_due_on) : null;
  const bucket = row.snoozed_until
    ? 'later'
    : daysUntilDue === null || daysUntilDue <= 0
      ? 'due'
      : daysUntilDue <= 14
        ? 'upcoming'
        : 'later';

  return {
    id: row.id,
    name: row.name,
    status: row.status,
    cadence: {
      unit: row.cadence_unit,
      interval: row.cadence_interval,
      weekdays: row.cadence_weekdays ?? [],
      notifyTimeLocal: row.notify_time?.slice(0, 5) ?? null,
    },
    cadenceSource: row.cadence_source,
    lastDoneOn: row.last_done_on,
    nextDueOn: row.next_due_on,
    snoozedUntil: row.snoozed_until,
    daysSinceLastDone: row.last_done_on ? calendarDays(row.last_done_on, today) : null,
    daysUntilDue,
    bucket,
    averageIntervalDays: row.average_interval_days,
    cadenceDrift: null,
    logCount: row.log_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
