<script setup lang="ts">
import { ref } from 'vue'
import { roleOptions, siteOptions, brandOptions, productTypeOptions, modelOptions, sourceOptions, templateLibrary } from '@/api/mock-data'

const globalDefaults = ref({
  period: '最近30天',
  site: 'Amazon.com (US)',
  brand: '云康宝',
  productType: '体脂秤',
  model: 'CS20A',
  source: '商品评论',
})

const saved = ref(false)

function saveDefaults() {
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

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
  <div class="h-full flex flex-col">
    <div class="px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
      <h2 class="text-lg font-extrabold text-gray-900">系统配置</h2>
      <p class="text-xs text-gray-400 mt-0.5">产品线/型号 模板与角色配置</p>
    </div>
    <div class="flex-1 overflow-auto p-6 space-y-6">
      <!-- Section 1: Global Defaults -->
      <div class="bg-white border border-gray-200 rounded-lg">
        <div class="px-4 py-3 border-b border-gray-200">
          <h3 class="text-sm font-extrabold text-gray-900">全局筛选默认值</h3>
        </div>
        <div class="p-4">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <label class="flex flex-col gap-1 text-xs font-bold text-gray-600">
              默认时间段
              <select v-model="globalDefaults.period" class="h-8 text-xs border border-gray-200 rounded px-2">
                <option value="最近7天">最近7天</option>
                <option value="最近30天">最近30天</option>
                <option value="本月">本月</option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-xs font-bold text-gray-600">
              默认站点
              <select v-model="globalDefaults.site" class="h-8 text-xs border border-gray-200 rounded px-2">
                <option v-for="s in siteOptions" :key="s" :value="s">{{ s }}</option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-xs font-bold text-gray-600">
              默认品牌
              <select v-model="globalDefaults.brand" class="h-8 text-xs border border-gray-200 rounded px-2">
                <option v-for="b in brandOptions" :key="b" :value="b">{{ b }}</option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-xs font-bold text-gray-600">
              默认产品类型
              <select v-model="globalDefaults.productType" class="h-8 text-xs border border-gray-200 rounded px-2">
                <option v-for="p in productTypeOptions" :key="p" :value="p">{{ p }}</option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-xs font-bold text-gray-600">
              默认型号
              <select v-model="globalDefaults.model" class="h-8 text-xs border border-gray-200 rounded px-2">
                <option v-for="m in modelOptions" :key="m" :value="m">{{ m }}</option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-xs font-bold text-gray-600">
              默认数据来源
              <select v-model="globalDefaults.source" class="h-8 text-xs border border-gray-200 rounded px-2">
                <option v-for="s in sourceOptions" :key="s" :value="s">{{ s }}</option>
              </select>
            </label>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn-primary text-xs" @click="saveDefaults">保存配置</button>
            <span v-if="saved" class="text-xs text-green-600 font-bold">已保存</span>
          </div>
        </div>
      </div>

      <!-- Section 2: User Roles -->
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

      <!-- Section 3: Templates -->
      <div class="bg-white border border-gray-200 rounded-lg">
        <div class="px-4 py-3 border-b border-gray-200">
          <h3 class="text-sm font-extrabold text-gray-900">模板管理</h3>
        </div>
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
              v-for="tmpl in templateLibrary"
              :key="tmpl.name"
              class="border border-gray-200 rounded-lg p-4"
            >
              <h4 class="text-sm font-extrabold text-gray-900 mb-2">{{ tmpl.name }}</h4>
              <div class="space-y-1 text-[11px] text-gray-500">
                <p><b>站点:</b> {{ (tmpl.values.site as string[]).join(' / ') }}</p>
                <p><b>品牌:</b> {{ tmpl.values.brand }}</p>
                <p><b>产品类型:</b> {{ tmpl.values.productType }}</p>
                <p><b>来源:</b> {{ tmpl.values.source }}</p>
                <p><b>负责人:</b> {{ tmpl.values.owner }}</p>
              </div>
              <div class="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button class="btn-primary text-[11px]">应用</button>
                <button class="btn-secondary text-[11px]">编辑</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
