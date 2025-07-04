
// Store auth token in localStorage
export const getUser = () => {
  return JSON.parse(localStorage.getItem('user'))
}

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user))
}

export const removeUser = () => {
  localStorage.removeItem('user')
}
