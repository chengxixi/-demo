<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  House,
  ClipboardList,
  TicketCheck,
  ShieldAlert,
  ListChecks,
  TrendingUp,
  FileChartColumnIncreasing,
  BookOpen,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Bell,
  MessageSquarePlus,
  ChevronDown,
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const collapsed = ref(false);

interface NavItem {
  id: string;
  label: string;
  icon: typeof House;
  path: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'home', label: '首页', icon: House, path: '/' },
  { id: 'feedback', label: '反馈清单', icon: ClipboardList, path: '/feedback', badge: 7 },
  { id: 'tickets', label: '工单池', icon: TicketCheck, path: '/tickets', badge: 3 },
  { id: 'exceptions', label: '异常处理', icon: ShieldAlert, path: '/exceptions', badge: 2 },
  { id: 'requirements', label: '需求管理', icon: ListChecks, path: '/requirements', badge: 3 },
  { id: 'competitors', label: '竞品分析', icon: TrendingUp, path: '/competitors' },
  { id: 'reports', label: '报告中心', icon: FileChartColumnIncreasing, path: '/reports' },
  { id: 'knowledge', label: 'Q&A/案例库', icon: BookOpen, path: '/knowledge' },
  { id: 'settings', label: '系统配置', icon: Settings, path: '/settings' },
];

const currentPage = computed(() => {
  const item = navItems.find((n) => n.path === route.path);
  return item?.label || '首页';
});
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- 侧边栏 -->
    <aside
      :class="[
        'flex flex-col bg-white border-r border-gray-200 transition-all duration-200 z-20',
        collapsed ? 'w-16' : 'w-56',
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center h-14 px-4 border-b border-gray-100 shrink-0">
        <div class="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
          <span class="text-white text-sm font-bold">FM</span>
        </div>
        <transition name="fade">
          <span v-if="!collapsed" class="ml-3 font-semibold text-gray-800 text-base whitespace-nowrap">
            反馈管理系统
          </span>
        </transition>
      </div>

      <!-- 导航 -->
      <nav class="flex-1 overflow-y-auto py-3 px-2">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="router.push(item.path)"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-colors',
            route.path === item.path
              ? 'bg-brand-50 text-brand-700 font-medium'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800',
          ]"
        >
          <component :is="item.icon" :size="20" class="shrink-0" />
          <transition name="fade">
            <span v-if="!collapsed" class="flex-1 text-left whitespace-nowrap">{{ item.label }}</span>
          </transition>
          <span
            v-if="item.badge && !collapsed"
            class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full bg-brand-100 text-brand-600"
          >
            {{ item.badge }}
          </span>
        </button>
      </nav>

      <!-- 折叠按钮 -->
      <button
        @click="collapsed = !collapsed"
        class="flex items-center justify-center h-10 border-t border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <PanelLeftClose v-if="!collapsed" :size="18" />
        <PanelLeftOpen v-else :size="18" />
      </button>
    </aside>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶栏 -->
      <header class="flex items-center justify-between h-14 px-6 bg-white border-b border-gray-200 shrink-0">
        <div class="flex items-center gap-4">
          <h1 class="text-lg font-semibold text-gray-800">{{ currentPage }}</h1>
          <div class="flex items-center gap-2 text-xs text-gray-400">
            <span class="px-2 py-0.5 bg-gray-100 rounded">{{ route.path }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Search :size="18" />
          </button>
          <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors relative">
            <Bell :size="18" />
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button class="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
            <MessageSquarePlus :size="16" />
            <span>新增反馈</span>
          </button>
          <div class="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div class="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
              <span class="text-brand-700 text-xs font-bold">AD</span>
            </div>
            <ChevronDown :size="14" class="text-gray-400" />
          </div>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="flex-1 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
