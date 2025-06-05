<script setup>
import { ref, onMounted } from 'vue'

// This page is for admins to manage teams
const teams = ref([])

onMounted(() => {
  // TODO: Fetch teams from API
  console.log('Teams page loaded for admin')
})
</script>

<template>
  <div class="teams-container">
    <h1>Teams Management</h1>
    <p>This page is accessible only by admins.</p>
    
    <div class="teams-content">
      <h2>System Teams</h2>
      <div class="teams-list">
        <!-- TODO: Display teams management interface -->
        <p>Teams management interface will be displayed here...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.teams-container {
  padding: 2rem;
}

.teams-content {
  margin-top: 2rem;
}

.teams-list {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}
</style>
