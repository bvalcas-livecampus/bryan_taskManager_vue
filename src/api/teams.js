// Teams API functions
const API_BASE_URL = 'http://localhost:3000'

// Fetch all teams
export const fetchTeams = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/teams`)
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to fetch teams')
    }
  } catch (err) {
    console.error('Error fetching teams:', err)
    throw err
  }
}

// Fetch teams by manager ID
export const fetchTeamsByManager = async (managerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/teams?managerID=${managerId}`)
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to fetch manager teams')
    }
  } catch (err) {
    console.error('Error fetching manager teams:', err)
    throw err
  }
}

// Get team by ID
export const getTeamById = async (teamId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}`)
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to fetch team')
    }
  } catch (err) {
    console.error('Error fetching team:', err)
    throw err
  }
}

// Create a new team
export const createTeam = async (teamData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData)
    })
    
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to create team')
    }
  } catch (err) {
    console.error('Error creating team:', err)
    throw err
  }
}

// Update team
export const updateTeam = async (teamId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    })
    
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to update team')
    }
  } catch (err) {
    console.error('Error updating team:', err)
    throw err
  }
}

// Delete team
export const deleteTeam = async (teamId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      return true
    } else {
      throw new Error('Failed to delete team')
    }
  } catch (err) {
    console.error('Error deleting team:', err)
    throw err
  }
}

// Add member to team
export const addMemberToTeam = async (teamId, userId) => {
  try {
    const team = await getTeamById(teamId)
    const updatedMembers = [...team.members, userId]
    
    return await updateTeam(teamId, { members: updatedMembers })
  } catch (err) {
    console.error('Error adding member to team:', err)
    throw err
  }
}

// Remove member from team
export const removeMemberFromTeam = async (teamId, userId) => {
  try {
    const team = await getTeamById(teamId)
    const updatedMembers = team.members.filter(memberId => memberId !== userId)
    
    return await updateTeam(teamId, { members: updatedMembers })
  } catch (err) {
    console.error('Error removing member from team:', err)
    throw err
  }
}
