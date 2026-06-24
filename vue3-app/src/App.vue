<template>
  <div :class="navStore.collapsed ? 'app-shell sidebar-collapsed' : 'app-shell'">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div>
          <strong>反馈管理系统</strong>
          <span>Feedback Management</span>
        </div>
      </div>

      <nav class="side-nav">
        <button
          v-for="item in navItems"
          :key="item.id"
          :class="['nav-item', { active: isActive(item.id) }]"
          @click="navigateTo(item.id)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="item.iconPath"></svg>
          <span>{{ item.label }}</span>
          <em v-if="item.badge">{{ item.badge }}</em>
        </button>
      </nav>

      <div class="sidebar-footer">
        <button class="collapse-button" :title="navStore.collapsed ? '展开菜单' : '收起菜单'" @click="navStore.toggle()">
          <svg v-if="!navStore.collapsed" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </aside>

    <main class="workspace">
      <AppHeader />
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { useNavStore } from '@/stores/nav';
import AppHeader from '@/components/AppHeader.vue';

const router = useRouter();
const route = useRoute();
const navStore = useNavStore();

interface NavItem {
  id: string;
  label: string;
  path: string;
  iconPath: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'home', label: '仪表盘', path: '/dashboard', iconPath: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>' },
  { id: 'feedback', label: '反馈清单', path: '/feedback', iconPath: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>', badge: 18 },
  { id: 'tickets', label: '工单池', path: '/tickets', iconPath: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>', badge: 7 },
  { id: 'exceptions', label: '异常处理', path: '/exceptions', iconPath: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>', badge: 5 },
  { id: 'requirements', label: '需求管理', path: '/requirements', iconPath: '<polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/>' },
  { id: 'competitors', label: '竞争分析', path: '/competition', iconPath: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' },
  { id: 'reports', label: '报告中心', path: '/reports', iconPath: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><polyline points="10 9 9 9 8 9"/>' },
  { id: 'knowledge', label: 'Q&A/案例库', path: '/qa', iconPath: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>' },
  { id: 'settings', label: '系统配置', path: '/settings', iconPath: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>' },
];

const pageIdMap: Record<string, string> = {
  'dashboard': 'home',
  'feedback': 'feedback',
  'tickets': 'tickets',
  'exceptions': 'exceptions',
  'requirements': 'requirements',
  'competition': 'competitors',
  'reports': 'reports',
  'qa': 'knowledge',
  'settings': 'settings',
};

const isActive = (id: string): boolean => {
  const routeName = (route.name as string) || '';
  return pageIdMap[routeName] === id;
};

const navigateTo = (id: string): void => {
  const item = navItems.find((n) => n.id === id);
  if (item) {
    router.push(item.path);
  }
};
</script>
