<template>
  <div v-if="message" :class="['alert', alertClass]">
    {{ message }}
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  }
})

const alertClass = computed(() => {
  return `alert-${props.type}`
})
</script>

<style scoped>
.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-weight: 500;
}

.alert-error {
  background-color: #fee;
  color: #c53030;
  border: 1px solid #fed7d7;
}

.alert-success {
  background-color: #f0fff4;
  color: #2f855a;
  border: 1px solid #c6f6d5;
}

.alert-warning {
  background-color: #fffbeb;
  color: #d69e2e;
  border: 1px solid #fbd38d;
}

.alert-info {
  background-color: #ebf8ff;
  color: #2b6cb0;
  border: 1px solid #bee3f8;
}
</style>
