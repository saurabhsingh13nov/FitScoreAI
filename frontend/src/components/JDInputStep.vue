<!--
  Vue Lesson 3 continued: v-model for two-way binding

  - v-model="jdText" syncs the textarea value with the reactive variable
  - When user types, jdText updates automatically. When jdText changes, textarea updates.
  - This is like a Python property with both getter and setter.
  - :disabled binds a boolean to disable the button
-->
<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-800 mb-2 text-center">Paste the Job Description</h2>
    <p class="text-gray-500 text-center mb-6">
      Copy the full job description from the posting
    </p>

    <textarea
      v-model="jdText"
      rows="12"
      placeholder="Paste the job description here..."
      class="w-full p-4 border border-gray-300 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
    />

    <div class="flex gap-3 mt-6">
      <button
        class="px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        @click="$emit('back')"
      >
        Back
      </button>
      <button
        class="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!jdText.trim()"
        @click="$emit('analyze', jdText)"
      >
        Analyze Fit
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineEmits<{
  analyze: [jd: string]
  back: []
}>()

const jdText = ref('')
</script>
