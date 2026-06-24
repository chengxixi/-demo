import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { title: '仪表盘', icon: 'dashboard' },
    },
    {
      path: '/feedback',
      name: 'FeedbackList',
      component: () => import('@/views/FeedbackList.vue'),
      meta: { title: '反馈清单', icon: 'feedback' },
    },
    {
      path: '/tickets',
      name: 'TicketPool',
      component: () => import('@/views/TicketPool.vue'),
      meta: { title: '工单池', icon: 'ticket' },
    },
    {
      path: '/exceptions',
      name: 'ExceptionHandling',
      component: () => import('@/views/ExceptionHandling.vue'),
      meta: { title: '异常处理', icon: 'exception' },
    },
    {
      path: '/requirements',
      name: 'Requirements',
      component: () => import('@/views/Requirements.vue'),
      meta: { title: '需求管理', icon: 'requirements' },
    },
    {
      path: '/competition',
      name: 'CompetitiveAnalysis',
      component: () => import('@/views/CompetitiveAnalysis.vue'),
      meta: { title: '竞争分析', icon: 'competition' },
    },
    {
      path: '/reports',
      name: 'ReportCenter',
      component: () => import('@/views/ReportCenter.vue'),
      meta: { title: '报告中心', icon: 'report' },
    },
    {
      path: '/qa',
      name: 'QaCase',
      component: () => import('@/views/QaCase.vue'),
      meta: { title: 'Q&A/案例库', icon: 'qa' },
    },
    {
      path: '/settings',
      name: 'SystemConfig',
      component: () => import('@/views/SystemConfig.vue'),
      meta: { title: '系统配置', icon: 'settings' },
    },
  ],
});

export default router;
