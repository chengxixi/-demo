import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'dashboard',
            component: () => import('@/pages/dashboard/DashboardPage.vue'),
            meta: { title: '仪表盘' },
        },
        {
            path: '/feedback',
            name: 'feedback',
            component: () => import('@/pages/FeedbackPage.vue'),
            meta: { title: '反馈清单', keepAlive: true },
        },
        {
            path: '/workorders',
            name: 'workorders',
            component: () => import('@/pages/workorders/WorkOrdersPage.vue'),
            meta: { title: '工单池', keepAlive: true },
        },
        {
            path: '/emergency',
            name: 'emergency',
            component: () => import('@/pages/emergency/EmergencyPage.vue'),
            meta: { title: '紧急异常处理', keepAlive: true },
        },
        {
            path: '/requirements',
            name: 'requirements',
            component: () => import('@/pages/requirements/RequirementsPage.vue'),
            meta: { title: '需求管理', keepAlive: true },
        },
        {
            path: '/competitors',
            name: 'competitors',
            component: () => import('@/pages/competitors/CompetitorsPage.vue'),
            meta: { title: '竞品分析/差评聚类', keepAlive: true },
        },
        {
            path: '/reports',
            name: 'reports',
            component: () => import('@/pages/reports/ReportsPage.vue'),
            meta: { title: '报告中心' },
        },
        {
            path: '/knowledge',
            name: 'knowledge',
            component: () => import('@/pages/KnowledgePage.vue'),
            meta: { title: 'Q&A/案例库' },
        },
        {
            path: '/settings',
            name: 'settings',
            component: () => import('@/pages/settings/SettingsPage.vue'),
            meta: { title: '系统配置' },
        },
    ],
});

export default router;
