'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { flip, offset, shift, useFloating } from '@floating-ui/react-dom'
import { Temporal } from '@js-temporal/polyfill'

import Content from '/src/components/Content/Content'
import Legend from '/src/components/Legend/Legend'
import { PersonResponse } from '/src/config/api'
import { usePalette } from '/src/hooks/usePalette'
import { useTranslation } from '/src/i18n/client'
import { useStore } from '/src/stores'
import useSettingsStore from '/src/stores/settingsStore'
import { calculateAvailability, calculateTable, makeClass, NameScore, relativeTimeFormat } from '/src/utils'
import { MAXSCORE } from '/src/utils/star'

import styles from './AvailabilityViewer.module.scss'
import Skeleton from './components/Skeleton/Skeleton'

interface AvailabilityViewerProps {
  times: string[]
  people: PersonResponse[]
  table?: ReturnType<typeof calculateTable>
}

const AvailabilityViewer = ({ times, people, table }: AvailabilityViewerProps) => {
  const { t, i18n } = useTranslation('event')

  const highlight = useStore(useSettingsStore, state => state.highlight)
  const [filteredPeople, setFilteredPeople] = useState(people.map(p => p.name))
  const [tempFocus, setTempFocus] = useState<string>()
  const [focusCount, setFocusCount] = useState<number>()

  const [tooltip, setTooltip] = useState<{
    anchor: HTMLDivElement
    available: string
    date: string
    people: NameScore[]
  }>()
  const { refs, floatingStyles } = useFloating({
    middleware: [offset(6), flip(), shift()],
    elements: { reference: tooltip?.anchor },
  })

  // Calculate availabilities
  const { availabilities, min, max } = useMemo(() =>
    calculateAvailability(times, people.filter(p => filteredPeople.includes(p.name))),
  [times, filteredPeople, people])

  // Create the colour palette
  const palette = usePalette(Math.max((max - min) + 1, 2))
  const tempFocusPalette = usePalette(MAXSCORE + 1)

  // Reselect everyone if the amount of people changes
  useEffect(() => {
    setFilteredPeople(people.map(p => p.name))
  }, [people.length])

  // add the score to each name
  const formatNameScores = (nameScores: NameScore[]): string[] => {
    return nameScores
      .sort((p1, p2) => p2.score - p1.score) // sort descending by score
      .map(p => `${p.name} (${p.score})`)
  }

  const heatmap = useMemo(() => table?.columns.map((column, x) => <Fragment key={x}>
    {column ? <div className={styles.dateColumn}>
      {column.header.dateLabel && <label className={styles.dateLabel}>{column.header.dateLabel}</label>}
      <label className={styles.dayLabel}>{column.header.weekdayLabel}</label>

      <div
        className={styles.times}
        data-border-left={x === 0 || table.columns.at(x - 1) === null}
        data-border-right={x === table.columns.length - 1 || table.columns.at(x + 1) === null}
      >
        {column.cells.map((cell, y) => {
          if (y === column.cells.length - 1) return null

          if (!cell) return <div
            className={makeClass(styles.timeSpace, styles.grey)}
            key={y}
            title={t('greyed_times')}
          />

          let peopleHere = availabilities.find(a => a.date === cell.serialized)?.people ?? []
          if (tempFocus) {
            peopleHere = peopleHere.filter(p => p.name === tempFocus)
          }
          // sum of the scores for the current cell
          const hereCount = peopleHere.reduce((sum, p) => sum += p.score, 0)
          const paletteIndex = Math.max(hereCount - min, 0)
          const color = (tempFocus && peopleHere.length)
            ? tempFocusPalette[peopleHere[0].score]
            : palette[paletteIndex]
          const peopleHereString = formatNameScores(peopleHere).join(', ')

          return <div
            key={y}
            className={makeClass(
              styles.time,
              styles.nonEditable,
              (focusCount === undefined || focusCount === hereCount) // whether to show
                && highlight
                && (hereCount === max || (tempFocus && hereCount === MAXSCORE)) // only the highest scoring times
                && peopleHere.length > 0
                && styles.highlight,
            )}
            style={{
              backgroundColor: (focusCount === undefined || focusCount === hereCount)
                ? color.string : 'transparent',
              '--highlight-color': color.highlight,
              ...cell.minute !== 0 && cell.minute !== 30 && { borderTopColor: 'transparent' },
              ...cell.minute === 30 && { borderTopStyle: 'dotted' },
            } as React.CSSProperties}
            aria-label={peopleHereString}
            onMouseEnter={e => {
              setTooltip({
                anchor: e.currentTarget,
                available: `${(hereCount / filteredPeople.length).toFixed(2)}`,
                date: cell.label,
                people: peopleHere,
              })
            }}
            onClick={() => {
              const clipboardMessage = `${t('group.clipboard_message', { date: cell.label })}:\n${peopleHereString}`
              navigator.clipboard.writeText(clipboardMessage)
            }}
            onMouseLeave={() => setTooltip(undefined)}
          />
        })}
      </div>
    </div> : <div className={styles.columnSpacer} />}
  </Fragment>) ?? <Skeleton isSpecificDates={times[0]?.length === 13} />, [
    availabilities,
    table?.columns,
    highlight,
    max,
    min,
    t,
    palette,
    tempFocus,
    focusCount,
    filteredPeople,
  ])

  return <>
    <Content>
      <Legend
        min={min}
        max={max}
        totalPeople={filteredPeople.length}
        palette={palette}
        onSegmentFocus={setFocusCount}
      />

      <span className={styles.info}>{t('group.info1')}</span>

      {people.length > 1 && <>
        <span className={styles.info}>{t('group.info2')}</span>
        <div className={styles.people}>
          {people.map(person =>
            <button
              type="button"
              className={makeClass(
                styles.person,
                filteredPeople.includes(person.name) && styles.personSelected,
              )}
              key={person.name}
              onClick={() => {
                setTempFocus(undefined)
                if (filteredPeople.includes(person.name)) {
                  setFilteredPeople(filteredPeople.filter(n => n !== person.name))
                } else {
                  setFilteredPeople([...filteredPeople, person.name])
                }
              }}
              onMouseOver={() => setTempFocus(person.name)}
              onMouseOut={() => setTempFocus(undefined)}
              title={relativeTimeFormat(Temporal.Instant.fromEpochSeconds(person.created_at), i18n.language)}
            >{person.name}</button>
          )}
        </div>
      </>}
    </Content>

    <div className={styles.wrapper}>
      <div>
        <div className={styles.heatmap}>
          {useMemo(() => <div className={styles.timeLabels}>
            {table?.rows.map((row, i) =>
              <div className={styles.timeSpace} key={i}>
                {row && <label className={styles.timeLabel}>
                  {row.label}
                </label>}
              </div>
            ) ?? null}
          </div>, [table?.rows])}

          {heatmap}
        </div>

        {tooltip && <div
          className={styles.tooltip}
          ref={refs.setFloating}
          style={floatingStyles}
        >
          <h3>{tooltip.available}</h3>
          <span>{tooltip.date}</span>
          {!!filteredPeople.length && <div>
            {formatNameScores(tooltip.people).map(person => <span key={person}>{person}</span>)}
            {formatNameScores(filteredPeople
              .filter(p => !tooltip.people.map(p2 => p2.name).includes(p))
              .map(p => ({ name: p, score: 0 }))
            ).map(person =>
              <span key={person} data-disabled>{person}</span>
            )}
          </div>}
        </div>}
      </div>
    </div>
  </>
}

export default AvailabilityViewer
