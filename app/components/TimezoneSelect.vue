<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useTimezones } from '~/composables/useTimezones'

const props = withDefaults(
  defineProps<{
    modelValue?: string
  }>(),
  {
    modelValue: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { all } = useTimezones()

const query = ref(props.modelValue || '')
const isOpen = ref(false)
const highlightedIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLDivElement | null>(null)

const timezonesWithMeta = computed(() =>
  all.map((tz) => ({ tz, offset: getOffset(tz), abbr: getAbbr(tz) })),
)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return timezonesWithMeta.value.slice(0, 50)
  return timezonesWithMeta.value
    .filter(
      (t) =>
        t.tz.toLowerCase().includes(q) ||
        t.offset.toLowerCase().includes(q) ||
        t.abbr.toLowerCase().includes(q),
    )
    .slice(0, 50)
})

function getOffset(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'longOffset',
    }).formatToParts(new Date())
    const val = parts.find((p) => p.type === 'timeZoneName')?.value || 'UTC'
    return val.replace('GMT', 'UTC')
  } catch {
    return 'UTC'
  }
}

function getAbbr(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      timeZoneName: 'short',
    }).formatToParts(new Date())
    const short = parts.find((p) => p.type === 'timeZoneName')?.value || ''

    if (short && !/^GMT/i.test(short)) return short

    const longParts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      timeZoneName: 'long',
    }).formatToParts(new Date())
    const long = longParts.find((p) => p.type === 'timeZoneName')?.value || ''

    if (/^GMT/i.test(long)) return ''

    const words = long.split(' ')
    if (words.length <= 1) return long
    return words.map((w) => w[0]).join('').toUpperCase()
  } catch {
    return ''
  }
}

function highlightMatch(tz: string): string {
  const q = query.value.trim()
  if (!q) return tz
  const idx = tz.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return tz
  return (
    tz.slice(0, idx) +
    `<mark class="bg-transparent text-emerald-400">${tz.slice(idx, idx + q.length)}</mark>` +
    tz.slice(idx + q.length)
  )
}

function select(tz: string) {
  query.value = tz
  emit('update:modelValue', tz)
  isOpen.value = false
  highlightedIndex.value = 0
}

function onInput() {
  isOpen.value = true
  highlightedIndex.value = 0
  emit('update:modelValue', query.value)
}

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value && (e.key === 'ArrowDown' || e.key === 'Enter')) {
    isOpen.value = true
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    highlightedIndex.value = Math.min(highlightedIndex.value + 1, filtered.value.length - 1)
    scrollToHighlighted()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
    scrollToHighlighted()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (filtered.value[highlightedIndex.value]) {
      select(filtered.value[highlightedIndex.value]!.tz)
    }
  } else if (e.key === 'Escape') {
    isOpen.value = false
    query.value = props.modelValue
  }
}

function scrollToHighlighted() {
  nextTick(() => {
    const list = listRef.value
    if (!list) return
    const el = list.children[highlightedIndex.value] as HTMLElement | undefined
    if (el) el.scrollIntoView({ block: 'nearest' })
  })
}

function onFocus() {
  isOpen.value = true
  inputRef.value?.select()
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node
  const root = inputRef.value?.closest('.tz-select-root')
  if (root && !root.contains(target)) {
    isOpen.value = false
    query.value = props.modelValue
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(
  () => props.modelValue,
  (val) => {
    if (val !== query.value) query.value = val
  },
)
</script>

<template>
  <div class="tz-select-root relative">
    <input
      ref="inputRef"
      v-model="query"
      type="text"
      autocomplete="off"
      placeholder="Search timezone…"
      class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      @input="onInput"
      @keydown="onKeydown"
      @focus="onFocus"
    />

    <div
      v-if="isOpen"
      ref="listRef"
      class="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-700 bg-slate-800 shadow-lg"
    >
      <div
        v-if="filtered.length === 0"
        class="px-3 py-2 text-sm text-slate-500"
      >
        No matching timezone found
      </div>
      <button
        v-for="(item, i) in filtered"
        :key="item.tz"
        type="button"
        class="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors"
        :class="i === highlightedIndex ? 'bg-slate-700 text-emerald-400' : 'text-slate-300 hover:bg-slate-700/50'"
        @click="select(item.tz)"
        @mouseenter="highlightedIndex = i"
      >
        <!-- eslint-disable-next-line vue/no-v-html -- highlight is static safe markup -->
        <span v-html="highlightMatch(item.tz)" />
        <span class="shrink-0 text-xs text-slate-500">
          {{ item.abbr ? `${item.abbr} · ` : '' }}{{ item.offset }}
        </span>
      </button>
    </div>
  </div>
</template>
