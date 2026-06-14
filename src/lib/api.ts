import { firebaseAuth } from '@/lib/firebase'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'

export class ApiError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

interface ApiOptions extends RequestInit {
  auth?: boolean
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const currentUser = firebaseAuth.currentUser
  if (currentUser) {
    const token = await currentUser.getIdToken()
    headers.set('Authorization', `Bearer ${token}`)
  } else if (options.auth) {
    throw new ApiError('Login required', 401)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const payload = await safeJson(response)
    const message =
      typeof payload === 'object' && payload && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : `Request failed with ${response.status}`
    throw new ApiError(message, response.status, payload)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

async function safeJson(response: Response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}
