import { randomBytes } from 'crypto';

/**
 * Simple in-memory session store pour CSRF tokens
 * En production, utiliser Redis ou une BD
 */
class SessionStore {
  constructor() {
    this.sessions = new Map()
  }

  createSession(sessionId) {
    const session = {
      id: sessionId,
      createdAt: Date.now(),
      csrfToken: generateRandomToken()
    }
    this.sessions.set(sessionId, session)
    return session
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId)
  }

  deleteSession(sessionId) {
    this.sessions.delete(sessionId)
  }
}

function generateRandomToken() {
  return randomBytes(32).toString('hex')
}

export const sessionStore = new SessionStore()

/**
 * Middleware pour initialiser/récupérer la session
 */
export function sessionMiddleware(req, res, next) {
  let sessionId = req.cookies?.sessionId

  if (!sessionId) {
    sessionId = randomBytes(16).toString('hex')
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax', // 'Lax' en dev pour cross-origin
      maxAge: 24 * 60 * 60 * 1000 // 24h
    })
  }

  let session = sessionStore.getSession(sessionId)
  if (!session) {
    session = sessionStore.createSession(sessionId)
  }

  req.sessionId = sessionId
  req.session = session

  next()
}
