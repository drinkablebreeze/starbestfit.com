import { Temporal } from '@js-temporal/polyfill'

import { isLocalWeekdayFormat } from './weeklyFormat'

/**
 * Time format overview
 *
 * There are three time string formats used in the application:
 *
 * 1. `HHmm-DDMMYYYY` (specific dates) — UTC time + calendar date.
 *    Used for polls tied to specific dates. Always stored and parsed as UTC.
 *
 * 2. `HHmm-d` (legacy weekly) — UTC time + day of week (0=Sun, 1=Mon, ..., 6=Sat).
 *    The original weekly poll format. Hours are in UTC, which causes problems:
 *    when the poll is created during a week that spans a DST transition, different
 *    days can end up with different UTC offsets for the same local hour (e.g.,
 *    Sunday at 1300 UTC vs Monday at 1400 UTC for "7am Pacific").
 *
 * 3. `HHmm~d` (new weekly) — event-local time + day of week (same weekday convention).
 *    Hours are in the event's creation timezone (stored on the event as `timezone`).
 *    This means "7pm Monday" is always stored as `1900~1` regardless of DST state.
 *    The `~` separator distinguishes this format from the legacy `-` format, so old
 *    polls continue to work without migration.
 *
 *    At display time, the client converts from the event timezone to the viewer's
 *    timezone by attaching dates from the current week and using Temporal's timezone
 *    conversion. This means the poll always shows the current wall-clock interpretation
 *    of the times. If the viewer's timezone has different DST rules than the event
 *    timezone, times may shift by ~1 hour near DST transitions (the UI warns about this).
 *
 * The `expandTimes` utility expands hourly slots (e.g., `1900~1`) into 15-minute
 * increments (`1900~1`, `1915~1`, `1930~1`, `1945~1`). Both formats share the same
 * positional structure (4-char time + separator + rest), so expansion works for all formats.
 */

/**
 * Take times as strings and convert to ZonedDateTime objects in the target timezone
 * @param times An array of strings in `HHmm~d`, `HHmm-d`, or `HHmm-DDMMYYYY` format
 * @param timezone The target timezone for display
 * @param eventTimezone The timezone the event was created in (needed for `HHmm~d` format)
 */
export const convertTimesToDates = (times: string[], timezone: string, eventTimezone?: string): Temporal.ZonedDateTime[] => {
  const isSpecificDates = times[0]?.length === 13

  if (isLocalWeekdayFormat(times)) {
    // New format: times are in the event's local timezone
    return times.map(time =>
      parseLocalWeekdayDate(time, eventTimezone ?? timezone).withTimeZone(timezone)
    )
  }

  return times.map(time => isSpecificDates ?
    parseSpecificDate(time).withTimeZone(timezone)
    : parseWeekdayDate(time, timezone).withTimeZone(timezone)
  )
}

// Parse from UTC `HHmm-DDMMYYYY` format into a ZonedDateTime in UTC
export const parseSpecificDate = (str: string): Temporal.ZonedDateTime => {
  if (str.length !== 13) {
    throw new Error('String must be in HHmm-DDMMYYYY format')
  }

  // Extract values
  const [hour, minute] = [Number(str.substring(0, 2)), Number(str.substring(2, 4))]
  const [day, month, year] = [Number(str.substring(5, 7)), Number(str.substring(7, 9)), Number(str.substring(9))]

  // Construct PlainDateTime
  return Temporal.ZonedDateTime.from({
    hour, minute, day, month, year,
    timeZone: 'UTC',
  })
}

// Parse from `HHmm~d` format (local time in event timezone) into a ZonedDateTime
// Attaches a date from the current week to resolve the timezone conversion
const parseLocalWeekdayDate = (str: string, eventTimezone: string): Temporal.ZonedDateTime => {
  // Extract values
  const [hour, minute] = [Number(str.substring(0, 2)), Number(str.substring(2, 4))]
  const dayOfWeek = Number(str.substring(5))

  // Use today in the event timezone to find a calendar date for this weekday
  const nowInEventTz = Temporal.Now.zonedDateTimeISO(eventTimezone)
  // Find a date matching the target day of week (ISO: 1=Mon, but our format uses 0=Sun)
  const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek
  const dayDelta = isoDayOfWeek - nowInEventTz.dayOfWeek
  const targetDate = nowInEventTz.toPlainDate().add({ days: dayDelta })

  return targetDate.toZonedDateTime({
    timeZone: eventTimezone,
    plainTime: Temporal.PlainTime.from({ hour, minute }),
  })
}

// Parse from UTC `HHmm-d` format into a ZonedDateTime in UTC based on the current date
const parseWeekdayDate = (str: string, timezone: string): Temporal.ZonedDateTime => {
  if (str.length !== 6) {
    throw new Error('String must be in HHmm-d format')
  }

  // Extract values
  const [hour, minute] = [Number(str.substring(0, 2)), Number(str.substring(2, 4))]
  const dayOfWeek = Number(str.substring(5))

  // Construct PlainDateTime from today
  const today = Temporal.Now.zonedDateTimeISO('UTC').round('day')
  const dayDelta = dayOfWeek - today.dayOfWeek
  const resultDay = today.add({ days: dayDelta })

  let resultDate = resultDay.with({
    hour, minute
  })

  // If resulting day (in target timezone) is in the next week, move it back to this week
  const dayInTz = resultDate.withTimeZone(timezone)
  const todayInTz = today.withTimeZone(timezone)
  if (dayInTz.weekOfYear > todayInTz.weekOfYear) {
    resultDate = resultDate.subtract({ days: 7 })
  }

  return resultDate
}
