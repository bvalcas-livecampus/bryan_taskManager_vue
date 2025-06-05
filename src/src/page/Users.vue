<script setup>
import { ref, onMounted } from 'vue'

// This page is for admins to manage users
const users = ref([])

onMounted(() => {
  // TODO: Fetch users from API
  console.log('Users page loaded for admin')
})
</script>

<template>
  <div class="users-container">
    <h1>Users Management</h1>
    <p>This page is accessible only by admins.</p>
    
    <div class="users-content">
      <h2>System Users</h2>
      <div class="users-list">
        <!-- TODO: Display users management interface -->
        <p>Users management interface will be displayed here...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.users-container {
  padding: 2rem;
}

.users-content {
  margin-top: 2rem;
}

.users-list {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}
</style>
