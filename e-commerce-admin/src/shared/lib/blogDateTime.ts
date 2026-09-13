const MOSCOW_UTC_OFFSET_MINUTES = 180;

export const BLOG_PUBLICATION_TIMEZONE_LABEL = "МСК (UTC+3)";

function shiftMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

export function nowForMoscowInput() {
  return shiftMinutes(new Date(), MOSCOW_UTC_OFFSET_MINUTES)
    .toISOString()
    .slice(0, 16);
}

export function isoToMoscowInput(value: string) {
  return shiftMinutes(new Date(value), MOSCOW_UTC_OFFSET_MINUTES)
    .toISOString()
    .slice(0, 16);
}

export function moscowInputToIso(value: string) {
  if (!value) return value;
  return new Date(`${value}:00+03:00`).toISOString();
}
