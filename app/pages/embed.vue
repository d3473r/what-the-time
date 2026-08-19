<script setup lang="ts">
import { computed } from 'vue'
import { decodeEvent } from '~/composables/useEventCodec'

const route = useRoute()
const event = computed(() => decodeEvent(route.query.d as string))

useSeoMeta(() => ({
  title: event.value ? event.value.title : 'Event'
}))
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-slate-950">
    <template v-if="event">
      <CountdownDisplay
        :target-iso="event.t"
        :title="event.title"
        :url="event.url"
        variant="embed"
      />
    </template>

    <template v-else>
      <p class="text-slate-500 text-sm">Invalid event link</p>
    </template>
  </div>
</template>
