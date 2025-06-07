<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { fetchTasks, updateTaskStatus, updateTask } from '../../api/tasks.js'
import { fetchProjects, fetchProjectsByTeam } from '../../api/projects.js'
import { fetchUsers } from '../../api/users.js'
import { fetchTeamsByManager } from '../../api/teams.js'
import Modal from '../components/modal/Modal.vue'
import FormGroup from '../components/form/FormGroup.vue'
import Input from '../components/input/input.vue'
import Button from '../components/button/button.vue'
import Alert from '../components/alert/Alert.vue'

// User context
const user = inject('user')

// Reactive data
const tasks = ref([])
const projects = ref([])
const users = ref([])
const teams = ref([])
const managerProjectIds = ref([])
const isLoading = ref(true)
const error = ref(null)

// Task edit modal state
const showEditModal = ref(false)
const editingTask = ref(null)
const editFormData = ref({
  label: '',
  description: '',
  step: 1,
  assignedTo: null,
  estimatedTime: 0
})
const isUpdatingTask = ref(false)
const updateError = ref('')

console.log("tasks", tasks.value)
// Kanban columns configuration
const kanbanColumns = [
  { id: 1, name: 'Backlog', step: 1, color: '#6c757d' },
  { id: 2, name: 'Todo', step: 2, color: '#007bff' },
  { id: 3, name: 'In Progress', step: 3, color: '#ffc107' },
  { id: 4, name: 'Review', step: 4, color: '#fd7e14' },
  { id: 5, name: 'Done', step: 5, color: '#28a745' }
]

// Computed properties
const tasksByStatus = computed(() => {
  const grouped = {}
  kanbanColumns.forEach(column => {
    grouped[column.step] = tasks.value.filter(task => task.step === column.step)
  })
  return grouped
})

const userTasks = computed(() => {
  if (user.value?.type === 'dev') {
    return tasks.value.filter(task => task.assignedTo === user.value.id)
  } else if (user.value?.type === 'manager') {
    // Filter tasks that belong to projects managed by this manager
    const filteredTasks = tasks.value.filter(task => managerProjectIds.value.includes(task.projectID))
    console.log('Manager filtered tasks:', filteredTasks.length, 'out of', tasks.value.length)
    return filteredTasks
  }
  return tasks.value
})

const userTasksByStatus = computed(() => {
  const grouped = {}
  kanbanColumns.forEach(column => {
    grouped[column.step] = userTasks.value.filter(task => task.step === column.step)
  })
  return grouped
})

// Filter developers to only show those in manager's teams
const availableDevelopers = computed(() => {
  if (user.value?.type !== 'manager') {
    return users.value.filter(u => u.type === 'dev')
  }
  
  // Get all member IDs from manager's teams
  const managerTeamMemberIds = teams.value
    .filter(team => team.managerID === user.value.id)
    .flatMap(team => team.members)
  
  // Filter developers to only those in manager's teams
  return users.value.filter(u => 
    u.type === 'dev' && managerTeamMemberIds.includes(u.id)
  )
})

// Helper functions
const getProjectName = (projectId) => {
  const project = projects.value.find(p => p.id === projectId)
  return project ? project.project_name : 'Unknown Project'
}

const getUserName = (userId) => {
  const userData = users.value.find(u => u.id === userId)
  return userData ? `${userData.first_name} ${userData.last_name}` : 'Unassigned'
}

const getStatusColor = (step) => {
  const column = kanbanColumns.find(col => col.step === step)
  return column ? column.color : '#6c757d'
}

// API functions - now using imported functions
const loadTasks = async () => {
  try {
    tasks.value = await fetchTasks()
    console.log('Tasks loaded:', tasks.value)
  } catch (err) {
    console.error('Error fetching tasks:', err)
    error.value = 'Failed to load tasks'
  }
}

const loadProjects = async () => {
  try {
    projects.value = await fetchProjects()
  } catch (err) {
    console.error('Error fetching projects:', err)
  }
}

const loadTeams = async () => {
  try {
    if (user.value?.type === 'manager') {
      teams.value = await fetchTeamsByManager(user.value.id)
    }
  } catch (err) {
    console.error('Error fetching teams:', err)
  }
}

const loadManagerProjects = async () => {
  try {
    if (user.value?.type === 'manager' && teams.value.length > 0) {
      const projectIds = []
      for (const team of teams.value) {
        const teamProjects = await fetchProjectsByTeam(team.id)
        projectIds.push(...teamProjects.map(project => project.id))
      }
      managerProjectIds.value = projectIds
      console.log('Manager project IDs:', projectIds)
    }
  } catch (err) {
    console.error('Error fetching manager projects:', err)
  }
}

const loadUsers = async () => {
  try {
    users.value = await fetchUsers()
  } catch (err) {
    console.error('Error fetching users:', err)
  }
}

const updateTaskStatusHandler = async (taskId, newStep) => {
  try {
    const updatedTask = await updateTaskStatus(taskId, newStep)
    const taskIndex = tasks.value.findIndex(t => t.id === taskId)
    if (taskIndex !== -1) {
      tasks.value[taskIndex] = updatedTask
    }
    return true
  } catch (err) {
    console.error('Error updating task:', err)
    error.value = 'Failed to update task status'
    return false
  }
}

// Drag and drop functionality
const draggedTask = ref(null)

const onDragStart = (event, task) => {
  isDragging.value = true
  draggedTask.value = task
  event.dataTransfer.effectAllowed = 'move'
  // Prevent click event when dragging
  event.stopPropagation()
}

const onDragOver = (event) => {
  event.preventDefault()
}

const onDragEnd = () => {
  // Reset dragging state when drag operation ends (even if dropped outside)
  setTimeout(() => {
    isDragging.value = false
    draggedTask.value = null
  }, 100)
}

const onDrop = async (event, newStep) => {
  event.preventDefault()
  
  if (draggedTask.value && draggedTask.value.step !== newStep) {
    const success = await updateTaskStatusHandler(draggedTask.value.id, newStep)
    if (!success) {
      // Revert on failure - the error will be shown to user
      console.error('Failed to update task status')
    }
  }
  
  draggedTask.value = null
  // Reset dragging state after a short delay to prevent accidental clicks
  setTimeout(() => {
    isDragging.value = false
  }, 100)
}

// Task editing functionality
const isDragging = ref(false)

const openTaskEditModal = (task) => {
  if ((user.value?.type !== 'dev' && user.value?.type !== 'manager') || isDragging.value) return // Only devs and managers can edit tasks
  
  editingTask.value = task
  editFormData.value = {
    label: task.label,
    description: task.description || '',
    step: task.step,
    assignedTo: task.assignedTo || null,
    estimatedTime: task.estimatedTime || 0
  }
  updateError.value = ''
  showEditModal.value = true
}

const closeTaskEditModal = () => {
  showEditModal.value = false
  editingTask.value = null
  editFormData.value = {
    label: '',
    description: '',
    step: 1,
    assignedTo: null,
    estimatedTime: 0
  }
  updateError.value = ''
}

const saveTaskChanges = async () => {
  if (!editingTask.value) return
  
  try {
    isUpdatingTask.value = true
    updateError.value = ''
    
    // Prepare update data - only include changed fields
    const updates = {}
    if (editFormData.value.label !== editingTask.value.label) {
      updates.label = editFormData.value.label.trim()
    }
    if (editFormData.value.description !== (editingTask.value.description || '')) {
      updates.description = editFormData.value.description.trim()
    }
    if (editFormData.value.step !== editingTask.value.step) {
      updates.step = editFormData.value.step
    }
    
    // Manager-only fields
    if (user.value?.type === 'manager') {
      if (editFormData.value.assignedTo !== editingTask.value.assignedTo) {
        updates.assignedTo = editFormData.value.assignedTo
      }
      if (editFormData.value.estimatedTime !== editingTask.value.estimatedTime) {
        updates.estimatedTime = Number(editFormData.value.estimatedTime)
      }
    }
    
    // Validate that we have something to update
    if (Object.keys(updates).length === 0) {
      closeTaskEditModal()
      return
    }
    
    // Validate required fields
    if (updates.label !== undefined && !updates.label) {
      updateError.value = 'Task title is required'
      return
    }
    
    // Update task via API
    const updatedTask = await updateTask(editingTask.value.id, updates)
    
    // Update local tasks array
    const taskIndex = tasks.value.findIndex(t => t.id === editingTask.value.id)
    if (taskIndex !== -1) {
      tasks.value[taskIndex] = updatedTask
    }
    
    closeTaskEditModal()
  } catch (err) {
    console.error('Error updating task:', err)
    updateError.value = 'Failed to update task. Please try again.'
  } finally {
    isUpdatingTask.value = false
  }
}

// Lifecycle
onMounted(async () => {
  isLoading.value = true
  try {
    // Load basic data first
    await Promise.all([
      loadUsers(),
      loadProjects()
    ])
    
    // Load teams for manager (if applicable)
    if (user.value?.type === 'manager') {
      await loadTeams()
      await loadManagerProjects()
    }
    
    // Finally load tasks
    await loadTasks()
  } catch (err) {
    error.value = 'Failed to load data'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="kanban-container">
    <div class="kanban-header">
      <h1>{{ user?.type === 'dev' ? 'My Tasks' : user?.type === 'manager' ? 'My Team Tasks' : 'Project Tasks' }} - Kanban Board</h1>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>

    <div v-if="isLoading" class="loading">
      <p>Loading tasks...</p>
    </div>

    <div v-else class="kanban-board">
      <div 
        v-for="column in kanbanColumns" 
        :key="column.id"
        class="kanban-column"
        @dragover="onDragOver"
        @drop="onDrop($event, column.step)"
      >
        <div class="column-header" :style="{ borderTopColor: column.color }">
          <h3>{{ column.name }}</h3>
          <span class="task-count">
            {{ (user?.type === 'dev' || user?.type === 'manager') ? 
                (userTasksByStatus[column.step]?.length || 0) : 
                (tasksByStatus[column.step]?.length || 0) }}
          </span>
        </div>
        
        <div class="column-content">
          <div 
            v-for="task in ((user?.type === 'dev' || user?.type === 'manager') ? userTasksByStatus[column.step] : tasksByStatus[column.step])" 
            :key="task.id"
            class="task-card"
            :class="{ 'clickable': user?.type === 'dev' || user?.type === 'manager' }"
            draggable="true"
            @dragstart="onDragStart($event, task)"
            @dragend="onDragEnd"
            @click="(user?.type === 'dev' || user?.type === 'manager') ? openTaskEditModal(task) : null"
          >
            <div class="task-header">
              <h4 class="task-title">{{ task.label }}</h4>
              <div class="task-status-indicator" :style="{ backgroundColor: getStatusColor(task.step) }"></div>
            </div>
            
            <div class="task-details">
              <p class="task-project">
                <strong>Project:</strong> {{ getProjectName(task.projectID) }}
              </p>
              <p class="task-time">
                <strong>Estimated:</strong> {{ task.estimatedTime }}h
              </p>
              <p v-if="task.assignedTo" class="task-assigned">
                <strong>Assigned to:</strong> {{ getUserName(task.assignedTo) }}
              </p>
              <p v-else class="task-assigned unassigned">
                <strong>Status:</strong> Unassigned
              </p>
            </div>

            <div class="task-footer">
              <span class="task-id">#{{ task.id }}</span>
            </div>
          </div>
          
          <div v-if="!((user?.type === 'dev' || user?.type === 'manager') ? userTasksByStatus[column.step]?.length : tasksByStatus[column.step]?.length)" class="empty-column">
            <p>No tasks in {{ column.name.toLowerCase() }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="kanban-footer">
      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">Total Tasks:</span>
          <span class="stat-value">{{ (user?.type === 'dev' || user?.type === 'manager') ? userTasks.length : tasks.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">In Progress:</span>
          <span class="stat-value">
            {{ (user?.type === 'dev' || user?.type === 'manager') ? 
                (userTasksByStatus[3]?.length || 0) : 
                (tasksByStatus[3]?.length || 0) }}
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Completed:</span>
          <span class="stat-value">
            {{ (user?.type === 'dev' || user?.type === 'manager') ? 
                (userTasksByStatus[5]?.length || 0) : 
                (tasksByStatus[5]?.length || 0) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Task Edit Modal -->
    <Modal 
      :is-visible="showEditModal" 
      title="Edit Task"
      @close="closeTaskEditModal"
    >
      <Alert :message="updateError" type="error" />
      
      <FormGroup label="Task Title" input-id="taskTitle">
        <Input
          id="taskTitle"
          name="taskTitle"
          :value="editFormData.label"
          @update="editFormData.label = $event"
          placeholder="Enter task title"
        />
      </FormGroup>
      
      <FormGroup label="Description" input-id="taskDescription">
        <textarea
          id="taskDescription"
          v-model="editFormData.description"
          class="form-control textarea"
          placeholder="Enter task description (optional)"
          rows="4"
        ></textarea>
      </FormGroup>
      
      <FormGroup label="Status" input-id="taskStatus">
        <select 
          id="taskStatus"
          v-model="editFormData.step"
          class="form-control"
        >
          <option 
            v-for="column in kanbanColumns" 
            :key="column.step" 
            :value="column.step"
          >
            {{ column.name }}
          </option>
        </select>
      </FormGroup>
      
      <!-- Manager-only fields -->
      <template v-if="user?.type === 'manager'">
        <FormGroup label="Assign to Developer" input-id="taskAssignment">
          <select 
            id="taskAssignment"
            v-model="editFormData.assignedTo"
            class="form-control"
          >
            <option :value="null">Unassigned</option>
            <option 
              v-for="dev in availableDevelopers" 
              :key="dev.id" 
              :value="dev.id"
            >
              {{ dev.first_name }} {{ dev.last_name }}
            </option>
          </select>
        </FormGroup>
        
        <FormGroup label="Estimated Time (hours)" input-id="taskTime">
          <Input
            id="taskTime"
            name="taskTime"
            type="number"
            :value="editFormData.estimatedTime"
            @update="editFormData.estimatedTime = Number($event)"
            placeholder="Enter estimated hours"
            min="0"
            step="0.5"
          />
        </FormGroup>
      </template>
      
      <template #footer>
        <Button 
          @click="saveTaskChanges" 
          variant="success"
          label="Save Changes"
          :loading="isUpdatingTask"
        />
        <Button 
          @click="closeTaskEditModal" 
          variant="secondary"
          label="Cancel"
        />
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.kanban-container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.kanban-header {
  margin-bottom: 30px;
}

.kanban-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  margin-bottom: 20px;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #6c757d;
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.kanban-column {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 500px;
}

.column-header {
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-top: 4px solid #007bff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9ecef;
}

.column-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.task-count {
  background-color: #e9ecef;
  color: #495057;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.column-content {
  padding: 16px;
  min-height: 400px;
}

.task-card {
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: grab;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.task-card:active {
  cursor: grabbing;
}

.task-card.clickable {
  cursor: pointer;
}

.task-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.task-card.clickable:active {
  transform: translateY(0);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.task-title {
  margin: 0;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  flex: 1;
  margin-right: 8px;
}

.task-status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.task-details {
  margin-bottom: 12px;
}

.task-details p {
  margin: 6px 0;
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.task-details strong {
  color: #495057;
}

.task-assigned.unassigned {
  color: #dc3545;
  font-style: italic;
}

.task-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f8f9fa;
}

.task-id {
  color: #adb5bd;
  font-size: 0.8rem;
  font-weight: 500;
}

.empty-column {
  text-align: center;
  padding: 40px 20px;
  color: #adb5bd;
  font-style: italic;
}

.kanban-footer {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats {
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.stat-value {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

/* Responsive design */
@media (max-width: 768px) {
  .kanban-container {
    padding: 15px;
  }
  
  .kanban-board {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .column-content {
    padding: 12px;
  }
  
  .task-card {
    padding: 12px;
  }
  
  .stats {
    gap: 20px;
  }
}

/* Drag and drop visual feedback */
.task-card.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

.kanban-column.drag-over {
  background-color: rgba(0, 123, 255, 0.1);
}

/* Form styles for modal */
.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  color: #2d3748;
  background-color: #ffffff;
  transition: all 0.2s;
  outline: none;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}
</style>