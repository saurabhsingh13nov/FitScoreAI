<!--
  Vue Lesson 4: v-for + passing data to child components

  - v-for renders a MetricCard for each metric in the array
  - :metric="m" passes data down to the child component (like function args)
  - :key tells Vue how to track each item for efficient re-rendering
-->
<template>
  <div>
    <!-- Overall score ring -->
    <div class="flex flex-col items-center mb-10">
      <div class="relative w-40 h-40">
        <svg class="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <!-- Background circle -->
          <circle
            cx="60" cy="60" r="50"
            fill="none" stroke="#e5e7eb" stroke-width="10"
          />
          <!-- Score arc -->
          <circle
            cx="60" cy="60" r="50"
            fill="none"
            :stroke="ringColor"
            stroke-width="10"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="circumference - (overallScore / 10) * circumference"
            class="transition-all duration-1000"
          />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-4xl font-bold" :class="textColor">{{ overallScore }}</span>
          <span class="text-sm text-gray-500">out of 10</span>
        </div>
      </div>
      <h2 class="text-xl font-semibold text-gray-700 mt-4">Overall Fit Score</h2>
    </div>

    <!-- Metric cards grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MetricCard
        v-for="m in metrics"
        :key="m.name"
        :metric="m"
      />
    </div>

    <!-- Start over button -->
    <div class="flex justify-center mt-8">
      <button
        class="px-6 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        @click="$emit('reset')"
      >
        Analyze another resume
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Metric } from '../types'
import MetricCard from './MetricCard.vue'

const props = defineProps<{
  overallScore: number
  metrics: Metric[]
}>()

defineEmits<{
  reset: []
}>()

const circumference = 2 * Math.PI * 50  // r=50

const ringColor = computed(() => {
  if (props.overallScore >= 8) return '#22c55e'
  if (props.overallScore >= 5) return '#eab308'
  return '#ef4444'
})

const textColor = computed(() => {
  if (props.overallScore >= 8) return 'text-green-600'
  if (props.overallScore >= 5) return 'text-yellow-600'
  return 'text-red-600'
})
</script>
