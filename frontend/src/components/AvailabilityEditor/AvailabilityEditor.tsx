import { Fragment, useCallback, useEffect, useRef, useState } from 'react'

import Button from '/src/components/Button/Button'
import Content from '/src/components/Content/Content'
import { TimeScore } from '/src/config/api'
import { usePalette } from '/src/hooks/usePalette'
import { useTranslation } from '/src/i18n/client'
import { calculateTable, makeClass, parseSpecificDate } from '/src/utils'
import { getScoreForTime, MAXSCORE } from '/src/utils/star'

import styles from './AvailabilityEditor.module.scss'
import GoogleCalendar from './components/GoogleCalendar/GoogleCalendar'
import RecentEvents from './components/RecentEvents/RecentEvents'
import ScoreSelector from './components/ScoreSelector/ScoreSelector'
import viewerStyles from '../AvailabilityViewer/AvailabilityViewer.module.scss'
import Skeleton from '../AvailabilityViewer/components/Skeleton/Skeleton'

interface AvailabilityEditorProps {
  eventId?: string
  times: string[]
  timezone: string
  value: TimeScore[]
  onChange: (value: TimeScore[]) => void
  table?: ReturnType<typeof calculateTable>
}

const AvailabilityEditor = ({ eventId, times, timezone, value = [], onChange, table }: AvailabilityEditorProps) => {
  const { t } = useTranslation('event')

  // Ref and state required to rerender but also access static version in callbacks
  const selectingRef = useRef<string[]>([])
  const [selecting, _setSelecting] = useState<string[]>([])
  const setSelecting = useCallback((v: string[]) => {
    selectingRef.current = v
    _setSelecting(v)
  }, [])

  const startPos = useRef({ x: 0, y: 0 })
  const mode = useRef<'add' | 'remove'>()

  // Create the colour palette
  const palette = usePalette(MAXSCORE + 1)

  const [selectedScore, setSelectedScore] = useState<number>(MAXSCORE)

  // Selection control
  const selectAll = useCallback(() => onChange(
    times.map(t => ({
      time: t,
      score: selectedScore // set all times to the selected score
    }))
  ), [onChange, times, selectedScore])
  const selectNone = useCallback(() => onChange([]), [onChange])
  const selectInvert = useCallback(() => onChange(
    times.map(t => ({
      time: t,
      score: MAXSCORE - getScoreForTime(t, value), // invert all scores
    }))
  ), [onChange, times, value])

  // Selection keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'a' || e.key === 'i')) {
        e.preventDefault()
        if (e.shiftKey && e.key === 'a') selectNone()
        else if (e.key === 'a') selectAll()
        else selectInvert()
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [selectAll, selectNone, selectInvert])

  return <>
    <Content isCentered>
      <div>{t('you.info')}</div>
      <div className={styles.selectionControls}>
        <Button isSmall onClick={selectAll} title="Ctrl + A (⌘ A)">{t('you.select_all')}</Button>
        <Button isSmall onClick={selectNone} title="Ctrl + Shift + A (⌘ ⇧ A)">{t('you.select_none')}</Button>
        <Button isSmall onClick={selectInvert} title="Ctrl + I (⌘ I)">{t('you.select_invert')}</Button>
      </div>
    </Content>
    {times[0]?.length === 13 && <Content>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <GoogleCalendar
          timezone={timezone}
          timeStart={parseSpecificDate(times[0])}
          timeEnd={parseSpecificDate(times[times.length - 1]).add({ minutes: 15 })}
          times={times}
          selectedScore={selectedScore}
          onImport={onChange}
        />
        <RecentEvents
          eventId={eventId}
          times={times}
          onImport={onChange}
        />
      </div>
    </Content>}
    <Content>
      <ScoreSelector
        value={selectedScore}
        onChange={setSelectedScore}
      />
    </Content>

    <div className={viewerStyles.wrapper}>
      <div>
        <div className={viewerStyles.heatmap}>
          <div className={viewerStyles.timeLabels}>
            {table?.rows.map((row, i) =>
              <div className={viewerStyles.timeSpace} key={i}>
                {row && <label className={viewerStyles.timeLabel}>
                  {row.label}
                </label>}
              </div>
            ) ?? null}
          </div>

          {table?.columns.map((column, x) => <Fragment key={x}>
            {column ? <div className={viewerStyles.dateColumn}>
              {column.header.dateLabel && <label className={viewerStyles.dateLabel}>{column.header.dateLabel}</label>}
              <label className={viewerStyles.dayLabel}>{column.header.weekdayLabel}</label>

              <div
                className={viewerStyles.times}
                data-border-left={x === 0 || table.columns.at(x - 1) === null}
                data-border-right={x === table.columns.length - 1 || table.columns.at(x + 1) === null}
              >
                {column.cells.map((cell, y) => {
                  if (y === column.cells.length - 1) return null

                  if (!cell) return <div
                    className={makeClass(viewerStyles.timeSpace, viewerStyles.grey)}
                    key={y}
                    title={t('greyed_times')}
                  />

                  const isSelected = selecting.includes(cell.serialized)
                  const isAdd = mode.current === 'add'
                  const currentScore = getScoreForTime(cell.serialized, value)
                  const isSelectedScore = currentScore === selectedScore

                  return <div
                    key={y}
                    className={makeClass(viewerStyles.time, selecting.length === 0 && viewerStyles.editable)}
                    style={{
                      touchAction: 'none',
                      backgroundColor: isSelected && isAdd
                        ? palette[selectedScore].string // selecting+adding -> use selected score
                        : isSelected ? palette[0].string // selecting+removing -> use zero score
                          : palette[currentScore].string, // no select
                      '--hover-color': palette[currentScore].highlight,
                      ...cell.minute !== 0 && cell.minute !== 30 && { borderTopColor: 'transparent' },
                      ...cell.minute === 30 && { borderTopStyle: 'dotted' },
                    } as React.CSSProperties}
                    onPointerDown={e => {
                      e.preventDefault()
                      startPos.current = { x, y }
                      // if we start selection on a region that has the same score as the selected score,
                      // we start a remove operation which clears the selection to a zero score
                      mode.current = isSelectedScore ? 'remove' : 'add'
                      setSelecting([cell.serialized])
                      e.currentTarget.releasePointerCapture(e.pointerId)

                      document.addEventListener('pointerup', () => {
                        // current availability with the selected region removed
                        const selectingRemoved = value.filter(ts => !selectingRef.current.includes(ts.time))
                        if (mode.current === 'add') {
                          // selecting region with the selected score
                          const selectingScored = selectingRef.current.map(t => ({
                            time: t,
                            score: selectedScore
                          }))
                          onChange([...selectingRemoved, ...selectingScored])
                        } else if (mode.current === 'remove') {
                          onChange(selectingRemoved)
                        }
                        setSelecting([])
                        mode.current = undefined
                      }, { once: true })
                    }}
                    onPointerEnter={() => {
                      if (mode.current) {
                        const found = []
                        for (let cy = Math.min(startPos.current.y, y); cy < Math.max(startPos.current.y, y) + 1; cy++) {
                          for (let cx = Math.min(startPos.current.x, x); cx < Math.max(startPos.current.x, x) + 1; cx++) {
                            found.push({ y: cy, x: cx })
                          }
                        }
                        setSelecting(found.flatMap(d => {
                          const serialized = table.columns[d.x]?.cells[d.y]?.serialized
                          if (serialized && times.includes(serialized)) {
                            return [serialized]
                          }
                          return []
                        }))
                      }
                    }}
                  />
                })}
              </div>
            </div> : <div className={viewerStyles.columnSpacer} />}
          </Fragment>) ?? <Skeleton isSpecificDates={times[0]?.length === 13} />}
        </div>
      </div>
    </div>
  </>
}

export default AvailabilityEditor
