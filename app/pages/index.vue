<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EventPayload } from '~/composables/useEventCodec'

const result = ref<{ encoded: string; payload: EventPayload } | null>(null)

const origin = import.meta.client ? window.location.origin : ''

const shareLink = computed(() =>
  result.value ? `${origin}/e?d=${result.value.encoded}` : ''
)

const embedSnippet = computed(() =>
  result.value
    ? `<script src="${origin}/widget.js"></` + `script>\n<countdown-widget d="${result.value.encoded}"></countdown-widget>`
    : ''
)

function handleSubmit(encoded: string, payload: EventPayload) {
  result.value = { encoded, payload }
  if (import.meta.client) {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }
}

function reset() {
  result.value = null
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="py-8 text-center">
      <h1 class="text-4xl font-bold text-emerald-400">what-the-time-ai</h1>
      <p class="text-slate-400 mt-2">
        Create a shareable countdown. No backend — all data lives in the link.
      </p>
    </header>

    <main class="flex-1 px-4 pb-16">
      <div v-if="!result">
        <EventForm @submit="handleSubmit" />
      </div>

      <div v-else class="max-w-xl mx-auto space-y-8">
        <div class="text-center">
          <h2 class="text-2xl font-bold mb-1">Countdown ready!</h2>
          <p class="text-slate-400 text-sm">Share the link or embed the widget.</p>
        </div>

        <div class="rounded-xl bg-slate-900 border border-slate-800 p-5">
          <h3 class="text-sm font-medium text-slate-300 mb-2">Share link</h3>
          <div class="flex items-center gap-2">
            <input
              :value="shareLink"
              readonly
              class="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-300 font-mono"
              @focus="$event.target.select()"
            >
            <CopyButton :text="shareLink" />
          </div>
        </div>

        <div class="rounded-xl bg-slate-900 border border-slate-800 p-5">
          <h3 class="text-sm font-medium text-slate-300 mb-2">Embed code</h3>
          <div class="flex items-start gap-2">
            <textarea
              :value="embedSnippet"
              readonly
              rows="3"
              class="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-300 font-mono resize-none"
              @focus="$event.target.select()"
            />
            <CopyButton :text="embedSnippet" />
          </div>
        </div>

        <div class="rounded-xl bg-slate-900 border border-slate-800 p-6">
          <h3 class="text-sm font-medium text-slate-300 mb-4 text-center">Live preview</h3>
          <CountdownDisplay
            :target-iso="result.payload.t"
            :title="result.payload.title"
            :url="result.payload.url"
            variant="full"
          />
        </div>

        <div class="text-center">
          <button
            class="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-colors"
            @click="reset"
          >
            Create another
          </button>
        </div>
      </div>
    </main>

    <footer class="py-4 text-center text-slate-600 text-sm">
      Frontend-only &middot; Data encoded in the URL
    </footer>
  </div>
</template>
