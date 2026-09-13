import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  { path: '/', name: 'splash', component: () => import('@/views/splash/index.vue') },
  { path: '/login', name: 'login', component: () => import('@/views/login/index.vue') },
  {
    path: '/avatar-select',
    name: 'avatar-select',
    component: () => import('@/views/avatar-select/index.vue'),
  },
  {
    path: '/id-card-issue',
    name: 'id-card-issue',
    component: () => import('@/views/id-card-issue/index.vue'),
  },
  { path: '/id-card', name: 'id-card', component: () => import('@/views/id-card/index.vue') },
  { path: '/level', name: 'level', component: () => import('@/views/level/index.vue') },
  {
    path: '/circles/:key',
    name: 'circle-detail',
    component: () => import('@/views/circle-detail/index.vue'),
  },
  {
    path: '/post-create',
    name: 'post-create',
    component: () => import('@/views/post-create/index.vue'),
  },
  {
    path: '/post-detail/:id',
    name: 'post-detail',
    component: () => import('@/views/post-detail/index.vue'),
  },
  {
    path: '/guestbook',
    name: 'guestbook',
    component: () => import('@/views/guestbook/index.vue'),
  },
  {
    path: '/border-select',
    name: 'border-select',
    component: () => import('@/views/border-select/index.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/settings/index.vue'),
  },
  {
    path: '/u/:name',
    name: 'user-home',
    component: () => import('@/views/user-home/index.vue'),
  },
  // 旧入口(我的页 / 我的内容页)已并入用户主页,一律重定向到自己
  { path: '/profile', redirect: () => '/u/' + encodeURIComponent(useUserStore().nickname) },
  { path: '/my-content', redirect: () => '/u/' + encodeURIComponent(useUserStore().nickname) },
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('@/views/admin/dashboard.vue') },
      { path: 'users', name: 'admin-users', component: () => import('@/views/admin/users.vue') },
      { path: 'content', name: 'admin-content', component: () => import('@/views/admin/content.vue') },
      { path: 'borders', name: 'admin-borders', component: () => import('@/views/admin/borders.vue') },
      { path: 'avatars', name: 'admin-avatars', component: () => import('@/views/admin/avatars.vue') },
      { path: 'idcards', name: 'admin-idcards', component: () => import('@/views/admin/idcards.vue') },
      { path: 'circles', name: 'admin-circles', component: () => import('@/views/admin/circles.vue') },
      { path: 'activities', name: 'admin-activities', component: () => import('@/views/admin/activities.vue') },
      { path: 'notices', name: 'admin-notices', component: () => import('@/views/admin/notices.vue') },
      { path: 'settings', name: 'admin-settings', component: () => import('@/views/admin/settings.vue') },
    ],
  },
  { path: '/home', name: 'home', component: () => import('@/views/home/index.vue'), meta: { tab: true } },
  { path: '/circles', name: 'circles', component: () => import('@/views/circles/index.vue'), meta: { tab: true } },
  { path: '/checkin', name: 'checkin', component: () => import('@/views/checkin/index.vue'), meta: { tab: true } },
  { path: '/messages', name: 'messages', component: () => import('@/views/messages/index.vue'), meta: { tab: true } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 全局守卫:登录 → 选头像 → 领身份证,三步走完才放行主社区
router.beforeEach((to) => {
  const user = useUserStore()

  if (to.name === 'splash') return true

  if (!user.isLoggedIn) {
    return to.name === 'login' ? true : { name: 'login' }
  }

  if (!user.hasIdCard) {
    // 首次流程:选完头像看颁发动画,中途不允许跳去别的页面
    if (to.name === 'avatar-select') return true
    if (to.name === 'id-card-issue') {
      // 守卫加固:没选过头像不允许进颁发页
      return user.avatarCode || user.customAvatar ? true : { name: 'avatar-select' }
    }
    return { name: user.avatarCode || user.customAvatar ? 'id-card-issue' : 'avatar-select' }
  }

  if (to.name === 'login' || to.name === 'id-card-issue') return { name: 'home' }

  // 管理后台:仅管理员角色(核心长老/大长老)可进
  if (to.path.startsWith('/admin')) {
    const role = user.roleType || 'user'
    if (!['grand_elder', 'core_elder'].includes(role)) return { name: 'home' }
  }

  return true
})

export default router
