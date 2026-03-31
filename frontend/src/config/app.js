if (typeof window === 'undefined') {
  if (process.env.FRONTEND_URL === undefined) {
    throw new Error('Expected Frontend URL environment variable')
  }
}

export const AppBase = new URL(process.env.FRONTEND_URL || window.location.protocol + "//" + window.location.host)
