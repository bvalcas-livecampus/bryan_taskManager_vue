<script setup>
import { ref, onMounted, computed, watch, inject } from 'vue'
import { fetchTasks, createTask, updateTask, deleteTask } from '../../api/tasks.js'
import { fetchProjects } from '../../api/projects.js'
import { fetchUsers } from '../../api/users.js'
import { fetchTeamsByManager, fetchTeams } from '../../api/teams.js'

// Import components
import Modal from '../components/modal/Modal.vue'
import Alert from '../components/alert/Alert.vue'
import Loading from '../components/loading/Loading.vue'
import PageHeader from '../components/page-header/PageHeader.vue'
import EmptyState from '../components/empty-state/EmptyState.vue'
import FormGroup from '../components/form/FormGroup.vue'
import Button from '../components/button/button.vue'
import Input from '../components/input/input.vue'

// Reactive data
const tasks = ref([])
const projects = ref([])
const users = ref([])
const teams = ref([])
const currentUser = inject('user')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingTask = ref(null)

// Form data
const newTask = ref({
  label: '',
  description: '',
  projectID: null,
  assignedTo: null,
  estimatedTime: 1,
  step: 1
})

const editFormData = ref({
  label: '',
  description: '',
  projectID: null,
  assignedTo: null,
  estimatedTime: 1,
  step: 1
})

// Loading states
const loading = ref(false)
const creatingTask = ref(false)
const updatingTask = ref(false)
const error = ref('')
const success = ref('')

// Task status steps
const taskSteps = [
  { value: 1, label: 'Backlog', color: '#6c757d' },
  { value: 2, label: 'Todo', color: '#007bff' },
  { value: 3, label: 'In Progress', color: '#ffc107' },
  { value: 4, label: 'Review', color: '#fd7e14' },
  { value: 5, label: 'Done', color: '#28a745' }
]

// Computed properties
const managedProjects = computed(() => {
  if (currentUser.value?.type === 'admin') {
    // Admins can see all projects
    return projects.value
  }
  
  if (currentUser.value?.type === 'manager') {
    // Managers can only see projects from teams they manage
    const managedTeamIds = teams.value.map(team => team.id)
    return projects.value.filter(project => 
      managedTeamIds.includes(project.team_id)
    )
  }
  
  // Developers shouldn't create tasks, but just in case
  return []
})

const teamMembers = computed(() => {
  // Get developers from the team assigned to the selected project
  if (!newTask.value.projectID && !editFormData.value.projectID) {
    return []
  }
  
  const projectId = newTask.value.projectID || editFormData.value.projectID
  const project = projects.value.find(p => p.id === parseInt(projectId))
  
  if (!project) {
    return []
  }
  
  const team = teams.value.find(t => t.id === project.team_id)
  
  if (!team || !team.members) {
    return []
  }
  
  // Return only developers who are members of the team assigned to the project
  return users.value.filter(user => 
    user.type === 'dev' && team.members.includes(user.id)
  )
})

const createModalTeamMembers = computed(() => {
  if (!newTask.value.projectID) {
    return []
  }
  
  const project = projects.value.find(p => p.id === parseInt(newTask.value.projectID))
  if (!project) {
    return []
  }
  
  const team = teams.value.find(t => t.id === project.team_id)
  if (!team || !team.members) {
    return []
  }
  
  return users.value.filter(user => 
    user.type === 'dev' && team.members.includes(user.id)
  )
})

const editModalTeamMembers = computed(() => {
  if (!editFormData.value.projectID) {
    return []
  }
  
  const project = projects.value.find(p => p.id === parseInt(editFormData.value.projectID))
  if (!project) {
    return []
  }
  
  const team = teams.value.find(t => t.id === project.team_id)
  if (!team || !team.members) {
    return []
  }
  
  return users.value.filter(user => 
    user.type === 'dev' && team.members.includes(user.id)
  )
})

const filteredTasks = computed(() => {
  if (currentUser.value?.type === 'admin') {
    return tasks.value
  }
  // For managers, show tasks from projects they manage
  const projectIds = managedProjects.value.map(p => p.id)
  return tasks.value.filter(task => projectIds.includes(task.projectID))
})

// Helper functions
const getProjectName = (projectId) => {
  const project = projects.value.find(p => p.id === projectId)
  return project ? project.project_name : 'Unknown Project'
}

const getUserName = (userId) => {
  const user = users.value.find(u => u.id === userId)
  return user ? `${user.first_name} ${user.last_name}` : 'Unassigned'
}

const getStepLabel = (step) => {
  const stepObj = taskSteps.find(s => s.value === step)
  return stepObj ? stepObj.label : 'Unknown'
}

const getStepColor = (step) => {
  const stepObj = taskSteps.find(s => s.value === step)
  return stepObj ? stepObj.color : '#6c757d'
}

// API functions
const loadTasks = async () => {
  try {
    tasks.value = await fetchTasks()
  } catch (err) {
    console.error('Error loading tasks:', err)
    error.value = 'Failed to load tasks'
  }
}

const loadProjects = async () => {
  try {
    projects.value = await fetchProjects()
  } catch (err) {
    console.error('Error loading projects:', err)
    error.value = 'Failed to load projects'
  }
}

const loadUsers = async () => {
  try {
    users.value = await fetchUsers()
  } catch (err) {
    console.error('Error loading users:', err)
    error.value = 'Failed to load users'
  }
}

const loadTeams = async () => {
  try {
    if (currentUser.value?.type === 'manager') {
      teams.value = await fetchTeamsByManager(currentUser.value.id)
    } else {
      // For admins, load all teams
      teams.value = await fetchTeams()
    }
  } catch (err) {
    console.error('Error loading teams:', err)
    error.value = 'Failed to load teams'
  }
}

// Modal functions
const openCreateModal = () => {
  newTask.value = {
    label: '',
    description: '',
    projectID: null,
    assignedTo: null,
    estimatedTime: 1,
    step: 1
  }
  showCreateModal.value = true
  error.value = ''
}

const closeCreateModal = () => {
  showCreateModal.value = false
  newTask.value = {
    label: '',
    description: '',
    projectID: null,
    assignedTo: null,
    estimatedTime: 1,
    step: 1
  }
  error.value = ''
}

const openEditModal = (task) => {
  editingTask.value = task
  editFormData.value = {
    label: task.label,
    description: task.description || '',
    projectID: task.projectID,
    assignedTo: task.assignedTo,
    estimatedTime: task.estimatedTime,
    step: task.step
  }
  showEditModal.value = true
  error.value = ''
}

const closeEditModal = () => {
  showEditModal.value = false
  editingTask.value = null
  editFormData.value = {
    label: '',
    description: '',
    projectID: null,
    assignedTo: null,
    estimatedTime: 1,
    step: 1
  }
  error.value = ''
}

// Task operations
const handleCreateTask = async () => {
  try {
    // Validation
    if (!newTask.value.label.trim()) {
      error.value = 'Task title is required'
      return
    }

    if (!newTask.value.projectID) {
      error.value = 'Please select a project'
      return
    }

    creatingTask.value = true
    error.value = ''

    const taskData = {
      label: newTask.value.label.trim(),
      description: newTask.value.description.trim(),
      projectID: parseInt(newTask.value.projectID),
      assignedTo: newTask.value.assignedTo ? parseInt(newTask.value.assignedTo) : null,
      estimatedTime: parseInt(newTask.value.estimatedTime),
      step: parseInt(newTask.value.step)
    }

    const createdTask = await createTask(taskData)
    tasks.value.push(createdTask)

    success.value = 'Task created successfully!'
    closeCreateModal()

    setTimeout(() => { success.value = '' }, 3000)
  } catch (err) {
    console.error('Error creating task:', err)
    error.value = 'Failed to create task'
  } finally {
    creatingTask.value = false
  }
}

const handleUpdateTask = async () => {
  try {
    if (!editFormData.value.label.trim()) {
      error.value = 'Task title is required'
      return
    }

    updatingTask.value = true
    error.value = ''

    const updates = {
      label: editFormData.value.label.trim(),
      description: editFormData.value.description.trim(),
      projectID: parseInt(editFormData.value.projectID),
      assignedTo: editFormData.value.assignedTo ? parseInt(editFormData.value.assignedTo) : null,
      estimatedTime: parseInt(editFormData.value.estimatedTime),
      step: parseInt(editFormData.value.step)
    }

    const updatedTask = await updateTask(editingTask.value.id, updates)
    
    const index = tasks.value.findIndex(t => t.id === editingTask.value.id)
    if (index !== -1) {
      tasks.value[index] = updatedTask
    }

    success.value = 'Task updated successfully!'
    closeEditModal()

    setTimeout(() => { success.value = '' }, 3000)
  } catch (err) {
    console.error('Error updating task:', err)
    error.value = 'Failed to update task'
  } finally {
    updatingTask.value = false
  }
}

const handleDeleteTask = async (taskId) => {
  if (!confirm('Are you sure you want to delete this task?')) {
    return
  }

  try {
    loading.value = true
    await deleteTask(taskId)
    tasks.value = tasks.value.filter(t => t.id !== taskId)
    success.value = 'Task deleted successfully!'
    setTimeout(() => { success.value = '' }, 3000)
  } catch (err) {
    console.error('Error deleting task:', err)
    error.value = 'Failed to delete task'
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  try {
    loading.value = true
    
    await Promise.all([
      loadTasks(),
      loadProjects(),
      loadUsers(),
      loadTeams()
    ])
  } catch (err) {
    error.value = 'Failed to load data'
  } finally {
    loading.value = false
  }
})

// Watchers to clear assignedTo when project changes
watch(() => newTask.value.projectID, (newProjectId, oldProjectId) => {
  if (newProjectId !== oldProjectId && newTask.value.assignedTo) {
    // Check if currently assigned user is still available for the new project
    const availableUserIds = createModalTeamMembers.value.map(user => user.id)
    if (!availableUserIds.includes(parseInt(newTask.value.assignedTo))) {
      newTask.value.assignedTo = null
    }
  }
})

watch(() => editFormData.value.projectID, (newProjectId, oldProjectId) => {
  if (newProjectId !== oldProjectId && editFormData.value.assignedTo) {
    // Check if currently assigned user is still available for the new project
    const availableUserIds = editModalTeamMembers.value.map(user => user.id)
    if (!availableUserIds.includes(parseInt(editFormData.value.assignedTo))) {
      editFormData.value.assignedTo = null
    }
  }
})
</script>

<template>
  <div class="tasks-container">
    <PageHeader title="Tasks Management" subtitle="Create and manage tasks for your projects">
      <template #actions>
        <Button 
          @click="openCreateModal"
          variant="primary"
          label="+ Create New Task"
        />
      </template>
    </PageHeader>
    
    <!-- Alert Messages -->
    <Alert :message="error" type="error" />
    <Alert :message="success" type="success" />
    
    <div class="tasks-content">
      <!-- Loading State -->
      <Loading :is-loading="loading" message="Loading tasks..." />
      
      <!-- No Tasks -->
      <EmptyState 
        v-if="!loading && filteredTasks.length === 0"
        title="No Tasks Found"
        message="No tasks have been created yet."
        icon="📋"
      >
        <template #action>
          <Button 
            @click="openCreateModal"
            variant="primary"
            label="Create First Task"
          />
        </template>
      </EmptyState>
      
      <!-- Tasks List -->
      <div v-else-if="!loading" class="tasks-grid">
        <div 
          v-for="task in filteredTasks" 
          :key="task.id" 
          class="task-card"
        >
          <div class="task-header">
            <h3 class="task-title">{{ task.label }}</h3>
            <div 
              class="task-status" 
              :style="{ backgroundColor: getStepColor(task.step) }"
            >
              {{ getStepLabel(task.step) }}
            </div>
          </div>
          
          <div class="task-body">
            <p v-if="task.description" class="task-description">
              {{ task.description }}
            </p>
            
            <div class="task-details">
              <div class="detail-item">
                <strong>Project:</strong> {{ getProjectName(task.projectID) }}
              </div>
              <div class="detail-item">
                <strong>Assigned to:</strong> {{ getUserName(task.assignedTo) }}
              </div>
              <div class="detail-item">
                <strong>Estimated time:</strong> {{ task.estimatedTime }}h
              </div>
            </div>
          </div>
          
          <div class="task-actions">
            <Button 
              @click="openEditModal(task)"
              variant="secondary"
              label="Edit"
              size="small"
            />
            <Button 
              @click="handleDeleteTask(task.id)"
              variant="danger"
              label="Delete"
              size="small"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create Task Modal -->
    <Modal 
      :is-visible="showCreateModal" 
      title="Create New Task"
      @close="closeCreateModal"
    >
      <Alert :message="error" type="error" />
      
      <FormGroup label="Task Title" input-id="taskTitle">
        <Input
          id="taskTitle"
          name="taskTitle"
          :value="newTask.label"
          @update="newTask.label = $event"
          placeholder="Enter task title"
        />
      </FormGroup>
      
      <FormGroup label="Description" input-id="taskDescription">
        <textarea
          id="taskDescription"
          v-model="newTask.description"
          class="form-control textarea"
          placeholder="Enter task description (optional)"
          rows="3"
        ></textarea>
      </FormGroup>
      
      <FormGroup label="Project" input-id="taskProject">
        <select 
          id="taskProject"
          v-model="newTask.projectID"
          class="form-control"
        >
          <option value="">Select a project</option>
          <option 
            v-for="project in managedProjects" 
            :key="project.id" 
            :value="project.id"
          >
            {{ project.project_name }}
          </option>
        </select>
      </FormGroup>
      
      <FormGroup label="Assign to Developer" input-id="taskAssignee">
        <select 
          id="taskAssignee"
          v-model="newTask.assignedTo"
          class="form-control"
        >
          <option value="">Select a developer (optional)</option>
          <option 
            v-for="user in createModalTeamMembers" 
            :key="user.id" 
            :value="user.id"
          >
            {{ user.first_name }} {{ user.last_name }}
          </option>
        </select>
      </FormGroup>
      
      <div class="form-row">
        <FormGroup label="Estimated Time (hours)" input-id="taskTime">
          <input
            id="taskTime"
            v-model.number="newTask.estimatedTime"
            type="number"
            min="1"
            max="100"
            class="form-control"
          />
        </FormGroup>
        
        <FormGroup label="Initial Status" input-id="taskStatus">
          <select 
            id="taskStatus"
            v-model="newTask.step"
            class="form-control"
          >
            <option 
              v-for="step in taskSteps" 
              :key="step.value" 
              :value="step.value"
            >
              {{ step.label }}
            </option>
          </select>
        </FormGroup>
      </div>
      
      <template #footer>
        <Button 
          @click="handleCreateTask" 
          variant="success"
          label="Create Task"
          :loading="creatingTask"
        />
        <Button 
          @click="closeCreateModal" 
          variant="secondary"
          label="Cancel"
        />
      </template>
    </Modal>
    
    <!-- Edit Task Modal -->
    <Modal 
      :is-visible="showEditModal" 
      title="Edit Task"
      @close="closeEditModal"
    >
      <Alert :message="error" type="error" />
      
      <FormGroup label="Task Title" input-id="editTaskTitle">
        <Input
          id="editTaskTitle"
          name="editTaskTitle"
          :value="editFormData.label"
          @update="editFormData.label = $event"
          placeholder="Enter task title"
        />
      </FormGroup>
      
      <FormGroup label="Description" input-id="editTaskDescription">
        <textarea
          id="editTaskDescription"
          v-model="editFormData.description"
          class="form-control textarea"
          placeholder="Enter task description (optional)"
          rows="3"
        ></textarea>
      </FormGroup>
      
      <FormGroup label="Project" input-id="editTaskProject">
        <select 
          id="editTaskProject"
          v-model="editFormData.projectID"
          class="form-control"
        >
          <option value="">Select a project</option>
          <option 
            v-for="project in managedProjects" 
            :key="project.id" 
            :value="project.id"
          >
            {{ project.project_name }}
          </option>
        </select>
      </FormGroup>
      
      <FormGroup label="Assign to Developer" input-id="editTaskAssignee">
        <select 
          id="editTaskAssignee"
          v-model="editFormData.assignedTo"
          class="form-control"
        >
          <option value="">Select a developer (optional)</option>
          <option 
            v-for="user in editModalTeamMembers" 
            :key="user.id" 
            :value="user.id"
          >
            {{ user.first_name }} {{ user.last_name }}
          </option>
        </select>
      </FormGroup>
      
      <div class="form-row">
        <FormGroup label="Estimated Time (hours)" input-id="editTaskTime">
          <input
            id="editTaskTime"
            v-model.number="editFormData.estimatedTime"
            type="number"
            min="1"
            max="100"
            class="form-control"
          />
        </FormGroup>
        
        <FormGroup label="Status" input-id="editTaskStatus">
          <select 
            id="editTaskStatus"
            v-model="editFormData.step"
            class="form-control"
          >
            <option 
              v-for="step in taskSteps" 
              :key="step.value" 
              :value="step.value"
            >
              {{ step.label }}
            </option>
          </select>
        </FormGroup>
      </div>
      
      <template #footer>
        <Button 
          @click="handleUpdateTask" 
          variant="success"
          label="Update Task"
          :loading="updatingTask"
        />
        <Button 
          @click="closeEditModal" 
          variant="secondary"
          label="Cancel"
        />
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.tasks-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.tasks-content {
  margin-top: 1rem;
}

/* Tasks Grid */
.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

/* Task Card */
.task-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.task-title {
  margin: 0;
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
  flex: 1;
  margin-right: 1rem;
}

.task-status {
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.task-body {
  margin-bottom: 1.5rem;
}

.task-description {
  color: #4a5568;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  font-size: 0.9rem;
  color: #4a5568;
}

.detail-item strong {
  color: #2d3748;
  margin-right: 0.5rem;
}

.task-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
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

.textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .tasks-container {
    padding: 1rem;
  }
  
  .tasks-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .task-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .task-title {
    margin-right: 0;
  }
}
</style>
