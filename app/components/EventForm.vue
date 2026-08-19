<script setup lang="ts">
import { ref, reactive } from 'vue'
import { format } from 'date-fns'
import { TZDate } from '@date-fns/tz'
import { encodeEvent, type EventPayload } from '~/composables/useEventCodec'
import { useTimezones } from '~/composables/useTimezones'

const emit = defineEmits<{
  submit: [encoded: string, payload: EventPayload]
}>()

const { localTz, grouped } = useTimezones()

const form = reactive({
  title: '',
  date: format(new TZDate(Date.now(), localTz), 'yyyy-MM-dd'),
  time: '12:00',
  timezone: localTz,
  url: ''
})

const error = ref('')

function handleSubmit() {
  error.value = ''
  if (!form.title.trim()) {
    error.value = 'Please enter a title.'
    return
  }
  if (!form.date) {
    error.value = 'Please pick a date.'
    return
  }
  if (!form.time) {
    error.value = 'Please pick a time.'
    return
  }

  try {
    const [Y, M, D] = form.date.split('-').map(Number)
    const [h, m] = form.time.split(':').map(Number)
    const instant = new TZDate(Y, M - 1, D, h, m, form.timezone)
    const iso = instant.toISOString()

    const payload: EventPayload = {
      t: iso,
      title: form.title.trim()
    }
    if (form.url.trim()) {
      payload.url = form.url.trim()
    }

    const encoded = encodeEvent(payload)
    emit('submit', encoded, payload)
  } catch (e) {
    error.value = 'Failed to create event. Please check your inputs.'
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-5 max-w-xl mx-auto">
    <div>
      <label for="title" class="block text-sm font-medium text-slate-300 mb-1">
        Event title
      </label>
      <input
        id="title"
        v-model="form.title"
        type="text"
        placeholder="SpaceX Starship Launch"
        class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label for="date" class="block text-sm font-medium text-slate-300 mb-1">
          Date
        </label>
        <input
          id="date"
          v-model="form.date"
          type="date"
          class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label for="time" class="block text-sm font-medium text-slate-300 mb-1">
          Time
        </label>
        <input
          id="time"
          v-model="form.time"
          type="time"
          class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>
    </div>

    <div>
      <label for="tz" class="block text-sm font-medium text-slate-300 mb-1">
        Timezone
      </label>
      <select
        id="tz"
        v-model="form.timezone"
        class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      >
        <optgroup v-for="group in grouped" :key="group.region" :label="group.region">
          <option v-for="tz in group.zones" :key="tz" :value="tz">{{ tz }}</option>
        </optgroup>
      </select>
      <p class="text-xs text-slate-500 mt-1">
        Defaults to your local timezone ({{ localTz }}).
      </p>
    </div>

    <div>
      <label for="url" class="block text-sm font-medium text-slate-300 mb-1">
        Stream URL <span class="text-slate-500">(optional)</span>
      </label>
      <input
        id="url"
        v-model="form.url"
        type="url"
        placeholder="https://youtube.com/watch?v=..."
        class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
    </div>

    <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

    <button
      type="submit"
      class="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 font-semibold text-white transition-colors"
    >
      Create countdown
    </button>
  </form>
</template>
