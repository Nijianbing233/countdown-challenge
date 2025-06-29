import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import TaskList from '../views/TaskList.vue'
import Stats from '../views/Stats.vue'

const routes = [
  { path: '/login', component: Login },
  { path: '/tasks', component: TaskList },
  { path: '/stats', component: Stats },
  { path: '/', redirect: '/tasks' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path !== '/login' && localStorage.getItem('back_token') !== 'ok') {
    next('/login')
  } else {
    next()
  }
})

export default router 