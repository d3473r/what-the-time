import { computed } from 'vue'

/** Get the viewer's local IANA timezone, falling back to UTC. */
export function getLocalTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return tz || 'UTC'
  } catch {
    return 'UTC'
  }
}

/** All IANA timezones supported by the runtime. */
export function getAllTimezones(): string[] {
  try {
    const supported = (Intl as any).supportedValuesOf?.('timeZone')
    if (Array.isArray(supported) && supported.length > 0) return supported
  } catch {
    // fallthrough
  }
  return ['UTC']
}

/** Timezone options grouped by region for a <select>. */
export function useTimezones() {
  const localTz = getLocalTimezone()
  const all = getAllTimezones()

  const grouped = computed(() => {
    const map = new Map<string, string[]>()
    for (const tz of all) {
      const region = tz.includes('/') ? tz.split('/')[0]! : 'UTC'
      if (!map.has(region)) map.set(region, [])
      map.get(region)!.push(tz)
    }
    return Array.from(map.entries()).map(([region, zones]) => ({ region, zones }))
  })

  return { localTz, all, grouped }
}
