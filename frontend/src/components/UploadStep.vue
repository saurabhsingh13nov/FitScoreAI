<!--
  Vue Lesson 3: Component events (defineEmits) + DOM event handling

  - defineEmits declares events this component can send UP to its parent
  - @dragover.prevent stops the browser from opening the file
  - @drop.prevent captures the dropped file
  - @change fires when user picks a file via the input
  - $emit('file-selected', file) sends the file to the parent component

  Think of props as function PARAMETERS (data flows DOWN)
  Think of emits as RETURN values (data flows UP)
-->
<template>
  <div class="max-w-lg mx-auto">
    <h2 class="text-2xl font-bold text-gray-800 mb-2 text-center">Upload Your Resume</h2>
    <p class="text-gray-500 text-center mb-6">Drop a PDF file or click to browse</p>

    <div
      class="border-2 border-dashed rounded-xl p-12 text-center transition-colors"
      :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
      @click="fileInput?.click()"
    >
      <div v-if="!selectedFile" class="space-y-3">
        <div class="text-5xl text-gray-300">&#128196;</div>
        <p class="text-gray-500">Drag & drop your PDF here</p>
        <p class="text-sm text-gray-400">or click to browse</p>
      </div>

      <div v-else class="space-y-2">
        <div class="text-4xl">&#9989;</div>
        <p class="text-gray-700 font-medium">{{ selectedFile.name }}</p>
        <p class="text-sm text-gray-400">{{ (selectedFile.size / 1024).toFixed(0) }} KB</p>
      </div>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept=".pdf"
      class="hidden"
      @change="onFileSelect"
    />

    <!-- Next button -->
    <button
      v-if="selectedFile"
      class="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      @click="$emit('file-selected', selectedFile)"
    >
      Continue
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineEmits<{
  'file-selected': [file: File]
}>()

// ref() for DOM element reference — lets us programmatically click the hidden input
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file && file.type === 'application/pdf') {
    selectedFile.value = file
  }
}

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    selectedFile.value = input.files[0]
  }
}
</script>
