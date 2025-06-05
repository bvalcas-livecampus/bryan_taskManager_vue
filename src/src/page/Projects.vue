<script setup>
import { ref, onMounted } from 'vue'

// This page is for managers to manage projects
const projects = ref([])

onMounted(() => {
  // TODO: Fetch projects from API
  console.log('Projects page loaded for manager')
})
</script>

<template>
  <div class="projects-container">
    <h1>Projects Management</h1>
    <p>This page is accessible only by managers.</p>
    
    <div class="projects-content">
      <h2>Your Projects</h2>
      <div class="projects-list">
        <!-- TODO: Display projects list -->
        <p>Projects will be displayed here...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.projects-container {
  padding: 2rem;
}

.projects-content {
  margin-top: 2rem;
}

.projects-list {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}
</style>
