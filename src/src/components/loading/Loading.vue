<template>
  <div v-if="isLoading" class="loading-container">
    <div v-if="spinner" class="spinner"></div>
    <p class="loading-text">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: 'Loading...'
  },
  spinner: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.loading-container {
  text-align: center;
  padding: 2rem;
  color: #718096;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-text {
  font-style: italic;
  margin: 0;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3182ce;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
