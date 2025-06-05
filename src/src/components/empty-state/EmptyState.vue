<template>
  <div class="empty-state">
    <div v-if="icon" class="empty-icon">{{ icon }}</div>
    <h3 v-if="title" class="empty-title">{{ title }}</h3>
    <p class="empty-message">{{ message }}</p>
    <div v-if="$slots.action" class="empty-action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #4a5568;
  margin: 0 0 0.5rem 0;
}

.empty-message {
  font-size: 1.1rem;
  margin: 0 0 1.5rem 0;
}

.empty-action {
  margin-top: 1rem;
}
</style>
