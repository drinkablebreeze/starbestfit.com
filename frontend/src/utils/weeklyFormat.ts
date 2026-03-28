import { Temporal } from '@js-temporal/polyfill'

/**
 * Returns true if times are in the new event-local weekly format (HHmm~d)
 * as opposed to the old UTC-based format (HHmm-d) or specific dates (HHmm-DDMMYYYY)
 */
export const isLocalWeekdayFormat = (times: string[]): boolean =>
  times.length > 0 && times[0].length === 6 && times[0][4] === '~'

/**
 * Check if two timezones have different DST transition schedules.
 * Compares the offset delta between the two timezones at two points
 * ~6 months apart. If the delta changes, their DST rules differ.
 */
export const hasDstMismatch = (tz1: string, tz2: string): boolean => {
  if (tz1 === tz2) return false
  const now = Temporal.Now.instant()
  const later = now.add({ hours: 4380 }) // ~6 months
  const deltaNow = offsetInMinutes(now, tz1) - offsetInMinutes(now, tz2)
  const deltaLater = offsetInMinutes(later, tz1) - offsetInMinutes(later, tz2)
  return deltaNow !== deltaLater
}

const offsetInMinutes = (instant: Temporal.Instant, tz: string): number =>
  instant.toZonedDateTimeISO(tz).offsetNanoseconds / 60_000_000_000
