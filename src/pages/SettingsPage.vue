<script setup lang="ts">
import { ref } from 'vue';
import { userRoleData, timeOptions, siteOptions, brandOptions, productTypeOptions, modelOptions, sourceOptions } from '@/api/mock-data';

const config = ref({
  period: '近30天',
  site: 'Amazon.com (US)',
  brand: '全部品牌',
  productType: '体脂秤',
  model: '全部',
  source: '全部',
});

function scopeLabel(scope: string) {
  if (scope === 'all') return '全部数据';
  if (scope.startsWith('line:')) return `${scope.split(':')[1]}产品线`;
  if (scope.startsWith('region:')) return `${scope.split(':')[1]}区域`;
  return scope;
}
</script>

<template>
  <div class="p-6 max-w-[1000px] mx-auto">
    <h2 class="text-lg font-semibold text-gray-800 mb-6">系统配置</h2>

    <!-- 全局筛选默认值 -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
      <h3 class="text-sm font-semibold text-gray-700 mb-4">全局筛选默认值</h3>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block text-xs text-gray-400 mb-1">时间周期</label>
          <select v-model="config.period" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option v-for="o in timeOptions" :key="o" :value="o">{{ o }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">站点</label>
          <select v-model="config.site" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option v-for="o in siteOptions" :key="o" :value="o">{{ o }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">品牌</label>
          <select v-model="config.brand" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option v-for="o in brandOptions" :key="o" :value="o">{{ o }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">产品类型</label>
          <select v-model="config.productType" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option v-for="o in productTypeOptions" :key="o" :value="o">{{ o }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">型号</label>
          <select v-model="config.model" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option v-for="o in modelOptions" :key="o" :value="o">{{ o }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">来源</label>
          <select v-model="config.source" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option v-for="o in sourceOptions" :key="o" :value="o">{{ o }}</option>
          </select>
        </div>
      </div>
      <div class="mt-4 pt-4 border-t border-gray-50">
        <button class="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700">保存配置</button>
      </div>
    </div>

    <!-- 用户角色管理 -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-5 border-b border-gray-50">
        <h3 class="text-sm font-semibold text-gray-700">用户角色管理</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-xs">
              <th class="text-left px-4 py-2.5 font-medium">Key</th>
              <th class="text-left px-4 py-2.5 font-medium">姓名</th>
              <th class="text-left px-4 py-2.5 font-medium">角色标签</th>
              <th class="text-left px-4 py-2.5 font-medium">数据权限</th>
              <th class="text-left px-4 py-2.5 font-medium w-12">头像</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in userRoleData" :key="user.key" class="border-t border-gray-50 hover:bg-gray-50/50">
              <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ user.key }}</td>
              <td class="px-4 py-3 font-medium text-gray-800">{{ user.name }}</td>
              <td class="px-4 py-3 text-gray-600">{{ user.label }}</td>
              <td class="px-4 py-3">
                <span :class="['inline-flex px-2 py-0.5 rounded text-xs', user.scope === 'all' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600']">
                  {{ scopeLabel(user.scope) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                  <span class="text-brand-700 text-xs font-bold">{{ user.avatar }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
