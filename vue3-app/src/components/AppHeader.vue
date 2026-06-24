<template>
  <header class="topbar">
    <div>
      <h1>{{ pageTitle }}</h1>
    </div>
    <div class="topbar-actions">
      <button class="icon-button" aria-label="通知">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span class="notice-badge">12</span>
      </button>
      <button class="top-link">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        帮助
      </button>
      <button class="profile-button">
        <span class="avatar">PM</span>
        产品经理
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    dashboard: '首页',
    feedback: '反馈清单',
    tickets: '工单池',
    exceptions: '异常处理',
    requirements: '需求管理',
    competition: '竞争分析',
    reports: '报告中心',
    qa: 'Q&A/案例库',
    settings: '系统配置',
  };
  const name = (route.name as string) || '';
  return titles[name] || '反馈管理系统';
});
</script>
