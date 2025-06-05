<template>
  <div class="team-card">
    <div class="team-header">
      <h3 class="team-name">{{ team.name }}</h3>
      <span class="team-id">#{{ team.id }}</span>
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
      <h4>Assigned Projects</h4>
      <div v-if="teamProjects.length === 0" class="no-projects">
        <p>No projects assigned to this team yet.</p>
      </div>
      <div v-else class="projects-list">
        <div 
          v-for="project in teamProjects" 
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
