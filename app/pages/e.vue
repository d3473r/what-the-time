<script setup lang="ts">
import { computed } from 'vue'
import { decodeEvent } from '~/composables/useEventCodec'

const route = useRoute()
const event = computed(() => decodeEvent(route.query.d as string))

useSeoMeta(() => ({
  title: event.value ? event.value.title : 'Event not found',
  description: event.value
    ? `Countdown to ${event.value.title}`
    : 'Invalid event link'
}))
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4">
    <template v-if="event">
      <div class="w-full max-w-2xl">
        <CountdownDisplay
          :target-iso="event.t"
          :title="event.title"
          :url="event.url"
          variant="full"
        />
      </div>
      <NuxtLink
        to="/"
        class="mt-10 text-slate-500 hover:text-slate-300 text-sm transition-colors"
      >
        Create your own countdown
      </NuxtLink>
    </template>

    <template v-else>
      <div class="text-center max-w-md">
        <h1 class="text-3xl font-bold text-slate-200 mb-2">Invalid event link</h1>
        <p class="text-slate-400 mb-6">
          This link doesn't contain a valid countdown. The link may be broken or incomplete.
        </p>
        <NuxtLink
          to="/"
          class="inline-block px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
        >
          Create a countdown
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
