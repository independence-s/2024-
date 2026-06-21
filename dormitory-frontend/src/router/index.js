import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', redirect: '/dashboard' },
      {
        path: 'dashboard',
        component: () => import('../views/Dashboard.vue')
      },
      {
        path: 'students',
        component: () => import('../views/Students.vue')
      },
      {
        path: 'rooms',
        component: () => import('../views/Rooms.vue')
      },
      {
        path: 'buildings',
        component: () => import('../views/Buildings.vue')
      },
      {
        path: 'rooms',
        component: () => import('../views/Rooms.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router