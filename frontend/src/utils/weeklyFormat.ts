import { Temporal } from '@js-temporal/polyfill'

/**
 * Returns true if times are in the new event-local weekly format (HHmm~d)
 * as opposed to the old UTC-based format (HHmm-d) or specific dates (HHmm-DDMMYYYY)
 */
export const isLocalWeekdayFormat = (times: string[]): boolean =>
  times.length > 0 && times[0].length === 6 && times[0][4] === '~'

/**
 * Check if two timezones have different DST transition schedules.
 * Samples the offset delta at 4 points across the year (every 3 months).
 * If the delta changes between any two samples, their DST rules differ.
 */
export const hasDstMismatch = (tz1: string, tz2: string): boolean => {
  if (tz1 === tz2) return false
  const now = Temporal.Now.instant()
  const delta = (instant: Temporal.Instant) =>
    offsetInMinutes(instant, tz1) - offsetInMinutes(instant, tz2)
  const d0 = delta(now)
  for (let i = 1; i <= 3; i++) {
    if (delta(now.add({ hours: i * 2190 })) !== d0) return true // ~3 months each
  }
  return false
}

const offsetInMinutes = (instant: Temporal.Instant, tz: string): number =>
  instant.toZonedDateTimeISO(tz).offsetNanoseconds / 60_000_000_000
