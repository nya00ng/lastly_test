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

export interface CreateItemInput {
  name: string;
  cadence: {
    unit: 'day' | 'week' | 'month';
    interval: number;
    weekdays: number[];
    notifyTimeLocal: string | null;
  };
  cadenceSource: ItemRow['cadence_source'];
  firstDoneOn: string | undefined;
}

export interface CompleteItemResult {
  log: {
    id: string;
    itemId: string;
    doneOn: string;
    note: string | null;
    gapDays: number | null;
    createdAt: string;
  };
  itemId: string;
  itemName: string;
  nextDueOn: string | null;
  undoToken: string;
}

/** packages/contracts의 createItemSchema와 같은 입력 경계. 미지의 필드는 저장하지 않는다. */
export function parseCreateItem(value: unknown): CreateItemInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const cadence = input.cadence;
  if (!cadence || typeof cadence !== 'object' || Array.isArray(cadence)) return null;
  const rule = cadence as Record<string, unknown>;
  const weekdays = rule.weekdays === undefined ? [] : rule.weekdays;
  const notifyTimeLocal = rule.notifyTimeLocal === undefined ? null : rule.notifyTimeLocal;
  const cadenceSource = input.cadenceSource === undefined ? 'user' : input.cadenceSource;

  if (typeof input.name !== 'string' || input.name.length < 1 || input.name.length > 60)
    return null;
  if (!['day', 'week', 'month'].includes(String(rule.unit))) return null;
  if (!Number.isInteger(rule.interval) || Number(rule.interval) < 1 || Number(rule.interval) > 365)
    return null;
  if (
    !Array.isArray(weekdays) ||
    weekdays.length > 7 ||
    !weekdays.every((day) => Number.isInteger(day) && day >= 0 && day <= 6)
  )
    return null;
  if (rule.unit !== 'week' && weekdays.length > 0) return null;
  if (
    notifyTimeLocal !== null &&
    (typeof notifyTimeLocal !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(notifyTimeLocal))
  )
    return null;
  if (!['user', 'personal', 'community', 'default'].includes(String(cadenceSource))) return null;
  if (
    input.firstDoneOn !== undefined &&
    (typeof input.firstDoneOn !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.firstDoneOn))
  )
    return null;

  return {
    name: input.name,
    cadence: {
      unit: rule.unit as CreateItemInput['cadence']['unit'],
      interval: rule.interval as number,
      weekdays,
      notifyTimeLocal,
    },
    cadenceSource: cadenceSource as ItemRow['cadence_source'],
    firstDoneOn: input.firstDoneOn as string | undefined,
  };
}

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
