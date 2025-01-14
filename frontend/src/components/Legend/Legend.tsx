import { useTranslation } from '/src/i18n/client'
import { useStore } from '/src/stores'
import useSettingsStore from '/src/stores/settingsStore'
import { averageAndRound } from '/src/utils/star'

import styles from './Legend.module.scss'

interface LegendProps {
  min: number
  max: number
  totalPeople: number
  palette: { string: string, highlight: string }[]
  onSegmentFocus: (segment: number | undefined) => void
}

const Legend = ({ min, max, totalPeople, palette, onSegmentFocus }: LegendProps) => {
  const { t } = useTranslation('event')
  const highlight = useStore(useSettingsStore, state => state.highlight)
  const setHighlight = useSettingsStore(state => state.setHighlight)

  // minimum and maximum average scores given to any timeslot
  const minAvgScore = averageAndRound(min, totalPeople)
  const maxAvgScore = averageAndRound(max, totalPeople)

  return <div className={styles.wrapper}>
    <label className={styles.label}>{t('stars', {count: minAvgScore})}</label>

    <div
      className={styles.bar}
      onMouseOut={() => onSegmentFocus(undefined)}
      onClick={() => setHighlight?.(!highlight)}
      title={t('group.legend_tooltip')}
    >
      {[...Array(max + 1 - min).keys()].map(i => i + min).map((i, j) =>
        <div
          key={i}
          style={{ flex: 1, backgroundColor: palette[j].string, '--highlight-color': palette[j].highlight } as React.CSSProperties}
          className={highlight && i === max && max > 0 ? styles.highlight : undefined}
          onMouseOver={() => onSegmentFocus(i)}
        />
      )}
    </div>

    <label className={styles.label}>{t('stars', {count: maxAvgScore})}</label>
  </div>
}

export default Legend
