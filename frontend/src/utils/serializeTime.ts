import { Temporal } from '@js-temporal/polyfill'

/**
 * Takes a ZonedDateTime in any timezone, and serializes it
 * @param isSpecificDates Whether to format as `HHmm-DDMMYYYY` or weekly format
 * @param eventTimezone If provided, serializes weekly times in the event timezone with `~` separator.
 *   Otherwise, serializes in UTC with `-` separator (legacy format).
 * @returns Time serialized as a string
 */
export const serializeTime = (time: Temporal.ZonedDateTime, isSpecificDates: boolean, eventTimezone?: string) => {
  if (isSpecificDates) {
    const t = time.withTimeZone('UTC')
    const [hour, minute, day, month] = [t.hour, t.minute, t.day, t.month].map(x => x.toString().padStart(2, '0'))
    const year = t.year.toString().padStart(4, '0')
    return `${hour}${minute}-${day}${month}${year}`
  }

  if (eventTimezone) {
    // New format: serialize in event timezone with ~ separator
    const t = time.withTimeZone(eventTimezone)
    const [hour, minute] = [t.hour, t.minute].map(x => x.toString().padStart(2, '0'))
    const dayOfWeek = (t.dayOfWeek === 7 ? 0 : t.dayOfWeek).toString()
    return `${hour}${minute}~${dayOfWeek}`
  }

  // Legacy format: serialize in UTC with - separator
  const t = time.withTimeZone('UTC')
  const [hour, minute] = [t.hour, t.minute].map(x => x.toString().padStart(2, '0'))
  const dayOfWeek = (t.dayOfWeek === 7 ? 0 : t.dayOfWeek).toString()
  return `${hour}${minute}-${dayOfWeek}`
}
