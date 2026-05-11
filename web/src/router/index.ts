import { createRouter, createWebHistory } from 'vue-router'
import ScheduleView from '../views/ScheduleView.vue'
import StaffView from '../views/StaffView.vue'

const routes = [
  { path: '/', redirect: '/schedule' },
  { path: '/schedule', name: 'Schedule', component: ScheduleView },
  { path: '/staff', name: 'Staff', component: StaffView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
