<script setup>
import { ref, onMounted, computed } from 'vue'
import { fetchTeams, fetchTeamsByManager, createTeam } from '../../api/teams.js'
import { fetchProjects } from '../../api/projects.js'
import { fetchUsers } from '../../api/users.js'
import { getUser } from '../../db/user.js'

// Reactive data
const teams = ref([])
const projects = ref([])
const users = ref([])
const currentUser = ref(null)
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

// Team creation form
const showCreateForm = ref(false)
const creatingTeam = ref(false)
const newTeam = ref({
  name: '',
  managerID: null,
  members: []
})

onMounted(async () => {
  try {
    currentUser.value = getUser()
    loading.value = true
    
    if (currentUser.value?.type === 'admin') {
      await loadAllTeams()
    } else if (currentUser.value?.type === 'manager') {
      await loadManagerTeams()
    }
    
    await loadProjects()
    await loadUsers()
  } catch (err) {
    error.value = 'Failed to load teams data'
    console.error('Error loading teams:', err)
  } finally {
    loading.value = false
  }
})

// Load all teams (for admins)
const loadAllTeams = async () => {
  teams.value = await fetchTeams()
}

// Load teams managed by current manager
const loadManagerTeams = async () => {
  if (currentUser.value?.id) {
    teams.value = await fetchTeamsByManager(currentUser.value.id)
  }
}

// Load all projects
const loadProjects = async () => {
  projects.value = await fetchProjects()
}

// Get projects assigned to a specific team
const getTeamProjects = (teamId) => {
  return projects.value.filter(project => project.team_id === teamId)
}

// Get page title based on user type
const getPageTitle = () => {
  if (currentUser.value?.type === 'admin') {
    return 'Teams Management'
  } else if (currentUser.value?.type === 'manager') {
    return 'My Teams & Projects'
  }
  return 'Teams'
}

// Get page subtitle based on user type
const getPageSubtitle = () => {
  if (currentUser.value?.type === 'admin') {
    return 'Manage all system teams'
  } else if (currentUser.value?.type === 'manager') {
    return 'View your teams and their assigned projects'
  }
  return 'Teams information'
}

// Get users already assigned to teams
const getAssignedUserIds = () => {
  const assignedIds = new Set()
  
  teams.value.forEach(team => {
    // Add manager
    if (team.managerID) {
      assignedIds.add(team.managerID)
    }
    // Add members
    team.members.forEach(memberId => {
      assignedIds.add(memberId)
    })
  })
  
  return assignedIds
}

// Get available managers (not already managing a team)
const availableManagers = computed(() => {
  const assignedIds = getAssignedUserIds()
  return users.value.filter(user => 
    user.type === 'manager' && !assignedIds.has(user.id)
  )
})

// Get available developers (not already in a team)
const availableDevelopers = computed(() => {
  const assignedIds = getAssignedUserIds()
  return users.value.filter(user => 
    user.type === 'dev' && !assignedIds.has(user.id)
  )
})

// Load all users
const loadUsers = async () => {
  users.value = await fetchUsers()
}

// Open create team form
const openCreateForm = () => {
  newTeam.value = {
    name: '',
    managerID: null,
    members: []
  }
  showCreateForm.value = true
}

// Close create team form
const closeCreateForm = () => {
  showCreateForm.value = false
  newTeam.value = {
    name: '',
    managerID: null,
    members: []
  }
  error.value = ''
}

// Toggle developer selection
const toggleDeveloper = (developerId) => {
  const index = newTeam.value.members.indexOf(developerId)
  if (index > -1) {
    newTeam.value.members.splice(index, 1)
  } else {
    newTeam.value.members.push(developerId)
  }
}

// Check if developer is selected
const isDeveloperSelected = (developerId) => {
  return newTeam.value.members.includes(developerId)
}

// Create new team
const createNewTeam = async () => {
  try {
    // Validation
    if (!newTeam.value.name.trim()) {
      error.value = 'Team name is required'
      return
    }
    
    if (!newTeam.value.managerID) {
      error.value = 'Please select a manager'
      return
    }
    
    if (newTeam.value.members.length === 0) {
      error.value = 'Please select at least one developer'
      return
    }
    
    creatingTeam.value = true
    error.value = ''
    
    const teamData = {
      name: newTeam.value.name.trim(),
      managerID: newTeam.value.managerID,
      members: newTeam.value.members
    }
    
    await createTeam(teamData)
    
    // Reload teams to show the new team
    if (currentUser.value?.type === 'admin') {
      await loadAllTeams()
    }
    
    successMessage.value = `Team "${teamData.name}" created successfully!`
    closeCreateForm()
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    
  } catch (err) {
    error.value = 'Failed to create team'
    console.error('Error creating team:', err)
  } finally {
    creatingTeam.value = false
  }
}

// Get user name by ID
const getUserName = (userId) => {
  const user = users.value.find(u => u.id === userId)
  return user ? `${user.first_name} ${user.last_name}` : `User #${userId}`
}
</script>

<template>
  <div class="teams-container">
    <div class="page-header">
      <div class="header-content">
        <h1>{{ getPageTitle() }}</h1>
        <p class="subtitle">{{ getPageSubtitle() }}</p>
      </div>
      
      <!-- Create Team Button (Admins) -->
      <div v-if="currentUser?.type === 'admin'" class="header-actions">
        <button @click="openCreateForm" class="btn btn-primary">
          + Create New Team
        </button>
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
    
    <div class="teams-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading">
        Loading teams...
      </div>
      
      <!-- No Teams -->
      <div v-else-if="teams.length === 0" class="no-teams">
        <p>No teams found.</p>
      </div>
      
      <!-- Teams List -->
      <div v-else class="teams-grid">
        <div 
          v-for="team in teams" 
          :key="team.id" 
          class="team-card"
        >
          <div class="team-header">
            <h3 class="team-name">{{ team.name }}</h3>
            <span class="team-id">#{{ team.id }}</span>
          </div>
          
          <div class="team-info">
            <div class="members-info">
              <strong>Team Members:</strong> {{ team.members.length }} developers
            </div>
            
            <div v-if="currentUser?.type === 'admin'" class="manager-info">
              <strong>Manager ID:</strong> {{ team.managerID }}
            </div>
          </div>
          
          <!-- Projects assigned to this team -->
          <div class="team-projects">
            <h4>Assigned Projects</h4>
            <div v-if="getTeamProjects(team.id).length === 0" class="no-projects">
              <p>No projects assigned to this team yet.</p>
            </div>
            <div v-else class="projects-list">
              <div 
                v-for="project in getTeamProjects(team.id)" 
                :key="project.id"
                class="project-item"
              >
                <span class="project-name">{{ project.project_name }}</span>
                <span class="project-id">#{{ project.id }}</span>
              </div>
            </div>
          </div>
          
          <!-- Quick Stats -->
          <div class="team-stats">
            <div class="stat-item">
              <span class="stat-label">Active Projects:</span>
              <span class="stat-value">{{ getTeamProjects(team.id).length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Team Size:</span>
              <span class="stat-value">{{ team.members.length }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create Team Modal -->
    <div v-if="showCreateForm" class="modal-overlay" @click="closeCreateForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Create New Team</h2>
          <button @click="closeCreateForm" class="close-button">×</button>
        </div>
        
        <div class="modal-body">
          <!-- Error Message -->
          <div v-if="error" class="alert alert-error">
            {{ error }}
          </div>
          
          <div class="form-group">
            <label for="teamName">Team Name</label>
            <input 
              v-model="newTeam.name" 
              type="text" 
              id="teamName" 
              class="form-control"
              placeholder="Enter team name"
            />
          </div>
          
          <div class="form-group">
            <label for="managerID">Manager</label>
            <select 
              v-model="newTeam.managerID" 
              id="managerID" 
              class="form-control"
            >
              <option value="">Select a manager</option>
              <option 
                v-for="manager in availableManagers" 
                :key="manager.id" 
                :value="manager.id"
              >
                {{ getUserName(manager.id) }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Developers</label>
            <div class="developers-list">
              <div 
                v-for="developer in availableDevelopers" 
                :key="developer.id" 
                class="developer-item"
              >
                <input 
                  type="checkbox" 
                  :id="'dev-' + developer.id" 
                  :value="developer.id"
                  v-model="newTeam.members"
                  class="developer-checkbox"
                />
                <label :for="'dev-' + developer.id" class="developer-label">
                  {{ getUserName(developer.id) }}
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            @click="createNewTeam" 
            class="btn btn-success"
            :disabled="creatingTeam"
          >
            <span v-if="creatingTeam" class="spinner"></span>
            Create Team
          </button>
          <button @click="closeCreateForm" class="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.teams-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content {
  flex: 1;
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 2rem;
  font-weight: 700;
}

.subtitle {
  color: #666;
  margin: 0;
  font-size: 1rem;
}

.header-actions {
  flex-shrink: 0;
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
  color: #2f855a;
  border: 1px solid #c6f6d5;
}

/* Loading & Empty States */
.loading {
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-style: italic;
}

.no-teams {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.no-teams p {
  font-size: 1.1rem;
  margin: 0;
}

/* Teams Grid */
.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.team-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.team-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Team Header */
.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.team-name {
  margin: 0;
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
}

.team-id {
  background: #edf2f7;
  color: #4a5568;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Team Info */
.team-info {
  margin-bottom: 1.5rem;
}

.team-info > div {
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-size: 0.9rem;
}

.members-info {
  color: #2d3748 !important;
  font-weight: 500;
}

.manager-info {
  color: #718096;
  font-size: 0.8rem !important;
}

/* Team Projects */
.team-projects {
  margin-bottom: 1.5rem;
}

.team-projects h4 {
  margin: 0 0 0.75rem 0;
  color: #2d3748;
  font-size: 1rem;
  font-weight: 600;
}

.no-projects p {
  color: #a0aec0;
  font-style: italic;
  font-size: 0.875rem;
  margin: 0;
  text-align: left;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #f7fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.project-name {
  color: #2d3748;
  font-weight: 500;
  flex: 1;
}

.project-id {
  background: #e2e8f0;
  color: #4a5568;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Team Stats */
.team-stats {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #718096;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

/* Create Team Form */
.create-team-container {
  margin-top: 2rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #718096;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f7fafc;
  color: #2d3748;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.create-team-form {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 2rem;
  margin-top: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.create-team-form h2 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2d3748;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #2d3748;
}

.form-control:focus {
  border-color: #3182ce;
  box-shadow: 0 0 0 1px rgba(49, 130, 206, 0.5);
}

/* Developer Selection */
.developers-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.developer-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.developer-checkbox {
  transform: scale(1.2);
}

.developer-label {
  color: #2d3748;
  font-weight: 500;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.btn-primary {
  background: #3182ce;
  color: white;
}

.btn-primary:hover {
  background: #2b6cb0;
}

.btn-success {
  background: #48bb78;
  color: white;
}

.btn-success:hover {
  background: #38a169;
}

.btn-secondary {
  background: #edf2f7;
  color: #2d3748;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

/* Spinner for loading button */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .teams-container {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .teams-grid {
    grid-template-columns: 1fr;
  }
  
  .team-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .team-stats {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .stat-item {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .modal-content {
    margin: 1rem;
    max-width: none;
  }
}
</style>
