// Helpers for defining star voting and computing results

import { TimeScore } from '/src/config/api'

export const MAXSCORE = 5 // minimum score always assumed to be 0

// Get the current score for a time given some availability. If a time is not
// present in the availability, we assume its value is zero.
export const getScoreForTime = (time: string, availability: TimeScore[]): number => {
  const timescore = availability.find(item => item.time === time)
  return timescore ? timescore.score : 0
}

// Filter out times where the score is 0. In our representation, any missing
// times are assumes to be a zero score, so we can avoid persisting them and use
// their absence as an indicator of unavailability.
export const dropZeroScores = (availability: TimeScore[]): TimeScore[] => {
  return availability.filter(item => item.score > 0)
}

// Calculate the average score given to a time given the total sum of its score
// and the number of people that voted.
export const calcAverageScore = (totalScore: number, numPeople: number): number => {
  return numPeople ? (totalScore / numPeople) : 0
}
