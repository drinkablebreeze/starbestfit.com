import { PersonResponse } from "/src/config/api"

import { getScoreForTime } from "./star"

// A person and the score they gave a date
export interface NameScore {
  name: string,
  score: number,
}

// Availability for a date
export interface Availability {
  date: string
  /** Names of everyone who is available (>0 score) at this date with their scores */
  people: NameScore[]
}

interface AvailabilityInfo {
  availabilities: Availability[]
  /** The total score for the date with lowest availability */
  min: number
  /** The total score for the date with highest availability */
  max: number
}

/**
 * Takes an array of dates and an array of people,
 * where each person has a name and availability array, and returns the
 * group availability for each date passed in.
 */
export const calculateAvailability = (dates: string[], people: PersonResponse[]): AvailabilityInfo => {
  if (people.length === 0) {
    // short circuit so we don't return infinities
    return { availabilities: [], min: 0, max: 0 }
  }
  let min = Infinity
  let max = -Infinity

  const availabilities: Availability[] = dates.map(date => {
    // for a date, get the names of people that gave a score > 0 and their score
    const nameScores = people.flatMap(p => {
      const score = getScoreForTime(date, p.availability)
      return score > 0 ? [({ name: p.name, score: score })] : []
    })
    const totalScore = nameScores.reduce((sum, curr) => sum += curr.score, 0)
    if (totalScore < min) {
      min = totalScore
    }
    if (totalScore > max) {
      max = totalScore
    }
    return { date, people: nameScores }
  })

  return { availabilities, min, max }
}
