/**
 * Hook pour gérer les CSRF tokens automatiquement
 * Récupère le token au login et l'envoie avec chaque POST/PATCH/DELETE
 */

let csrfToken = localStorage.getItem('csrfToken') || null

export function useCSRFToken() {
  const setCsrfToken = (token) => {
    csrfToken = token
    if (token) {
      localStorage.setItem('csrfToken', token)
    } else {
      localStorage.removeItem('csrfToken')
    }
  }

  const getCsrfToken = () => csrfToken

  return { getCsrfToken, setCsrfToken }
}

/**
 * Wrapper autour de fetch pour ajouter automatiquement le CSRF token
 */
export async function secureApiFetch(url, options = {}) {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include' // Envoyer les cookies (incluant auth_token et sessionId)
  }

  // Ajouter CSRF token pour POST/PATCH/DELETE
  const method = (options.method || 'GET').toUpperCase()
  if (['POST', 'PATCH', 'DELETE', 'PUT'].includes(method)) {
    const token = csrfToken || localStorage.getItem('csrfToken')
    if (token) {
      config.headers['X-CSRF-Token'] = token
    }
  }

  return fetch(url, config)
}

/**
 * Récupérer et sauvegarder le CSRF token depuis le serveur
 */
export async function fetchCSRFToken() {
  try {
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) throw new Error('CSRF token fetch failed')

    const data = await response.json()
    csrfToken = data.csrfToken
    localStorage.setItem('csrfToken', data.csrfToken)
    return data.csrfToken
  } catch (err) {
    console.error('Error fetching CSRF token:', err)
    return null
  }
}
