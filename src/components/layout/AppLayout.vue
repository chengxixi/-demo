<script setup lang="ts">
import { useRoute } from 'vue-router'
import { LayoutDashboard, MessageSquareText, ClipboardList, AlertTriangle, Lightbulb, BarChart3, FileText, BookOpen, Settings } from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/feedback', label: '反馈清单', icon: MessageSquareText },
  { path: '/workorders', label: '工单池', icon: ClipboardList },
  { path: '/emergency', label: '紧急异常处理', icon: AlertTriangle },
  { path: '/requirements', label: '需求管理', icon: Lightbulb },
  { path: '/competitors', label: '竞品分析/差评聚类', icon: BarChart3 },
  { path: '/reports', label: '报告中心', icon: FileText },
  { path: '/knowledge', label: 'Q&A/案例库', icon: BookOpen },
  { path: '/settings', label: '系统配置', icon: Settings },
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-52 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      <div class="px-4 py-5 border-b border-gray-200">
        <h1 class="text-sm font-extrabold text-gray-900 tracking-tight">反馈管理系统</h1>
        <p class="text-[11px] text-gray-400 mt-0.5">Prototype</p>
      </div>
      <nav class="flex-1 overflow-y-auto py-2">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold transition-colors"
          :class="isActive(item.path)
            ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600'
            : 'text-gray-600 hover:bg-gray-50'"
        >
          <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="px-4 py-3 border-t border-gray-200">
        <div class="text-[11px] text-gray-400 font-bold">Yolanda Technology</div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto">
      <slot />
    </main>
  </div>
</template>
