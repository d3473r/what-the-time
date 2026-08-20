<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EventPayload } from '~/composables/useEventCodec'

const result = ref<{ encoded: string; payload: EventPayload } | null>(null)

const origin = import.meta.client ? window.location.origin : ''
const base = import.meta.env.BASE_URL || '/'

const shareLink = computed(() => (result.value ? `${origin}${base}e?d=${result.value.encoded}` : ''))

const embedSnippet = computed(() =>
  result.value
    ? `<script src="${origin}${base}widget.js"></` +
      `script>\n<countdown-widget d="${result.value.encoded}"></countdown-widget>`
    : '',
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
  <div class="flex min-h-screen flex-col">
    <header class="py-8 text-center">
      <h1 class="text-4xl font-bold text-emerald-400">what-the-time</h1>
      <p class="mt-2 text-slate-400">
        Create a shareable countdown. No backend — all data lives in the link.
      </p>
    </header>

    <main class="flex-1 px-4 pb-16">
      <div v-if="!result">
        <EventForm @submit="handleSubmit" />
      </div>

      <div v-else class="mx-auto max-w-xl space-y-8">
        <div class="text-center">
          <h2 class="mb-1 text-2xl font-bold">Countdown ready!</h2>
          <p class="text-sm text-slate-400">Share the link or embed the widget.</p>
        </div>

        <div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h3 class="mb-2 text-sm font-medium text-slate-300">Share link</h3>
          <div class="flex items-center gap-2">
            <input
              :value="shareLink"
              readonly
              class="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-sm text-slate-300"
              @focus="($event.target as HTMLInputElement).select()"
            />
            <CopyButton :text="shareLink" />
          </div>
        </div>

        <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 class="mb-4 text-center text-sm font-medium text-slate-300">QR code</h3>
          <ClientOnly>
            <QrCode :value="shareLink" />
            <template #fallback>
              <div class="flex justify-center">
                <div class="h-[224px] w-[224px] animate-pulse rounded-lg bg-slate-800" />
              </div>
            </template>
          </ClientOnly>
        </div>

        <div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h3 class="mb-2 text-sm font-medium text-slate-300">Embed code</h3>
          <div class="flex items-start gap-2">
            <textarea
              :value="embedSnippet"
              readonly
              rows="3"
              class="flex-1 resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-sm text-slate-300"
              @focus="($event.target as HTMLTextAreaElement).select()"
            />
            <CopyButton :text="embedSnippet" />
          </div>
        </div>

        <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 class="mb-4 text-center text-sm font-medium text-slate-300">Live preview</h3>
          <CountdownDisplay
            :target-iso="result.payload.t"
            :title="result.payload.title"
            :url="result.payload.url"
            variant="full"
          />
        </div>

        <div class="text-center">
          <button
            class="rounded-lg bg-slate-700 px-4 py-2 font-medium text-slate-200 transition-colors hover:bg-slate-600"
            @click="reset"
          >
            Create another
          </button>
        </div>
      </div>
    </main>

    <footer class="py-4 text-center text-sm text-slate-600">
      Frontend-only &middot; Data encoded in the URL
    </footer>
  </div>
</template>
