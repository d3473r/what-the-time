export interface EventPayload {
  /** ISO 8601 UTC string, e.g. "2026-08-20T15:19:00.000Z" */
  t: string
  /** Event title */
  title: string
  /** Optional URL (e.g. livestream) */
  url?: string
}

/**
 * Encode an EventPayload into a URL-safe base64 string.
 * Uses the encodeURIComponent/unescape dance for UTF-8 safety,
 * then converts standard base64 to URL-safe variant (+/ -> -_, strip =).
 */
export function encodeEvent(payload: EventPayload): string {
  const json = JSON.stringify(payload)
  const utf8 = unescape(encodeURIComponent(json))
  // btoa is available in browsers; in Node/Nitro use Buffer fallback
  const b64 =
    typeof btoa !== 'undefined' ? btoa(utf8) : Buffer.from(utf8, 'binary').toString('base64')
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Decode a URL-safe base64 string back into an EventPayload.
 * Returns null (never throws) when the input is missing, malformed,
 * or does not match the expected shape.
 */
export function decodeEvent(raw: string | null | undefined): EventPayload | null {
  if (!raw) return null
  try {
    // Restore standard base64
    let b64 = raw.replace(/-/g, '+').replace(/_/g, '/')
    // Re-pad
    const pad = b64.length % 4
    if (pad) b64 += '='.repeat(4 - pad)

    const utf8 =
      typeof atob !== 'undefined' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary')
    const json = decodeURIComponent(escape(utf8))
    const parsed = JSON.parse(json)

    return normalizeEvent(parsed)
  } catch {
    return null
  }
}

/**
 * Validate and normalize a parsed object into an EventPayload.
 * Returns null if invalid.
 */
export function normalizeEvent(value: unknown): EventPayload | null {
  if (!value || typeof value !== 'object') return null
  const v = value as Record<string, unknown>

  const t = v.t
  const title = v.title

  if (typeof t !== 'string' || typeof title !== 'string') return null

  // t must be a valid date
  const ms = Date.parse(t)
  if (Number.isNaN(ms)) return null

  const result: EventPayload = { t, title: title.trim() }
  if (typeof v.url === 'string' && v.url.trim()) {
    result.url = v.url.trim()
  }
  return result
}
