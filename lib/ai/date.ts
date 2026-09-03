export const SERVER_TIMEZONE = "Asia/Seoul" as const;

export function getCurrentLocalDate(timeZone: typeof SERVER_TIMEZONE = SERVER_TIMEZONE) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("CURRENT_LOCAL_DATE_UNAVAILABLE");
  }

  return `${year}-${month}-${day}`;
}

export function isIsoDate(value: string | null): value is string {
  return value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
