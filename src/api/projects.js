// Projects API functions
const API_BASE_URL = 'http://localhost:3000'

// Fetch all projects
export const fetchProjects = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/Projects`)
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to fetch projects')
    }
  } catch (err) {
    console.error('Error fetching projects:', err)
    throw err
  }
}

// Fetch projects by team ID
export const fetchProjectsByTeam = async (teamId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Projects?team_id=${teamId}`)
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to fetch team projects')
    }
  } catch (err) {
    console.error('Error fetching team projects:', err)
    throw err
  }
}

// Get project by ID
export const getProjectById = async (projectId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Projects/${projectId}`)
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to fetch project')
    }
  } catch (err) {
    console.error('Error fetching project:', err)
    throw err
  }
}

// Create a new project
export const createProject = async (projectData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData)
    })
    
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to create project')
    }
  } catch (err) {
    console.error('Error creating project:', err)
    throw err
  }
}

// Update project
export const updateProject = async (projectId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Projects/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    })
    
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to update project')
    }
  } catch (err) {
    console.error('Error updating project:', err)
    throw err
  }
}

// Delete project
export const deleteProject = async (projectId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Projects/${projectId}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      return true
    } else {
      throw new Error('Failed to delete project')
    }
  } catch (err) {
    console.error('Error deleting project:', err)
    throw err
  }
}
