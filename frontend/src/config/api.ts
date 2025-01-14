// TODO: Potentially write a simple rust crate that generates these from the OpenAPI spec

import { z } from 'zod'

import { MAXSCORE } from '../utils/star'

if (process.env.NEXT_PUBLIC_API_URL === undefined) {
  throw new Error('Expected API url environment variable')
}

const API_BASE = new URL(process.env.NEXT_PUBLIC_API_URL)

export const EventInput = z.object({
  name: z.string().optional(),
  times: z.string().array(),
  timezone: z.string(),
})
export type EventInput = z.infer<typeof EventInput>

export const EventResponse = z.object({
  id: z.string(),
  name: z.string(),
  times: z.string().array(),
  timezone: z.string(),
  created_at: z.number(),
})
export type EventResponse = z.infer<typeof EventResponse>

// Frontend types for availability. Breaks binary yes/no availability
// represented as the time string into a TimeScore containing the time
// string and the score given to the time. When interfacing with the backend
// the time string and the score are contatenated with a double underscore,
// e.g. '1100-12042021__4' <- the time was scored a 4
export type TimeScore = {
  time: string,
  score: number,
}
export type PersonInput = {
  availability: TimeScore[],
}
export type PersonResponse = {
  name: string,
  availability: TimeScore[],
  created_at: number,
}

// Backend types for availability.
export const APIPersonInput = z.object({
  availability: z.string().array(),
})
export type APIPersonInput = z.infer<typeof APIPersonInput>

export const APIPersonResponse = z.object({
  name: z.string(),
  availability: z.string().array(),
  created_at: z.number(),
})
export type APIPersonResponse = z.infer<typeof APIPersonResponse>

// serialize and deserialize TimeScores for the backend
const serializeTimeScore = (ts: TimeScore): string => `${ts.time}__${ts.score}`
const deserializeTimeScore = (ts: string): TimeScore => {
  const [timeStr, scoreStr] = ts.split('__')
  let score = parseInt(scoreStr)
  if (isNaN(score)) {
    // if we can't parse out the score we assume it's the max, enabling
    // backwards-compatibility with prior non-scored availabilities in the database
    score = MAXSCORE
  }
  // clamp to valid range so people can't tamper with the results others see by
  // sending out of bound scores to the API
  const clamped = Math.min(Math.max(score, 0), MAXSCORE)
  return { time: timeStr, score: clamped }
}
const serializePersonInput = (input: PersonInput): APIPersonInput => {
  return { availability: input.availability.map(serializeTimeScore) }
}
export const deserializePersonResponse = (response: APIPersonResponse): PersonResponse => {
  return {
    name: response.name,
    availability: response.availability.map(deserializeTimeScore),
    created_at: response.created_at,
  }
}

export const StatsResponse = z.object({
  event_count: z.number(),
  person_count: z.number(),
  version: z.string(),
})
export type StatsResponse = z.infer<typeof StatsResponse>

const get = async <S extends z.Schema>(url: string, schema: S, auth?: string, nextOptions?: NextFetchRequestConfig): Promise<ReturnType<S['parse']>> => {
  const res = await fetch(new URL(url, API_BASE), {
    headers: {
      ...auth && { Authorization: `Bearer ${auth}` },
    },
    next: nextOptions,
  })
    .catch(console.warn)
  if (!res?.ok) throw res
  return schema.parse(await res.json())
}

const post = async <S extends z.Schema>(url: string, schema: S, input: unknown, auth?: string, method = 'POST'): Promise<ReturnType<S['parse']>> => {
  const res = await fetch(new URL(url, API_BASE), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...auth && { Authorization: `Bearer ${auth}` },
    },
    body: JSON.stringify(input),
  })
    .catch(console.warn)
  if (!res?.ok) throw res
  return schema.parse(await res.json())
}

// Get
export const getStats = () => get('/stats', StatsResponse, undefined, { revalidate: 60 })
export const getEvent = (eventId: string) => get(`/event/${eventId}`, EventResponse)
export const getPeople = async (eventId: string) => {
  const res = await get(`/event/${eventId}/people`, APIPersonResponse.array())
  return res.map(deserializePersonResponse)
}
export const getPerson = async (eventId: string, personName: string, password?: string) => {
  const res = await get(`/event/${eventId}/people/${personName}`, APIPersonResponse, password && btoa(password))
  return deserializePersonResponse(res)
}

// Post
export const createEvent = (input: EventInput) => post('/event', EventResponse, EventInput.parse(input))
export const updatePerson = async (eventId: string, personName: string, input: PersonInput, password?: string) => {
  const validated_input = APIPersonInput.parse(serializePersonInput(input))
  const res = await post(`/event/${eventId}/people/${personName}`, APIPersonResponse, validated_input, password && btoa(password), 'PATCH')
  return deserializePersonResponse(res)
}
