<script setup lang="ts">
import { computed } from 'vue'
import { decodeEvent } from '~/composables/useEventCodec'

const route = useRoute()
const event = computed(() => decodeEvent(route.query.d as string))

useSeoMeta(() => ({
  title: event.value ? event.value.title : 'Event not found',
  description: event.value ? `Countdown to ${event.value.title}` : 'Invalid event link',
}))
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center px-4">
    <template v-if="event">
      <div class="w-full max-w-2xl">
        <CountdownDisplay
          :target-iso="event.t"
          :title="event.title"
          :url="event.url"
          variant="full"
        />
      </div>
      <NuxtLink to="/" class="mt-10 text-sm text-slate-500 transition-colors hover:text-slate-300">
        Create your own countdown
      </NuxtLink>
    </template>

    <template v-else>
      <div class="max-w-md text-center">
        <h1 class="mb-2 text-3xl font-bold text-slate-200">Invalid event link</h1>
        <p class="mb-6 text-slate-400">
          This link doesn't contain a valid countdown. The link may be broken or incomplete.
        </p>
        <NuxtLink
          to="/"
          class="inline-block rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-emerald-500"
        >
          Create a countdown
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
