<template>
  <div class="form-group">
    <label v-if="label" :for="inputId" class="form-label">{{ label }}</label>
    <slot></slot>
    <div v-if="error" class="form-error">{{ error }}</div>
    <div v-if="help" class="form-help">{{ help }}</div>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: ''
  },
  inputId: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  help: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2d3748;
  font-weight: 500;
}

.form-error {
  margin-top: 0.25rem;
  color: #e53e3e;
  font-size: 0.875rem;
}

.form-help {
  margin-top: 0.25rem;
  color: #718096;
  font-size: 0.875rem;
}
</style>
