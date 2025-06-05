import { getAuthToken, setAuthToken, removeAuthToken } from '../db/auth'
import { getUser, setUser, removeUser } from '../db/user'

// Authentication API routes
const API_BASE_URL = 'http://localhost:3000' // Change this to your actual API URL

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken()
  return !!token
}

// Login function
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      })
    })

    const data = await response.json()

    if (response.ok) {
      // Store the token if login successful
      if (data.accessToken) {
        setAuthToken(data.accessToken)
      }
      if (data.user) {
        setUser(data.user)
      }
      return {
        success: true,
        data: data,
        user: data.user,
        token: data.accessToken
      }
    } else {
      return {
        success: false,
        error: data.message || 'Login failed'
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'Network error. Please try again.'
    }
  }
}

// Signup function
export const signup = async (email, password, name) => {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name
      })
    })

    const data = await response.json()

    if (response.ok) {
      // Optionally auto-login after signup
      if (data.accessToken) {
        setAuthToken(data.accessToken)
      }
      if (data.user) {
        setUser(data.user)
      }
      return {
        success: true,
        data: data,
        user: data.user,
        token: data.accessToken
      }
    } else {
      return {
        success: false,
        error: data.message || 'Signup failed'
      }
    }
  } catch (error) {
    console.error('Signup error:', error)
    return {
      success: false,
      error: 'Network error. Please try again.'
    }
  }
}

// Logout function
export const logout = async () => {
  try {
    const token = getAuthToken()
    
    if (token) {
      // Remove token from localStorage
      removeAuthToken()
    }
    
    
    return {
      success: true
    }
  } catch (error) {
    console.error('Logout error:', error)
    // Still remove token even if API call fails
    removeAuthToken()
    return {
      success: true
    }
  }
}
