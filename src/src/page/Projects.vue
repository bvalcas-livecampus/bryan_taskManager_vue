<script setup>
import { ref, onMounted, computed } from 'vue'
import { fetchProjects, createProject, updateProject, deleteProject } from '../../api/projects.js'
import { fetchTeams, fetchTeamsByManager } from '../../api/teams.js'
import { getUser } from '../../db/user.js'
import Button from '../components/button/button.vue'
import Input from '../components/input/input.vue'

// Reactive data
const projects = ref([])
const teams = ref([])
const currentUser = ref(null)
const showCreateForm = ref(false)
const editingProject = ref(null)

// Form data
const newProject = ref({
  project_name: '',
  team_id: null
})

// Loading states
const loading = ref(false)
const error = ref('')
const success = ref('')

// Get current user and their teams
onMounted(async () => {
  try {
    currentUser.value = getUser()
    if (currentUser.value?.type === 'manager') {
      await loadManagerTeams()
      await loadProjects()
    }
  } catch (err) {
    error.value = 'Failed to load data'
    console.error('Error loading data:', err)
  }
})

// Load teams managed by current manager
const loadManagerTeams = async () => {
  try {
    if (currentUser.value?.id) {
      teams.value = await fetchTeamsByManager(currentUser.value.id)
    }
  } catch (err) {
    console.error('Error loading teams:', err)
    error.value = 'Failed to load teams'
  }
}

// Load all projects (filtered by manager's teams)
const loadProjects = async () => {
  try {
    loading.value = true
    const allProjects = await fetchProjects()
    const teamIds = teams.value.map(team => team.id)
    projects.value = allProjects.filter(project => teamIds.includes(project.team_id))
  } catch (err) {
    console.error('Error loading projects:', err)
    error.value = 'Failed to load projects'
  } finally {
    loading.value = false
  }
}

// Get team name by ID
const getTeamName = (teamId) => {
  const team = teams.value.find(t => t.id === teamId)
  return team ? team.name : 'Unknown Team'
}

// Create new project
const handleCreateProject = async () => {
  if (!newProject.value.project_name.trim() || !newProject.value.team_id) {
    error.value = 'Please fill in all fields'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const projectData = {
      project_name: newProject.value.project_name.trim(),
      team_id: parseInt(newProject.value.team_id)
    }
    
    const createdProject = await createProject(projectData)
    projects.value.push(createdProject)
    
    // Reset form
    newProject.value = { project_name: '', team_id: null }
    showCreateForm.value = false
    success.value = 'Project created successfully!'
    
    setTimeout(() => { success.value = '' }, 3000)
  } catch (err) {
    console.error('Error creating project:', err)
    error.value = 'Failed to create project'
  } finally {
    loading.value = false
  }
}

// Start editing project
const startEdit = (project) => {
  editingProject.value = { ...project }
}

// Save edited project
const saveEdit = async () => {
  if (!editingProject.value.project_name.trim()) {
    error.value = 'Project name is required'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const updates = {
      project_name: editingProject.value.project_name.trim(),
      team_id: parseInt(editingProject.value.team_id)
    }
    
    const updatedProject = await updateProject(editingProject.value.id, updates)
    
    // Update local data
    const index = projects.value.findIndex(p => p.id === editingProject.value.id)
    if (index !== -1) {
      projects.value[index] = updatedProject
    }
    
    editingProject.value = null
    success.value = 'Project updated successfully!'
    
    setTimeout(() => { success.value = '' }, 3000)
  } catch (err) {
    console.error('Error updating project:', err)
    error.value = 'Failed to update project'
  } finally {
    loading.value = false
  }
}

// Cancel editing
const cancelEdit = () => {
  editingProject.value = null
  error.value = ''
}

// Delete project
const handleDeleteProject = async (projectId) => {
  if (!confirm('Are you sure you want to delete this project?')) {
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    await deleteProject(projectId)
    projects.value = projects.value.filter(p => p.id !== projectId)
    
    success.value = 'Project deleted successfully!'
    setTimeout(() => { success.value = '' }, 3000)
  } catch (err) {
    console.error('Error deleting project:', err)
    error.value = 'Failed to delete project'
  } finally {
    loading.value = false
  }
}

// Cancel create form
const cancelCreate = () => {
  showCreateForm.value = false
  newProject.value = { project_name: '', team_id: null }
  error.value = ''
}
</script>

<template>
  <div class="projects-container">
    <h1>Projects Management</h1>
    <p class="subtitle">Manage your team projects</p>
    
    <!-- Alert Messages -->
    <div v-if="error" class="alert alert-error">
      {{ error }}
    </div>
    <div v-if="success" class="alert alert-success">
      {{ success }}
    </div>
    
    <div class="projects-content">
      <!-- Actions Header -->
      <div class="actions-header">
        <h2>Your Projects</h2>
        <Button 
          label="+ Create New Project" 
          type="button"
          @click="showCreateForm = true"
          v-if="!showCreateForm"
        />
      </div>

      <!-- Create Project Form -->
      <div v-if="showCreateForm" class="create-form">
        <h3>Create New Project</h3>
        <div class="form-group">
          <Input
            id="project-name"
            name="project-name"
            label="Project Name"
            placeholder="Enter project name"
            :value="newProject.project_name"
            @update="newProject.project_name = $event"
          />
        </div>
        
        <div class="form-group">
          <label for="team-select">Assign Team</label>
          <select 
            id="team-select" 
            v-model="newProject.team_id"
            class="team-select"
          >
            <option value="">Select a team</option>
            <option 
              v-for="team in teams" 
              :key="team.id" 
              :value="team.id"
            >
              {{ team.name }} ({{ team.members.length }} members)
            </option>
          </select>
        </div>
        
        <div class="form-actions">
          <Button 
            label="Create Project" 
            type="button"
            @click="handleCreateProject"
            :disabled="loading"
          />
          <Button 
            label="Cancel" 
            type="button"
            @click="cancelCreate"
          />
        </div>
      </div>

      <!-- Projects List -->
      <div class="projects-list">
        <div v-if="loading" class="loading">
          Loading projects...
        </div>
        
        <div v-else-if="projects.length === 0" class="no-projects">
          <p>No projects found. Create your first project!</p>
        </div>
        
        <div v-else class="projects-grid">
          <div 
            v-for="project in projects" 
            :key="project.id" 
            class="project-card"
          >
            <!-- Edit Mode -->
            <div v-if="editingProject && editingProject.id === project.id" class="edit-mode">
              <div class="form-group">
                <Input
                  id="edit-project-name"
                  name="edit-project-name"
                  label="Project Name"
                  :value="editingProject.project_name"
                  @update="editingProject.project_name = $event"
                />
              </div>
              
              <div class="form-group">
                <label for="edit-team-select">Assigned Team</label>
                <select 
                  id="edit-team-select" 
                  v-model="editingProject.team_id"
                  class="team-select"
                >
                  <option 
                    v-for="team in teams" 
                    :key="team.id" 
                    :value="team.id"
                  >
                    {{ team.name }} ({{ team.members.length }} members)
                  </option>
                </select>
              </div>
              
              <div class="card-actions">
                <Button 
                  label="Save" 
                  type="button"
                  @click="saveEdit"
                  :disabled="loading"
                />
                <Button 
                  label="Cancel" 
                  type="button"
                  @click="cancelEdit"
                />
              </div>
            </div>
            
            <!-- View Mode -->
            <div v-else class="view-mode">
              <h3 class="project-name">{{ project.project_name }}</h3>
              <div class="project-info">
                <p class="team-info">
                  <strong>Team:</strong> {{ getTeamName(project.team_id) }}
                </p>
                <p class="project-id">
                  <strong>ID:</strong> #{{ project.id }}
                </p>
              </div>
              
              <div class="card-actions">
                <Button 
                  label="Edit" 
                  type="button"
                  @click="startEdit(project)"
                />
                <Button 
                  label="Delete" 
                  type="button"
                  @click="handleDeleteProject(project.id)"
                  class="delete-btn"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.projects-container {
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

.alert-success {
  background-color: #f0fff4;
  color: #22543d;
  border: 1px solid #c6f6d5;
}

/* Actions Header */
.actions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.actions-header h2 {
  margin: 0;
  color: #2d3748;
}

/* Create Form */
.create-form {
  background: #f7fafc;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
}

.create-form h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2d3748;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}

.team-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  transition: border-color 0.2s;
}

.team-select:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

/* Projects List */
.projects-list {
  margin-top: 2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-style: italic;
}

.no-projects {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.no-projects p {
  font-size: 1.1rem;
  margin: 0;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.project-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* View Mode */
.project-name {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.25rem;
}

.project-info {
  margin-bottom: 1.5rem;
}

.project-info p {
  margin: 0.5rem 0;
  color: #4a5568;
}

.team-info {
  font-size: 1rem;
}

.project-id {
  font-size: 0.875rem;
  color: #718096;
}

/* Edit Mode */
.edit-mode {
  border: 2px solid #3182ce;
  border-radius: 8px;
  padding: 1rem;
  background: #f7fafc;
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.card-actions button {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.card-actions button:hover {
  background: #f7fafc;
  border-color: #a0aec0;
}

.card-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-btn {
  background: #fed7d7 !important;
  color: #c53030 !important;
  border-color: #feb2b2 !important;
}

.delete-btn:hover {
  background: #feb2b2 !important;
  border-color: #fc8181 !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .projects-container {
    padding: 1rem;
  }
  
  .actions-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .card-actions {
    flex-direction: column;
  }
}
</style>
