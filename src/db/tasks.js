import { ref } from 'vue'

const tasks = ref([])

// Default tasks structure
const defaultTasks = [
  {
    id: 1,
    title: "Exemple de tâche",
    description: "Ceci est un exemple de tâche",
    done: false,
    createdAt: new Date().toISOString()
  }
]

// Get tasks from localStorage (since we can't directly write files in browser)
export function getTasks() {
  try {
    const storedTasks = localStorage.getItem('tasks')
    if (storedTasks) {
      tasks.value = JSON.parse(storedTasks)
    } else {
      tasks.value = [...defaultTasks]
      saveTasks()
    }
    return tasks.value
  } catch (error) {
    console.error('Error loading tasks:', error)
    tasks.value = [...defaultTasks]
    return tasks.value
  }
}

// Save tasks to localStorage
export function saveTasks() {
  try {
    localStorage.setItem('tasks', JSON.stringify(tasks.value))
    return true
  } catch (error) {
    console.error('Error saving tasks:', error)
    return false
  }
}

// Add a new task
export function addTask(taskData) {
  const newTask = {
    id: Date.now(),
    title: taskData.title,
    description: taskData.description || '',
    done: false,
    createdAt: new Date().toISOString(),
    ...taskData
  }
  
  tasks.value.push(newTask)
  saveTasks()
  return newTask
}

// Update an existing task
export function updateTask(taskId, updates) {
  const index = tasks.value.findIndex(task => task.id === taskId)
  if (index !== -1) {
    tasks.value[index] = {
      ...tasks.value[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    saveTasks()
    return tasks.value[index]
  }
  return null
}

// Delete a task
export function deleteTask(taskId) {
  const index = tasks.value.findIndex(task => task.id === taskId)
  if (index !== -1) {
    const deletedTask = tasks.value.splice(index, 1)[0]
    saveTasks()
    return deletedTask
  }
  return null
}

// Toggle task completion
export function toggleTask(taskId) {
  const task = tasks.value.find(task => task.id === taskId)
  if (task) {
    task.done = !task.done
    task.updatedAt = new Date().toISOString()
    saveTasks()
    return task
  }
  return null
}

// Get task by ID
export function getTaskById(taskId) {
  return tasks.value.find(task => task.id === taskId) || null
}

// Clear all tasks
export function clearTasks() {
  tasks.value = []
  saveTasks()
  return true
}

// Export/Download tasks as JSON file
export function exportTasks() {
  const dataStr = JSON.stringify(tasks.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'tasks.json'
  link.click()
  URL.revokeObjectURL(url)
}

// Import tasks from JSON file
export function importTasks(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedTasks = JSON.parse(e.target.result)
        if (Array.isArray(importedTasks)) {
          tasks.value = importedTasks
          saveTasks()
          resolve(tasks.value)
        } else {
          reject(new Error('Invalid JSON format'))
        }
      } catch (error) {
        reject(error)
      }
    }
    reader.readAsText(file)
  })
}

// Initialize tasks on module load
getTasks()

// Export reactive tasks ref
export { tasks }