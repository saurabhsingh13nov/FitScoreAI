<!--
  Vue Lesson 4: Component state toggle + v-for

  - ref(false) creates a reactive boolean for expand/collapse
  - @click toggles it
  - v-if shows/hides the details section
  - v-for="item in list" loops over arrays (like Python's `for item in list`)
  - :style binds a dynamic style (the score bar width)
-->
<template>
  <div
    class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md cursor-pointer"
    @click="expanded = !expanded"
  >
    <!-- Header: name + score -->
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-lg font-semibold text-gray-800">{{ metric.name }}</h3>
      <span
        class="text-2xl font-bold"
        :class="scoreColor"
      >
        {{ metric.score }}
      </span>
    </div>

    <!-- Score bar -->
    <div class="w-full bg-gray-100 rounded-full h-2 mb-3">
      <div
        class="h-2 rounded-full transition-all duration-500"
        :class="barColor"
        :style="{ width: (metric.score / 10) * 100 + '%' }"
      />
    </div>

    <!-- Summary (always visible) -->
    <p class="text-sm text-gray-600">{{ metric.summary }}</p>

    <!-- Expanded details -->
    <div v-if="expanded" class="mt-4 border-t border-gray-100 pt-4">
      <p class="text-sm text-gray-700 mb-3">{{ metric.details }}</p>

      <h4 class="text-sm font-semibold text-gray-800 mb-2">How to improve:</h4>
      <ul class="space-y-1">
        <li
          v-for="(tip, index) in metric.improvements"
          :key="index"
          class="text-sm text-gray-600 flex items-start gap-2"
        >
          <span class="text-blue-500 mt-0.5">&#8226;</span>
          {{ tip }}
        </li>
      </ul>
    </div>

    <!-- Expand hint -->
    <p v-if="!expanded" class="text-xs text-gray-400 mt-2">Click to see details</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Metric } from '../types'

// defineProps declares what data this component receives from its parent
// Think of it like function parameters
const props = defineProps<{
  metric: Metric
}>()

// Local reactive state — only this component uses it
const expanded = ref(false)

// computed() is like a Python @property — derived value that auto-updates
const scoreColor = computed(() => {
  if (props.metric.score >= 8) return 'text-green-600'
  if (props.metric.score >= 5) return 'text-yellow-600'
  return 'text-red-600'
})

const barColor = computed(() => {
  if (props.metric.score >= 8) return 'bg-green-500'
  if (props.metric.score >= 5) return 'bg-yellow-500'
  return 'bg-red-500'
})
</script>
