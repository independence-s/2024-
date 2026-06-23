import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
// 判断是否已登录
const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}

const routes = [
   {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: MainLayout,
    meta:{requiresAuth:true},
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

//路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

export default router