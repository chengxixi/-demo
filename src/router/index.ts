import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/feedback',
      name: 'feedback',
      component: () => import('@/pages/FeedbackPage.vue'),
    },
    {
      path: '/tickets',
      name: 'tickets',
      component: () => import('@/pages/TicketsPage.vue'),
    },
    {
      path: '/exceptions',
      name: 'exceptions',
      component: () => import('@/pages/ExceptionsPage.vue'),
    },
    {
      path: '/requirements',
      name: 'requirements',
      component: () => import('@/pages/RequirementsPage.vue'),
    },
    {
      path: '/competitors',
      name: 'competitors',
      component: () => import('@/pages/CompetitorsPage.vue'),
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('@/pages/ReportsPage.vue'),
    },
    {
      path: '/knowledge',
      name: 'knowledge',
      component: () => import('@/pages/KnowledgePage.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/pages/SettingsPage.vue'),
    },
  ],
});

export default router;
