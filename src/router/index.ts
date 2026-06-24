import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: () => import('@/pages/DashboardPage.vue'), meta: { title: '仪表盘' } },
    { path: '/feedback', name: 'feedback', component: () => import('@/pages/FeedbackPage.vue'), meta: { title: '反馈清单' } },
    { path: '/workorders', name: 'workorders', component: () => import('@/pages/TicketsPage.vue'), meta: { title: '工单池' } },
    { path: '/emergency', name: 'emergency', component: () => import('@/pages/ExceptionsPage.vue'), meta: { title: '紧急异常处理' } },
    { path: '/requirements', name: 'requirements', component: () => import('@/pages/RequirementsPage.vue'), meta: { title: '需求管理' } },
    { path: '/competitors', name: 'competitors', component: () => import('@/pages/CompetitorsPage.vue'), meta: { title: '竞品分析/差评聚类' } },
    { path: '/reports', name: 'reports', component: () => import('@/pages/ReportsPage.vue'), meta: { title: '报告中心' } },
    { path: '/knowledge', name: 'knowledge', component: () => import('@/pages/KnowledgePage.vue'), meta: { title: 'Q&A/案例库' } },
    { path: '/settings', name: 'settings', component: () => import('@/pages/SettingsPage.vue'), meta: { title: '系统配置' } },
  ],
})

export default router
