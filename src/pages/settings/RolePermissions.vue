<script setup lang="ts">
import { roleOptions } from '@/api/mock-data'

function getScopeLabel(scope: string) {
  if (scope === 'all') return '全部数据'
  if (scope === 'line:CM') return '筋膜枪产品线'
  if (scope === 'line:CS') return '八电极产品线'
  if (scope === 'region:海外') return '海外区域'
  if (scope === 'region:国内') return '国内区域'
  return scope
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-200">
      <h3 class="text-sm font-extrabold text-gray-900">用户角色管理</h3>
    </div>
    <table class="w-full text-xs">
      <thead>
        <tr class="bg-gray-50 border-b border-gray-200">
          <th class="text-left px-3 py-2 font-extrabold text-gray-600">角色Key</th>
          <th class="text-left px-3 py-2 font-extrabold text-gray-600">姓名</th>
          <th class="text-left px-3 py-2 font-extrabold text-gray-600">角色标签</th>
          <th class="text-left px-3 py-2 font-extrabold text-gray-600">数据权限范围</th>
          <th class="text-center px-3 py-2 font-extrabold text-gray-600 w-16">头像</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in roleOptions" :key="user.key" class="border-b border-gray-100">
          <td class="px-3 py-2 font-bold text-blue-600">{{ user.key }}</td>
          <td class="px-3 py-2 font-bold text-gray-900">{{ user.name }}</td>
          <td class="px-3 py-2 text-gray-500">{{ user.label }}</td>
          <td class="px-3 py-2">
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
              :class="user.scope === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'"
            >{{ getScopeLabel(user.scope) }}</span>
          </td>
          <td class="px-3 py-2 text-center">
            <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-xs font-extrabold text-gray-700">
              {{ user.avatar }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
