<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { format } from 'date-fns'
import { TZDate } from '@date-fns/tz'
import { useCountdown } from '~/composables/useCountdown'
import { getLocalTimezone } from '~/composables/useTimezones'

const props = withDefaults(
  defineProps<{
    targetIso: string
    title?: string
    url?: string
    variant?: 'full' | 'embed'
  }>(),
  {
    title: '',
    url: '',
    variant: 'full',
  },
)

const countdown = useCountdown(props.targetIso)
const localTz = ref('UTC')

onMounted(() => {
  localTz.value = getLocalTimezone()
})

const targetLabel = computed(() => {
  const ms = Date.parse(props.targetIso)
  if (Number.isNaN(ms)) return ''
  try {
    return format(new TZDate(ms, localTz.value), 'MMM d, yyyy HH:mm zzz')
  } catch {
    return props.targetIso
  }
})

const units = computed(() => [
  { label: 'Days', value: countdown.value.days },
  { label: 'Hours', value: countdown.value.hours },
  { label: 'Minutes', value: countdown.value.minutes },
  { label: 'Seconds', value: countdown.value.seconds },
])
</script>

<template>
  <div :class="variant === 'embed' ? 'text-center' : 'text-center'">
    <h2 v-if="title && variant === 'full'" class="mb-2 text-3xl font-bold">
      {{ title }}
    </h2>
    <h2 v-if="title && variant === 'embed'" class="mb-1 truncate text-lg font-semibold">
      {{ title }}
    </h2>

    <ClientOnly v-if="variant === 'full'">
      <p class="mb-6 text-sm text-slate-400">
        {{ targetLabel }}
      </p>
      <template #fallback>
        <p class="mb-6 text-sm text-slate-400">&nbsp;</p>
      </template>
    </ClientOnly>

    <div
      class="flex justify-center gap-2 sm:gap-4"
      :class="variant === 'embed' ? 'text-sm' : 'text-2xl sm:text-4xl'"
    >
      <div v-for="unit in units" :key="unit.label" class="flex flex-col items-center">
        <span
          class="min-w-[3rem] rounded-lg bg-slate-800 px-2 py-1 font-mono font-bold tabular-nums sm:min-w-[5rem] sm:px-4 sm:py-3"
          :class="countdown.isPast ? 'text-slate-500' : 'text-emerald-400'"
        >
          {{ String(unit.value).padStart(2, '0') }}
        </span>
        <span class="mt-1 text-xs text-slate-500">
          {{ unit.label }}
        </span>
      </div>
    </div>

    <div v-if="countdown.isPast" class="mt-4 text-sm text-slate-400">Event has ended</div>

    <a
      v-if="url && variant === 'full'"
      :href="url"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-6 inline-block rounded-lg bg-emerald-600 px-5 py-2 font-medium text-white transition-colors hover:bg-emerald-500"
    >
      Watch stream
    </a>
  </div>
</template>
