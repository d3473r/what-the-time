import { ref, onScopeDispose, computed } from 'vue'

export interface CountdownState {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
  isPast: boolean
}

function computeState(targetMs: number, nowMs: number): CountdownState {
  let diff = Math.floor((targetMs - nowMs) / 1000)
  const isPast = diff <= 0
  diff = Math.max(diff, 0)
  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const seconds = diff % 60
  return { days, hours, minutes, seconds, totalSeconds: diff, isPast }
}

/**
 * Reactive countdown to a target ISO timestamp.
 * SSR-safe: computes once on the server, ticks every second on the client.
 */
export function useCountdown(targetIso: string) {
  const targetMs = Date.parse(targetIso)
  const now = ref(Date.now())

  const state = computed<CountdownState>(() => {
    if (Number.isNaN(targetMs)) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isPast: true }
    }
    return computeState(targetMs, now.value)
  })

  if (import.meta.client) {
    let timer: ReturnType<typeof setInterval> | null = null
    const start = () => {
      timer = setInterval(() => {
        now.value = Date.now()
      }, 1000)
    }
    start()
    onScopeDispose(() => {
      if (timer) clearInterval(timer)
    })
  }

  return state
}
