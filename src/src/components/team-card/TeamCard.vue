<template>
  <div class="team-card">
    <div class="team-header">
      <h3 class="team-name">{{ team.name }}</h3>
    </div>
    
    <div class="team-info">
      <div class="members-info">
        <strong>Team Members:</strong> {{ team.members.length }} developers
      </div>
      
      <div v-if="showManagerInfo" class="manager-info">
        <strong>Manager:</strong> {{ getManagerName(team.managerID) }}
      </div>
    </div>
    
    <!-- Projects assigned to this team -->
    <div class="team-projects">
      <h4>Assigned Projects ({{ teamProjects.length }})</h4>
      <div v-if="teamProjects.length === 0" class="no-projects">
        <div class="empty-state">
          <span class="empty-icon">📁</span>
          <p>No projects assigned yet</p>
        </div>
      </div>
      <div v-else class="projects-list">
        <div 
          v-for="project in teamProjects" 
          :key="project.id"
          class="project-item"
        >
          <div class="project-header">
            <span class="project-name">{{ project.project_name }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="team-footer">
      <!-- Quick Stats -->
      <div class="team-stats">
        <div class="stat-item">
          <span class="stat-label">Active Projects:</span>
          <span class="stat-value">{{ teamProjects.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Team Size:</span>
          <span class="stat-value">{{ team.members.length }}</span>
        </div>
      </div>
      
      <!-- Actions slot for admin actions -->
      <div v-if="$slots.actions" class="team-actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>

// Get manager name by ID
const getManagerName = (managerId) => {
  const manager = props.users.find(u => u.id === managerId)
  return manager ? `${manager.first_name} ${manager.last_name}` : `Manager #${managerId}`
}

// Access props
const props = defineProps({
  team: {
    type: Object,
    required: true
  },
  teamProjects: {
    type: Array,
    default: () => []
  },
  showManagerInfo: {
    type: Boolean,
    default: false
  },
  users: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.no-projects {
  margin: 0.5rem 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.6;
}

.no-projects p {
  color: #a0aec0;
  font-style: italic;
  font-size: 0.875rem;
  margin: 0;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 200px;
  height: 200px;
  overflow-y: auto;
  padding: 0.25rem;
}

.project-item {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem;
  transition: all 0.2s;
}

.project-item:hover {
  transform: translateX(2px);
  border-color: #cbd5e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-name {
  color: #2d3748;
  font-weight: 600;
  font-size: 0.9rem;
  flex: 1;
}

.project-id {
  background: #e2e8f0;
  color: #4a5568;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.project-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background: #c6f6d5;
  color: #22543d;
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

/* Team Actions */
.team-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

/* Responsive Design */
@media (max-width: 768px) {
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
