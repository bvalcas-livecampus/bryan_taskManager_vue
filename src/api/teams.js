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

// Fetch teams that contain a specific user as a member
export const fetchTeamsByMember = async (userId) => {
  try {
    const teams = await fetchTeams()
    return teams.filter(team => 
      team.members && team.members.includes(parseInt(userId))
    )
  } catch (err) {
    console.error('Error fetching teams by member:', err)
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

// Remove user from all teams (utility for user deletion)
export const removeUserFromAllTeams = async (userId) => {
  try {
    const teams = await fetchTeams()
    const teamsToUpdate = teams.filter(team => 
      team.members && team.members.includes(parseInt(userId))
    )
    
    const updatePromises = teamsToUpdate.map(team => {
      const updatedMembers = team.members.filter(memberId => memberId !== parseInt(userId))
      return updateTeam(team.id, { members: updatedMembers })
    })
    
    await Promise.all(updatePromises)
    return teamsToUpdate // Return the teams that were updated
  } catch (err) {
    console.error('Error removing user from all teams:', err)
    throw err
  }
}
