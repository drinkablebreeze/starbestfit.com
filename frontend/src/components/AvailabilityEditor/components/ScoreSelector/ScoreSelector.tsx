import { StarIcon } from 'lucide-react'

import { makeClass } from '/src/utils'
import { MAXSCORE } from '/src/utils/star'

import styles from './ScoreSelector.module.scss'

interface ScoreSelectorProps {
  value: number
  onChange: (value: number) => void
}

const ScoreSelector = ({ value, onChange }: ScoreSelectorProps) => {
  const scores = [...Array(MAXSCORE + 1).keys()]

  return <div className={styles.grid}>
    {scores.map(score =>
      <button
        type="button"
        className={makeClass(
          styles.score,
          score === value && styles.selected,
        )}
        key={score.toString()}
        onClick={() => onChange(score)}
      >
        <span className={styles.text}>{score}</span>
        {score > 0 && <StarIcon className={styles.star} strokeWidth={1.2}/>}
      </button>
    )}
  </div>
}

export default ScoreSelector
