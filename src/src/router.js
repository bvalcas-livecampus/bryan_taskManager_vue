import { createMemoryHistory, createRouter } from 'vue-router'

import Auth from './page/Auth.vue'
import Dashboard from './page/Dashboard.vue'
import Kanban from './page/Kanban.vue'
import Projects from './page/Projects.vue'
import Tasks from './page/Tasks.vue'
import Users from './page/Users.vue'
import Teams from './page/Teams.vue'

const routes = [
  { path: '/', component: Auth },
  { path: '/dashboard', component: Dashboard },
  { path: '/kanban', component: Kanban },
  { path: '/projects', component: Projects },
  { path: '/tasks', component: Tasks },
  { path: '/users', component: Users },
  { path: '/teams', component: Teams },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router