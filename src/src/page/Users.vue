<script setup>
import { ref, onMounted } from 'vue'
import { fetchUsers, updateUser, createUser, deleteUser } from '../../api/users.js'
import { getUser } from '../../db/user.js'

// Import components
import Modal from '../components/modal/Modal.vue'
import Alert from '../components/alert/Alert.vue'
import FormGroup from '../components/form/FormGroup.vue'
import Button from '../components/button/button.vue'
import Input from '../components/input/input.vue'

// Reactive data
const users = ref([])
const currentUser = ref(null)
const loading = ref(false)
const error = ref('')
const successMessage = ref('')
const editingUser = ref(null)

// Create user form
const showCreateForm = ref(false)
const creatingUser = ref(false)
const newUser = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  type: 'dev'
})

// User types available for selection
const userTypes = ['dev', 'manager', 'admin']

onMounted(async () => {
  try {
    currentUser.value = getUser()
    await loadUsers()
  } catch (err) {
    error.value = 'Failed to load users'
    console.error('Error loading users:', err)
  }
})

// Load all users
const loadUsers = async () => {
  try {
    loading.value = true
    error.value = ''
    users.value = await fetchUsers()
  } catch (err) {
    error.value = 'Failed to fetch users'
    console.error('Error fetching users:', err)
  } finally {
    loading.value = false
  }
}

// Start editing a user's type
const startEditingUser = (user) => {
  editingUser.value = { ...user }
}

// Cancel editing
const cancelEditing = () => {
  editingUser.value = null
}

// Save user type changes
const saveUserType = async () => {
  try {
    loading.value = true
    error.value = ''
    successMessage.value = ''
    
    await updateUser(editingUser.value.id, { type: editingUser.value.type })
    
    // Update the user in the local array
    const userIndex = users.value.findIndex(u => u.id === editingUser.value.id)
    if (userIndex !== -1) {
      users.value[userIndex].type = editingUser.value.type
    }
    
    successMessage.value = `User type updated successfully for ${editingUser.value.first_name} ${editingUser.value.last_name}`
    editingUser.value = null
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    
  } catch (err) {
    error.value = 'Failed to update user type'
    console.error('Error updating user:', err)
  } finally {
    loading.value = false
  }
}

// Get badge color based on user type
const getUserTypeBadgeClass = (type) => {
  switch (type) {
    case 'admin':
      return 'badge-admin'
    case 'manager':
      return 'badge-manager'
    case 'dev':
      return 'badge-dev'
    default:
      return 'badge-default'
  }
}

// Check if current user can edit a specific user
const canEditUser = (user) => {
  // Admins can edit anyone except themselves
  return currentUser.value?.type === 'admin' && user.id !== currentUser.value?.id
}

// Open create user form
const openCreateForm = () => {
  newUser.value = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    type: 'dev'
  }
  showCreateForm.value = true
  error.value = ''
}

// Close create user form
const closeCreateForm = () => {
  showCreateForm.value = false
  newUser.value = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    type: 'dev'
  }
  error.value = ''
}

// Create new user
const handleCreateUser = async () => {
  try {
    // Validation
    if (!newUser.value.first_name.trim()) {
      error.value = 'First name is required'
      return
    }
    
    if (!newUser.value.last_name.trim()) {
      error.value = 'Last name is required'
      return
    }
    
    if (!newUser.value.email.trim()) {
      error.value = 'Email is required'
      return
    }
    
    if (!newUser.value.password.trim()) {
      error.value = 'Password is required'
      return
    }
    
    if (newUser.value.password.length < 6) {
      error.value = 'Password must be at least 6 characters long'
      return
    }
    
    // Check if email already exists
    const existingUser = users.value.find(u => u.email.toLowerCase() === newUser.value.email.toLowerCase())
    if (existingUser) {
      error.value = 'A user with this email already exists'
      return
    }
    
    creatingUser.value = true
    error.value = ''
    
    const userData = {
      first_name: newUser.value.first_name.trim(),
      last_name: newUser.value.last_name.trim(),
      email: newUser.value.email.trim(),
      password: newUser.value.password,
      type: newUser.value.type
    }
    
    const createdUser = await createUser(userData)
    
    // Reload users list to get fresh data from server
    await loadUsers()
    
    successMessage.value = `User "${userData.first_name} ${userData.last_name}" created successfully!`
    closeCreateForm()
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    
  } catch (err) {
    console.error('Error creating user:', err)
    error.value = 'Failed to create user. Please try again.'
  } finally {
    creatingUser.value = false
  }
}

// Delete user
const handleDeleteUser = async (user) => {
  // Create a detailed confirmation message
  let confirmMessage = `Are you sure you want to delete user "${user.first_name} ${user.last_name}"?\n\n`
  
  // Add warnings based on user type
  if (user.type === 'manager') {
    confirmMessage += "⚠️ WARNING: This manager may be assigned to teams and will need to be replaced.\n"
  } else if (user.type === 'dev') {
    confirmMessage += "⚠️ WARNING: This developer may be assigned to tasks and teams.\n"
  }
  
  confirmMessage += "\nThis action cannot be undone and may affect related data."

  // Confirm deletion
  if (!confirm(confirmMessage)) {
    return
  }

  try {
    loading.value = true
    error.value = ''
    successMessage.value = ''
    
    await deleteUser(user.id)
    
    // Remove the user from the local array
    users.value = users.value.filter(u => u.id !== user.id)
    
    successMessage.value = `User "${user.first_name} ${user.last_name}" deleted successfully!`
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    
  } catch (err) {
    console.error('Error deleting user:', err)
    error.value = 'Failed to delete user. Please try again.'
  } finally {
    loading.value = false
  }
}

// Check if current user can delete a specific user
const canDeleteUser = (user) => {
  // Only admins can delete users, and they cannot delete themselves
  return currentUser.value?.type === 'admin' && user.id !== currentUser.value?.id
}
</script>

<template>
  <div class="users-container">
    <div class="users-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Users Management</h1>
          <p class="subtitle">Manage system users and their roles</p>
        </div>
        <div class="header-actions">
          <Button 
            v-if="currentUser?.type === 'admin'" 
            @click="openCreateForm"
            variant="primary"
            label="+ Create New User"
          />
        </div>
      </div>
    </div>
    
    <!-- Error Message -->
    <div v-if="error" class="alert alert-error">
      {{ error }}
    </div>
    
    <!-- Success Message -->
    <div v-if="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>
    
    <div class="users-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading">
        Loading users...
      </div>
      
      <!-- No Users -->
      <div v-else-if="users.length === 0" class="no-users">
        <p>No users found.</p>
      </div>
      
      <!-- Users Table -->
      <div v-else class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>User Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="user-row">
              <td class="user-id">#{{ user.id }}</td>
              <td class="user-name">
                {{ user.first_name }} {{ user.last_name }}
              </td>
              <td class="user-email">{{ user.email }}</td>
              <td class="user-type">
                <!-- Show type selector if editing this user -->
                <div v-if="editingUser && editingUser.id === user.id" class="type-edit">
                  <select v-model="editingUser.type" class="type-select">
                    <option v-for="type in userTypes" :key="type" :value="type">
                      {{ type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown' }}
                    </option>
                  </select>
                </div>
                <!-- Show type badge if not editing -->
                <div v-else class="type-badge-container">
                  <span :class="['type-badge', getUserTypeBadgeClass(user.type)]">
                    {{ user.type ? user.type.charAt(0).toUpperCase() + user.type.slice(1) : 'Unknown' }}
                  </span>
                </div>
              </td>
              <td class="user-actions">
                <!-- Edit mode buttons -->
                <div v-if="editingUser && editingUser.id === user.id" class="edit-actions">
                  <button 
                    @click="saveUserType" 
                    class="btn btn-save"
                    :disabled="loading"
                  >
                    Save
                  </button>
                  <button 
                    @click="cancelEditing" 
                    class="btn btn-cancel"
                    :disabled="loading"
                  >
                    Cancel
                  </button>
                </div>
                <!-- Normal mode buttons -->
                <div v-else class="normal-actions">
                  <button 
                    v-if="canEditUser(user)"
                    @click="startEditingUser(user)" 
                    class="btn btn-edit"
                    :disabled="loading"
                  >
                    Edit Type
                  </button>
                  <button 
                    v-if="canDeleteUser(user)"
                    @click="handleDeleteUser(user)" 
                    class="btn btn-delete"
                    :disabled="loading"
                  >
                    Delete
                  </button>
                  <span v-if="!canEditUser(user) && !canDeleteUser(user)" class="no-edit">
                    {{ user.id === currentUser?.id ? '(Current User)' : '—' }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Users Summary -->
      <div class="users-summary">
        <h3>Users Summary</h3>
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-label">Total Users:</span>
            <span class="stat-value">{{ users.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Admins:</span>
            <span class="stat-value">{{ users.filter(u => u.type === 'admin').length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Managers:</span>
            <span class="stat-value">{{ users.filter(u => u.type === 'manager').length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Developers:</span>
            <span class="stat-value">{{ users.filter(u => u.type === 'dev').length }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create User Modal -->
    <Modal 
      :is-visible="showCreateForm" 
      title="Create New User"
      @close="closeCreateForm"
    >
      <Alert :message="error" type="error" />
      
      <FormGroup label="First Name" input-id="firstName">
        <Input
          id="firstName"
          name="firstName"
          :value="newUser.first_name"
          @update="newUser.first_name = $event"
          placeholder="Enter first name"
        />
      </FormGroup>
      
      <FormGroup label="Last Name" input-id="lastName">
        <Input
          id="lastName"
          name="lastName"
          :value="newUser.last_name"
          @update="newUser.last_name = $event"
          placeholder="Enter last name"
        />
      </FormGroup>
      
      <FormGroup label="Email Address" input-id="email">
        <Input
          id="email"
          name="email"
          type="email"
          :value="newUser.email"
          @update="newUser.email = $event"
          placeholder="Enter email address"
        />
      </FormGroup>
      
      <FormGroup label="Password" input-id="password">
        <Input
          id="password"
          name="password"
          type="password"
          :value="newUser.password"
          @update="newUser.password = $event"
          placeholder="Enter password (min. 6 characters)"
        />
      </FormGroup>
      
      <FormGroup label="User Type" input-id="userType">
        <select 
          v-model="newUser.type" 
          id="userType" 
          class="form-control"
        >
          <option v-for="type in userTypes" :key="type" :value="type">
            {{ type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown' }}
          </option>
        </select>
      </FormGroup>
      
      <template #footer>
        <Button 
          @click="handleCreateUser" 
          variant="success"
          label="Create User"
          :loading="creatingUser"
        />
        <Button 
          @click="closeCreateForm" 
          variant="secondary"
          label="Cancel"
        />
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.users-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.users-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.header-text h1 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 2rem;
  font-weight: 700;
}

.subtitle {
  color: #666;
  margin: 0;
}

/* Alert Messages */
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
  color: #22543d;
  border: 1px solid #c6f6d5;
}

/* Loading & Empty States */
.loading {
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-style: italic;
}

.no-users {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.no-users p {
  font-size: 1.1rem;
  margin: 0;
}

/* Users Table */
.users-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: #f7fafc;
}

.users-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2d3748;
  border-bottom: 1px solid #e2e8f0;
}

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}

.user-row:hover {
  background-color: #f7fafc;
}

.user-id {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.9rem;
}

.user-name {
  font-weight: 600;
  color: #2d3748;
}

.user-email {
  color: #4a5568;
  font-size: 0.9rem;
}

/* User Type Badges */
.type-badge-container {
  display: flex;
  align-items: center;
}

.type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-admin {
  background: #fed7d7;
  color: #c53030;
}

.badge-manager {
  background: #bee3f8;
  color: #2b6cb0;
}

.badge-dev {
  background: #c6f6d5;
  color: #22543d;
}

.badge-default {
  background: #e2e8f0;
  color: #4a5568;
}

/* Type Edit */
.type-edit {
  display: flex;
  align-items: center;
}

.type-select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.875rem;
  background: white;
  min-width: 120px;
}

.type-select:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

/* Action Buttons */
.user-actions {
  width: 180px;
  text-align: center;
}

.edit-actions,
.normal-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  min-width: 60px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-edit {
  background: #3182ce;
  color: white;
}

.btn-edit:hover:not(:disabled) {
  background: #2c5aa0;
}

.btn-save {
  background: #38a169;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #2f855a;
}

.btn-cancel {
  background: #e53e3e;
  color: white;
}

.btn-cancel:hover:not(:disabled) {
  background: #c53030;
}

.btn-delete {
  background: #e53e3e;
  color: white;
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-delete:hover:not(:disabled) {
  background: #c53030;
}

.no-edit {
  font-size: 0.75rem;
  color: #a0aec0;
  font-style: italic;
}

/* Users Summary */
.users-summary {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.users-summary h3 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.125rem;
  font-weight: 600;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stat-label {
  font-size: 0.875rem;
  color: #4a5568;
  font-weight: 500;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
}

/* Form Controls */
.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #2d3748;
}

.form-control:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .users-container {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-text h1 {
    font-size: 1.75rem;
  }
  
  .users-table-container {
    overflow-x: auto;
  }
  
  .users-table {
    min-width: 600px;
  }
  
  .users-table th,
  .users-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
  
  .edit-actions {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.625rem;
  }
}
</style>
