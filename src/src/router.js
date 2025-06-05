import { createMemoryHistory, createRouter } from 'vue-router'

import Auth from './page/Auth.vue'
import Kanban from './page/Kanban.vue'

const routes = [
  { path: '/', component: Auth },
  { path: '/kanban', component: Kanban },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router