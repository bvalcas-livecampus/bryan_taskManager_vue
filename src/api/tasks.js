// Tasks API functions
const API_BASE_URL = 'http://localhost:3000'

// Fetch all tasks
export const fetchTasks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`)
    if (response.ok) {
      console.log('Tasks fetched successfully')
      return await response.json()
    } else {
      throw new Error('Failed to fetch tasks')
    }
  } catch (err) {
    console.error('Error fetching tasks:', err)
    throw err
  }
}

// Fetch tasks by user ID
export const fetchTasksByUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks?assignedTo=${userId}`)
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to fetch user tasks')
    }
  } catch (err) {
    console.error('Error fetching user tasks:', err)
    throw err
  }
}

// Fetch tasks by project ID
export const fetchTasksByProject = async (projectId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks?projectID=${projectId}`)
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to fetch project tasks')
    }
  } catch (err) {
    console.error('Error fetching project tasks:', err)
    throw err
  }
}

// Update task status
export const updateTaskStatus = async (taskId, newStep) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ step: newStep })
    })
    
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to update task')
    }
  } catch (err) {
    console.error('Error updating task:', err)
    throw err
  }
}

// Create a new task
export const createTask = async (taskData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData)
    })
    
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to create task')
    }
  } catch (err) {
    console.error('Error creating task:', err)
    throw err
  }
}

// Update task
export const updateTask = async (taskId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    })
    
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to update task')
    }
  } catch (err) {
    console.error('Error updating task:', err)
    throw err
  }
}

// Delete task
export const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      return true
    } else {
      throw new Error('Failed to delete task')
    }
  } catch (err) {
    console.error('Error deleting task:', err)
    throw err
  }
}

// Get task by ID
export const getTaskById = async (taskId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`)
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to fetch task')
    }
  } catch (err) {
    console.error('Error fetching task:', err)
    throw err
  }
}
