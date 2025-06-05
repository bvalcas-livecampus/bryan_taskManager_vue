<script setup>
import { ref, onMounted } from 'vue'
import { fetchTeams, fetchTeamsByManager } from '../../api/teams.js'
import { fetchProjects } from '../../api/projects.js'
import { getUser } from '../../db/user.js'

// Reactive data
const teams = ref([])
const projects = ref([])
const currentUser = ref(null)
const loading = ref(false)
const error = ref('')

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
</script>

<template>
  <div class="teams-container">
    <h1>{{ getPageTitle() }}</h1>
    <p class="subtitle">{{ getPageSubtitle() }}</p>
    
    <!-- Error Message -->
    <div v-if="error" class="alert alert-error">
      {{ error }}
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
  </div>
</template>

<style scoped>
.teams-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
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

/* Responsive Design */
@media (max-width: 768px) {
  .teams-container {
    padding: 1rem;
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
}
</style>
