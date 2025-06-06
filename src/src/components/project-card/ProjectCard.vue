<template>
  <div class="project-card">
    <!-- Edit Mode -->
    <div v-if="isEditing" class="edit-mode">
      <FormGroup label="Project Name" input-id="edit-project-name">
        <Input
          id="edit-project-name"
          name="edit-project-name"
          :value="editData.project_name"
          @update="$emit('update-name', $event)"
          placeholder="Enter project name"
        />
      </FormGroup>
      
      <FormGroup label="Assigned Team" input-id="edit-team-select">
        <select 
          id="edit-team-select" 
          :value="editData.team_id"
          @change="$emit('update-team', parseInt($event.target.value))"
          class="form-control"
        >
          <option 
            v-for="team in teams" 
            :key="team.id" 
            :value="team.id"
          >
            {{ team.name }} ({{ team.members?.length || 0 }} members)
          </option>
        </select>
      </FormGroup>
      
      <div class="card-actions">
        <Button 
          label="Save" 
          @click="$emit('save')"
          variant="success"
          :loading="loading"
        />
        <Button 
          label="Cancel" 
          @click="$emit('cancel')"
          variant="secondary"
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
          @click="$emit('edit')"
          variant="primary"
        />
        <Button 
          label="Delete" 
          @click="$emit('delete')"
          variant="danger"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import FormGroup from '../form/FormGroup.vue'
import Input from '../input/input.vue'
import Button from '../button/button.vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  teams: {
    type: Array,
    default: () => []
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  editData: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit', 'delete', 'save', 'cancel', 'update-name', 'update-team'])

// Get team name by ID
const getTeamName = (teamId) => {
  const team = props.teams.find(t => t.id === teamId)
  return team ? team.name : 'Unknown Team'
}
</script>

<style scoped>
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

/* Responsive Design */
@media (max-width: 768px) {
  .card-actions {
    flex-direction: column;
  }
}
</style>
