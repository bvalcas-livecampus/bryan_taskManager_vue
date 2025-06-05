// Users API functions
const API_BASE_URL = 'http://localhost:3000'

// Fetch all users
export const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`)
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to fetch users')
    }
  } catch (err) {
    console.error('Error fetching users:', err)
    throw err
  }
}

// Fetch users by type (dev, manager, admin)
export const fetchUsersByType = async (userType) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users?type=${userType}`)
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error(`Failed to fetch ${userType} users`)
    }
  } catch (err) {
    console.error(`Error fetching ${userType} users:`, err)
    throw err
  }
}

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`)
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to fetch user')
    }
  } catch (err) {
    console.error('Error fetching user:', err)
    throw err
  }
}

// Create a new user
export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    })
    
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to create user')
    }
  } catch (err) {
    console.error('Error creating user:', err)
    throw err
  }
}

// Update user
export const updateUser = async (userId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    })
    
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to update user')
    }
  } catch (err) {
    console.error('Error updating user:', err)
    throw err
  }
}

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      return true
    } else {
      throw new Error('Failed to delete user')
    }
  } catch (err) {
    console.error('Error deleting user:', err)
    throw err
  }
}
