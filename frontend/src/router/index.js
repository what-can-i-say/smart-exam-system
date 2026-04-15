import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '学习仪表盘', icon: 'DataBoard' }
      },
      
      // 刷题练习
      {
        path: 'practice',
        name: 'Practice',
        redirect: '/practice/start',
        meta: { title: '刷题练习', icon: 'Edit' },
        children: [
          {
            path: 'start',
            name: 'PracticeStart',
            component: () => import('../views/practice/Start.vue'), 
            meta: { title: '开始刷题' }
          },
          {
            path: 'doing',
            name: 'PracticeDoing',
            component: () => import('@/views/practice/Doing.vue'),
            meta: { title: '答题中' }
          },
          {
            path: 'result',
            name: 'PracticeResult',
            component: () => import('@/views/practice/Result.vue'),
            meta: { title: '练习结果' }
          }
        ]
      },
      
      // 智能复习
      {
        path: 'review',
        name: 'Review',
        component: () => import('@/views/review/index.vue'),
        meta: { title: '智能复习' }
      },
      // 智能复习 - 答题页面
      {
        path: 'review/doing',
        name: 'ReviewDoing',
        component: () => import('../views/review/Doing.vue'),
        meta: { title: '复习答题' }
      },
      // 错题本
      {
        path: 'notebook',
        name: 'Notebook',
        component: () => import('@/views/notebook/index.vue'),
        meta: { title: '错题本', icon: 'Notebook' }
      },
      
      // 靶向分析
      {
        path: 'analysis',
        name: 'Analysis',
        component: () => import('@/views/analysis/index.vue'),
        meta: { title: '靶向分析', icon: 'PieChart' }
      },
      
      // 个人中心
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', icon: 'User' }
      }
    ]
  },
  
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404' }
  },
  
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  document.title = to.meta.title ? `${to.meta.title} - 考研智能刷题` : '考研智能刷题'
  
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router