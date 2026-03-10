<!--
  Vue Lesson 2: ref() for reactive state + v-if/v-else for conditional rendering

  - `step` is a ref that tracks which screen to show (like a state machine)
  - v-if="step === 'upload'" only renders that component when the condition is true
  - v-else-if / v-else chains work like Python's if/elif/else
  - When step.value changes, Vue automatically shows/hides the right component

  Vue Lesson 5: Async operations

  - handleAnalyze is an async function called when the user clicks "Analyze"
  - We set loading=true, call the API, store results, then set step='results'
  - The template reacts to all these ref changes automatically
-->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 py-4">
      <div class="max-w-4xl mx-auto px-6">
        <h1 class="text-2xl font-bold text-gray-800">
          FitScore<span class="text-blue-600">AI</span>
        </h1>
        <p class="text-sm text-gray-500">AI-powered resume-to-job fit analysis</p>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-4xl mx-auto px-6 py-12">
      <!-- Step 1: Upload -->
      <UploadStep
        v-if="step === 'upload'"
        @file-selected="onFileSelected"
      />

      <!-- Step 2: Job Description -->
      <JDInputStep
        v-else-if="step === 'jd'"
        @analyze="handleAnalyze"
        @back="step = 'upload'"
      />

      <!-- Loading -->
      <div v-else-if="step === 'loading'" class="text-center py-20">
        <div class="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p class="mt-4 text-gray-600 text-lg">Analyzing your resume...</p>
        <p class="text-sm text-gray-400 mt-1">This usually takes 10-15 seconds</p>
      </div>

      <!-- Error -->
      <div v-else-if="step === 'error'" class="max-w-lg mx-auto text-center py-16">
        <div class="text-5xl mb-4">&#9888;&#65039;</div>
        <h2 class="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
        <p class="text-gray-500 mb-6">{{ errorMessage }}</p>
        <button
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          @click="reset"
        >
          Try again
        </button>
      </div>

      <!-- Results -->
      <ResultsDashboard
        v-else-if="step === 'results' && result"
        :overall-score="result.overall_score"
        :metrics="result.metrics"
        @reset="reset"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AnalysisResponse } from './types'
import { analyzeResume } from './api'
import UploadStep from './components/UploadStep.vue'
import JDInputStep from './components/JDInputStep.vue'
import ResultsDashboard from './components/ResultsDashboard.vue'

// Reactive state — these drive the entire UI
type Step = 'upload' | 'jd' | 'loading' | 'results' | 'error'
const step = ref<Step>('upload')
const resumeFile = ref<File | null>(null)
const result = ref<AnalysisResponse | null>(null)
const errorMessage = ref('')

function onFileSelected(file: File) {
  resumeFile.value = file
  step.value = 'jd'
}

async function handleAnalyze(jobDescription: string) {
  if (!resumeFile.value) return

  step.value = 'loading'
  try {
    result.value = await analyzeResume(resumeFile.value, jobDescription)
    step.value = 'results'
  } catch (err: any) {
    errorMessage.value = err.response?.data?.detail || err.message || 'Failed to analyze resume'
    step.value = 'error'
  }
}

function reset() {
  step.value = 'upload'
  resumeFile.value = null
  result.value = null
  errorMessage.value = ''
}
</script>
