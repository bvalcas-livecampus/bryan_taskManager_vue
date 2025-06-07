<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { Chart, registerables } from 'chart.js'
import { fetchTasks } from '../../api/tasks.js'
import { fetchProjects, fetchProjectsByTeam } from '../../api/projects.js'
import { fetchUsers } from '../../api/users.js'
import { fetchTeamsByManager } from '../../api/teams.js'
import Loading from '../components/loading/Loading.vue'
import Alert from '../components/alert/Alert.vue'

// Register Chart.js components
Chart.register(...registerables)

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

// Chart refs
const taskStatusChart = ref(null)
const teamProductivityChart = ref(null)
const projectProgressChart = ref(null)
const timeEstimationChart = ref(null)

// Charts instances
let taskStatusChartInstance = null
let teamProductivityChartInstance = null
let projectProgressChartInstance = null
let timeEstimationChartInstance = null

// Kanban columns configuration
const kanbanColumns = [
  { id: 1, name: 'Backlog', step: 1, color: '#6c757d' },
  { id: 2, name: 'Todo', step: 2, color: '#007bff' },
  { id: 3, name: 'In Progress', step: 3, color: '#ffc107' },
  { id: 4, name: 'Review', step: 4, color: '#fd7e14' },
  { id: 5, name: 'Done', step: 5, color: '#28a745' }
]

// Computed properties for dashboard data
const managerTasks = computed(() => {
  if (user.value?.type !== 'manager') return []
  return tasks.value.filter(task => managerProjectIds.value.includes(task.projectID))
})

const taskStatusData = computed(() => {
  const statusCounts = {}
  kanbanColumns.forEach(column => {
    statusCounts[column.name] = managerTasks.value.filter(task => task.step === column.step).length
  })
  return statusCounts
})

const teamProductivityData = computed(() => {
  const teamMemberIds = teams.value.flatMap(team => team.members)
  const teamMembers = users.value.filter(u => teamMemberIds.includes(u.id))
  
  return teamMembers.map(member => {
    const memberTasks = managerTasks.value.filter(task => task.assignedTo === member.id)
    const completedTasks = memberTasks.filter(task => task.step === 5).length
    const totalTasks = memberTasks.length
    
    return {
      name: `${member.first_name} ${member.last_name}`,
      completed: completedTasks,
      total: totalTasks,
      productivity: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    }
  })
})

const projectProgressData = computed(() => {
  const managerProjects = projects.value.filter(p => managerProjectIds.value.includes(p.id))
  
  return managerProjects.map(project => {
    const projectTasks = managerTasks.value.filter(task => task.projectID === project.id)
    const completedTasks = projectTasks.filter(task => task.step === 5).length
    const totalTasks = projectTasks.length
    
    return {
      name: project.project_name,
      completed: completedTasks,
      total: totalTasks,
      progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    }
  })
})

const timeEstimationData = computed(() => {
  const estimationRanges = {
    '0-2h': { min: 0, max: 2, count: 0 },
    '3-5h': { min: 3, max: 5, count: 0 },
    '6-10h': { min: 6, max: 10, count: 0 },
    '10+h': { min: 10, max: Infinity, count: 0 }
  }
  
  managerTasks.value.forEach(task => {
    const time = task.estimatedTime || 0
    for (const [range, config] of Object.entries(estimationRanges)) {
      if (time >= config.min && time <= config.max) {
        config.count++
        break
      }
    }
  })
  
  return estimationRanges
})

// Dashboard statistics
const dashboardStats = computed(() => {
  const totalTasks = managerTasks.value.length
  const completedTasks = managerTasks.value.filter(task => task.step === 5).length
  const inProgressTasks = managerTasks.value.filter(task => task.step === 3).length
  const overdueTasks = managerTasks.value.filter(task => task.step < 5 && task.estimatedTime > 8).length // Simple overdue logic
  
  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }
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

// API functions
const loadTasks = async () => {
  try {
    tasks.value = await fetchTasks()
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
    error.value = 'Failed to load projects'
  }
}

const loadTeams = async () => {
  try {
    if (user.value?.type === 'manager') {
      teams.value = await fetchTeamsByManager(user.value.id)
    }
  } catch (err) {
    console.error('Error fetching teams:', err)
    error.value = 'Failed to load teams'
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
    }
  } catch (err) {
    console.error('Error fetching manager projects:', err)
    error.value = 'Failed to load manager projects'
  }
}

const loadUsers = async () => {
  try {
    users.value = await fetchUsers()
  } catch (err) {
    console.error('Error fetching users:', err)
    error.value = 'Failed to load users'
  }
}

// Chart creation functions
const createTaskStatusChart = () => {
  if (taskStatusChartInstance) {
    taskStatusChartInstance.destroy()
  }
  
  const ctx = taskStatusChart.value.getContext('2d')
  const data = taskStatusData.value
  
  taskStatusChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data),
        backgroundColor: kanbanColumns.map(col => col.color),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Task Status Distribution',
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  })
}

const createTeamProductivityChart = () => {
  if (teamProductivityChartInstance) {
    teamProductivityChartInstance.destroy()
  }
  
  const ctx = teamProductivityChart.value.getContext('2d')
  const data = teamProductivityData.value
  
  teamProductivityChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        label: 'Completed Tasks',
        data: data.map(d => d.completed),
        backgroundColor: '#28a745',
        borderColor: '#1e7e34',
        borderWidth: 1
      }, {
        label: 'Total Tasks',
        data: data.map(d => d.total),
        backgroundColor: '#007bff',
        borderColor: '#0056b3',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Team Productivity',
          font: { size: 16, weight: 'bold' }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  })
}

const createProjectProgressChart = () => {
  if (projectProgressChartInstance) {
    projectProgressChartInstance.destroy()
  }
  
  const ctx = projectProgressChart.value.getContext('2d')
  const data = projectProgressData.value
  
  projectProgressChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        label: 'Progress (%)',
        data: data.map(d => d.progress),
        backgroundColor: data.map(d => {
          if (d.progress >= 80) return '#28a745'
          if (d.progress >= 50) return '#ffc107'
          return '#dc3545'
        }),
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Project Progress',
          font: { size: 16, weight: 'bold' }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%'
            }
          }
        }
      }
    }
  })
}

const createTimeEstimationChart = () => {
  if (timeEstimationChartInstance) {
    timeEstimationChartInstance.destroy()
  }
  
  const ctx = timeEstimationChart.value.getContext('2d')
  const data = timeEstimationData.value
  
  timeEstimationChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data).map(d => d.count),
        backgroundColor: ['#17a2b8', '#6f42c1', '#e83e8c', '#fd7e14'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Time Estimation Distribution',
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  })
}

const initializeCharts = () => {
  // Wait for next tick to ensure DOM elements are rendered
  setTimeout(() => {
    createTaskStatusChart()
    createTeamProductivityChart()
    createProjectProgressChart()
    createTimeEstimationChart()
  }, 100)
}

// Lifecycle
onMounted(async () => {
  if (user.value?.type !== 'manager') {
    error.value = 'Dashboard is only available for managers'
    isLoading.value = false
    return
  }
  
  isLoading.value = true
  try {
    // Load basic data first
    await Promise.all([
      loadUsers(),
      loadProjects()
    ])
    
    // Load teams for manager
    await loadTeams()
    await loadManagerProjects()
    
    // Finally load tasks
    await loadTasks()
    
    // Initialize charts after data is loaded
    initializeCharts()
  } catch (err) {
    error.value = 'Failed to load dashboard data'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>Manager Dashboard</h1>
      <p class="dashboard-subtitle">Overview of your team's performance and project progress</p>
    </div>

    <Alert v-if="error" :message="error" type="error" />
    
    <Loading v-if="isLoading" message="Loading dashboard data..." />

    <div v-else-if="user?.type === 'manager'" class="dashboard-content">
      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <h3>{{ dashboardStats.totalTasks }}</h3>
            <p>Total Tasks</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>{{ dashboardStats.completedTasks }}</h3>
            <p>Completed Tasks</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🚀</div>
          <div class="stat-content">
            <h3>{{ dashboardStats.inProgressTasks }}</h3>
            <p>In Progress</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <h3>{{ dashboardStats.completionRate }}%</h3>
            <p>Completion Rate</p>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="charts-grid">
        <!-- Task Status Chart -->
        <div class="chart-container">
          <canvas ref="taskStatusChart"></canvas>
        </div>

        <!-- Team Productivity Chart -->
        <div class="chart-container">
          <canvas ref="teamProductivityChart"></canvas>
        </div>

        <!-- Project Progress Chart -->
        <div class="chart-container">
          <canvas ref="projectProgressChart"></canvas>
        </div>

        <!-- Time Estimation Chart -->
        <div class="chart-container">
          <canvas ref="timeEstimationChart"></canvas>
        </div>
      </div>

      <!-- Team Overview -->
      <div class="team-overview">
        <h2>Team Overview</h2>
        <div class="team-grid">
          <div v-for="team in teams" :key="team.id" class="team-card">
            <h3>{{ team.name }}</h3>
            <p><strong>Members:</strong> {{ team.members.length }}</p>
            <div class="team-members">
              <span v-for="memberId in team.members" :key="memberId" class="member-tag">
                {{ getUserName(memberId) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <h2>Recent Tasks</h2>
        <div class="activity-list">
          <div 
            v-for="task in managerTasks.slice(0, 10)" 
            :key="task.id" 
            class="activity-item"
          >
            <div class="activity-content">
              <h4>{{ task.label }}</h4>
              <p><strong>Project:</strong> {{ getProjectName(task.projectID) }}</p>
              <p><strong>Assigned to:</strong> {{ getUserName(task.assignedTo) }}</p>
            </div>
            <div class="activity-status">
              <span 
                class="status-badge" 
                :style="{ backgroundColor: kanbanColumns.find(col => col.step === task.step)?.color }"
              >
                {{ kanbanColumns.find(col => col.step === task.step)?.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="access-denied">
      <h2>Access Denied</h2>
      <p>This dashboard is only available for managers.</p>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: 30px;
  text-align: center;
}

.dashboard-header h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.dashboard-subtitle {
  color: #6c757d;
  font-size: 1.1rem;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 12px;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

.stat-content p {
  color: #6c757d;
  margin: 4px 0 0 0;
  font-size: 0.9rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 400px;
}

.team-overview {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.team-overview h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.team-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.team-card h3 {
  color: #2c3e50;
  margin-bottom: 12px;
}

.team-card p {
  color: #6c757d;
  margin-bottom: 12px;
}

.team-members {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.member-tag {
  background: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.recent-activity {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recent-activity h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.activity-content h4 {
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-size: 1rem;
}

.activity-content p {
  color: #6c757d;
  margin: 4px 0;
  font-size: 0.9rem;
}

.status-badge {
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.access-denied {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.access-denied h2 {
  color: #dc3545;
  margin-bottom: 16px;
}

.access-denied p {
  color: #6c757d;
}

/* Responsive design */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 15px;
  }
  
  .dashboard-header h1 {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .chart-container {
    height: 300px;
  }
  
  .team-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stat-card {
    padding: 16px;
  }
  
  .stat-icon {
    font-size: 2rem;
    width: 50px;
    height: 50px;
  }
  
  .stat-content h3 {
    font-size: 1.5rem;
  }
  
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
