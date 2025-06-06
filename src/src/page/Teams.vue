<script setup>
import { ref, onMounted, computed, inject } from 'vue'
import { fetchTeams, fetchTeamsByManager, createTeam, updateTeam } from '../../api/teams.js'
import { fetchProjects } from '../../api/projects.js'
import { fetchUsers } from '../../api/users.js'

// Import components
import Modal from '../components/modal/Modal.vue'
import Alert from '../components/alert/Alert.vue'
import Loading from '../components/loading/Loading.vue'
import PageHeader from '../components/page-header/PageHeader.vue'
import TeamCard from '../components/team-card/TeamCard.vue'
import EmptyState from '../components/empty-state/EmptyState.vue'
import FormGroup from '../components/form/FormGroup.vue'
import Button from '../components/button/button.vue'

// Reactive data
const teams = ref([])
const projects = ref([])
const users = ref([])
const currentUser = inject('user')
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

// Team editing form
const showEditForm = ref(false)
const editingTeam = ref(false)
const editTeam = ref({
  id: null,
  name: '',
  managerID: null,
  members: []
})
const originalTeam = ref(null)

onMounted(async () => {
  try {
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

// Open edit team form
const openEditForm = (team) => {
  originalTeam.value = { ...team }
  editTeam.value = {
    id: team.id,
    name: team.name,
    managerID: team.managerID,
    members: [...team.members]
  }
  showEditForm.value = true
}

// Close edit team form
const closeEditForm = () => {
  showEditForm.value = false
  editTeam.value = {
    id: null,
    name: '',
    managerID: null,
    members: []
  }
  originalTeam.value = null
  error.value = ''
}

// Get available managers for editing (excluding current manager unless it's the same team)
const availableManagersForEdit = computed(() => {
  const assignedIds = getAssignedUserIds()
  
  return users.value.filter(user => {
    if (user.type !== 'manager') return false
    
    // If this is the current manager of the team being edited, allow it
    if (originalTeam.value && user.id === originalTeam.value.managerID) {
      return true
    }
    
    // Otherwise, only show unassigned managers
    return !assignedIds.has(user.id)
  })
})

// Get available developers for editing (excluding current members unless they're in the same team)
const availableDevelopersForEdit = computed(() => {
  const assignedIds = getAssignedUserIds()
  
  return users.value.filter(user => {
    if (user.type !== 'dev') return false
    
    // If this developer is already in the team being edited, allow them
    if (originalTeam.value && originalTeam.value.members.includes(user.id)) {
      return true
    }
    
    // Otherwise, only show unassigned developers
    return !assignedIds.has(user.id)
  })
})

// Update existing team
const updateExistingTeam = async () => {
  try {
    // Validation
    if (!editTeam.value.name.trim()) {
      error.value = 'Team name is required'
      return
    }
    
    if (!editTeam.value.managerID) {
      error.value = 'Please select a manager'
      return
    }
    
    if (editTeam.value.members.length === 0) {
      error.value = 'Please select at least one developer'
      return
    }
    
    editingTeam.value = true
    error.value = ''
    
    const teamData = {
      name: editTeam.value.name.trim(),
      managerID: editTeam.value.managerID,
      members: editTeam.value.members
    }
    
    await updateTeam(editTeam.value.id, teamData)
    
    // Reload teams to show the updated team
    if (currentUser.value?.type === 'admin') {
      await loadAllTeams()
    }
    
    successMessage.value = `Team "${teamData.name}" updated successfully!`
    closeEditForm()
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    
  } catch (err) {
    error.value = 'Failed to update team'
    console.error('Error updating team:', err)
  } finally {
    editingTeam.value = false
  }
}
</script>

<template>
  <div class="teams-container">
    <PageHeader :title="getPageTitle()" :subtitle="getPageSubtitle()">
      <template #actions>
        <Button 
          v-if="currentUser?.type === 'admin'" 
          @click="openCreateForm"
          variant="primary"
          label="+ Create New Team"
        />
      </template>
    </PageHeader>
    
    <!-- Alert Messages -->
    <Alert :message="error" type="error" />
    <Alert :message="successMessage" type="success" />
    
    <div class="teams-content">
      <!-- Loading State -->
      <Loading :is-loading="loading" message="Loading teams..." />
      
      <!-- No Teams -->
      <EmptyState 
        v-if="!loading && teams.length === 0"
        title="No Teams Found"
        message="No teams have been created yet."
        icon="👥"
      >
        <template #action>
          <Button 
            v-if="currentUser?.type === 'admin'"
            @click="openCreateForm"
            variant="primary"
            label="Create First Team"
          />
        </template>
      </EmptyState>
      
      <!-- Teams Grid -->
      <div v-else-if="!loading" class="teams-grid">
        <TeamCard
          v-for="team in teams"
          :key="team.id"
          :team="team"
          :team-projects="getTeamProjects(team.id)"
          :show-manager-info="currentUser?.type === 'admin'"
          :users="users"
        >
          <template #actions>
            <Button 
              v-if="currentUser?.type === 'admin'"
              @click="openEditForm(team)"
              variant="secondary"
              label="Edit Team"
              size="small"
            />
          </template>
        </TeamCard>
      </div>
    </div>
    
    <!-- Create Team Modal -->
    <Modal 
      :is-visible="showCreateForm" 
      title="Create New Team"
      @close="closeCreateForm"
    >
      <Alert :message="error" type="error" />
      
      <FormGroup label="Team Name" input-id="teamName">
        <input 
          v-model="newTeam.name" 
          type="text" 
          id="teamName" 
          class="form-control"
          placeholder="Enter team name"
        />
      </FormGroup>
      
      <FormGroup label="Manager" input-id="managerID">
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
      </FormGroup>
      
      <FormGroup label="Developers">
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
      </FormGroup>
      
      <template #footer>
        <Button 
          @click="createNewTeam" 
          variant="success"
          label="Create Team"
          :loading="creatingTeam"
        />
        <Button 
          @click="closeCreateForm" 
          variant="secondary"
          label="Cancel"
        />
      </template>
    </Modal>
    
    <!-- Edit Team Modal -->
    <Modal 
      :is-visible="showEditForm" 
      title="Edit Team"
      @close="closeEditForm"
    >
      <Alert :message="error" type="error" />
      
      <FormGroup label="Team Name" input-id="editTeamName">
        <input 
          v-model="editTeam.name" 
          type="text" 
          id="editTeamName" 
          class="form-control"
          placeholder="Enter team name"
        />
      </FormGroup>
      
      <FormGroup label="Manager" input-id="editManagerID">
        <select 
          v-model="editTeam.managerID" 
          id="editManagerID" 
          class="form-control"
        >
          <option value="">Select a manager</option>
          <option 
            v-for="manager in availableManagersForEdit" 
            :key="manager.id" 
            :value="manager.id"
          >
            {{ getUserName(manager.id) }}
          </option>
        </select>
      </FormGroup>
      
      <FormGroup label="Developers">
        <div class="developers-list">
          <div 
            v-for="developer in availableDevelopersForEdit" 
            :key="developer.id" 
            class="developer-item"
          >
            <input 
              type="checkbox" 
              :id="'edit-dev-' + developer.id" 
              :value="developer.id"
              v-model="editTeam.members"
              class="developer-checkbox"
            />
            <label :for="'edit-dev-' + developer.id" class="developer-label">
              {{ getUserName(developer.id) }}
            </label>
          </div>
        </div>
      </FormGroup>
      
      <template #footer>
        <Button 
          @click="updateExistingTeam" 
          variant="success"
          label="Update Team"
          :loading="editingTeam"
        />
        <Button 
          @click="closeEditForm" 
          variant="secondary"
          label="Cancel"
        />
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.teams-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Teams Grid */
.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
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

/* Developer Selection */
.developers-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: #f7fafc;
}

.developer-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.developer-item:hover {
  background: #edf2f7;
}

.developer-checkbox {
  transform: scale(1.2);
  accent-color: #3182ce;
}

.developer-label {
  color: #2d3748;
  font-weight: 500;
  cursor: pointer;
  flex: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .teams-container {
    padding: 1rem;
  }
  
  .teams-grid {
    grid-template-columns: 1fr;
  }
}
</style>
