import { convertTimesToDates } from '/src/utils/convertTimesToDates'

export const timeToLocaleString = (
  time: string,
  locale: string,
  timeFormat: '12h' | '24h',
  timezone: string,
): string => {
  const isSpecificDates = time.length === 13
  const date = convertTimesToDates([time], timezone)[0]
  const label = isSpecificDates
    ? date.toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short', hourCycle: timeFormat === '12h' ? 'h12' : 'h24' })
    : `${date.toLocaleString(locale, { timeStyle: 'short', hourCycle: timeFormat === '12h' ? 'h12' : 'h24' })}, ${date.toLocaleString(locale, { weekday: 'long' })}`
  return label
}
