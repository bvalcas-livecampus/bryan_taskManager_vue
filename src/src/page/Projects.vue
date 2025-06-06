<script setup>
import { ref, onMounted, computed, inject } from 'vue'
import { fetchProjects, createProject, updateProject, deleteProject } from '../../api/projects.js'
import { fetchTeams, fetchTeamsByManager } from '../../api/teams.js'

// Import components
import Modal from '../components/modal/Modal.vue'
import Alert from '../components/alert/Alert.vue'
import Loading from '../components/loading/Loading.vue'
import PageHeader from '../components/page-header/PageHeader.vue'
import EmptyState from '../components/empty-state/EmptyState.vue'
import FormGroup from '../components/form/FormGroup.vue'
import ProjectCard from '../components/project-card/ProjectCard.vue'
import Button from '../components/button/button.vue'
import Input from '../components/input/input.vue'

// Reactive data
const projects = ref([])
const teams = ref([])
const currentUser = inject('user')
const showCreateForm = ref(false)
const editingProject = ref(null)

// Form data
const newProject = ref({
  project_name: '',
  team_id: null
})

// Loading states
const loading = ref(false)
const creatingProject = ref(false)
const error = ref('')
const success = ref('')

// Get page title and subtitle
const getPageTitle = () => {
  if (currentUser.value?.type === 'admin') {
    return 'All Projects Management'
  } else if (currentUser.value?.type === 'manager') {
    return 'My Team Projects'
  }
  return 'Projects Management'
}

const getPageSubtitle = () => {
  if (currentUser.value?.type === 'admin') {
    return 'Manage all projects across all teams'
  } else if (currentUser.value?.type === 'manager') {
    return 'Manage projects for your teams'
  }
  return 'Manage your team projects'
}

// Open create project form
const openCreateForm = () => {
  newProject.value = {
    project_name: '',
    team_id: null
  }
  showCreateForm.value = true
}

// Close create project form
const closeCreateForm = () => {
  showCreateForm.value = false
  newProject.value = {
    project_name: '',
    team_id: null
  }
  error.value = ''
}

// Get current user and their teams
onMounted(async () => {
  try {
    if (currentUser.value?.type === 'admin') {
      await loadAllTeams()
      await loadAllProjects()
    } else if (currentUser.value?.type === 'manager') {
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

// Load all teams (for admins)
const loadAllTeams = async () => {
  try {
    teams.value = await fetchTeams()
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

// Load all projects (for admins)
const loadAllProjects = async () => {
  try {
    loading.value = true
    projects.value = await fetchProjects()
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
    creatingProject.value = true
    error.value = ''
    
    const projectData = {
      project_name: newProject.value.project_name.trim(),
      team_id: parseInt(newProject.value.team_id)
    }
    
    const createdProject = await createProject(projectData)
    projects.value.push(createdProject)
    
    success.value = 'Project created successfully!'
    closeCreateForm()
    
    setTimeout(() => { success.value = '' }, 3000)
  } catch (err) {
    console.error('Error creating project:', err)
    error.value = 'Failed to create project'
  } finally {
    creatingProject.value = false
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
  closeCreateForm()
}
</script>

<template>
  <div class="projects-container">
    <PageHeader :title="getPageTitle()" :subtitle="getPageSubtitle()">
      <template #actions>
        <Button 
          @click="openCreateForm"
          variant="primary"
          label="+ Create New Project"
        />
      </template>
    </PageHeader>
    
    <!-- Alert Messages -->
    <Alert :message="error" type="error" />
    <Alert :message="success" type="success" />
    
    <div class="projects-content">
      <!-- Loading State -->
      <Loading :is-loading="loading" message="Loading projects..." />
      
      <!-- No Projects -->
      <EmptyState 
        v-if="!loading && projects.length === 0"
        title="No Projects Found"
        message="No projects have been created yet."
        icon="📁"
      >
        <template #action>
          <Button 
            @click="openCreateForm"
            variant="primary"
            label="Create First Project"
          />
        </template>
      </EmptyState>
      
      <!-- Projects Grid -->
      <div v-else-if="!loading" class="projects-grid">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
          :teams="teams"
          :is-editing="editingProject && editingProject.id === project.id"
          :edit-data="editingProject"
          :loading="loading"
          @edit="startEdit(project)"
          @delete="handleDeleteProject(project.id)"
          @save="saveEdit"
          @cancel="cancelEdit"
          @update-name="editingProject.project_name = $event"
          @update-team="editingProject.team_id = $event"
        />
      </div>
    </div>
    
    <!-- Create Project Modal -->
    <Modal 
      :is-visible="showCreateForm" 
      title="Create New Project"
      @close="closeCreateForm"
    >
      <Alert :message="error" type="error" />
      
      <FormGroup label="Project Name" input-id="projectName">
        <Input
          id="projectName"
          name="projectName"
          :value="newProject.project_name"
          @update="newProject.project_name = $event"
          placeholder="Enter project name"
        />
      </FormGroup>
      
      <FormGroup label="Assign Team" input-id="teamSelect">
        <select 
          id="teamSelect" 
          v-model="newProject.team_id"
          class="form-control"
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
      </FormGroup>
      
      <template #footer>
        <Button 
          @click="handleCreateProject" 
          variant="success"
          label="Create Project"
          :loading="creatingProject"
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
.projects-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
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
  .projects-container {
    padding: 1rem;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
