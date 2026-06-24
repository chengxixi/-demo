<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
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
const toast = ref<string | null>(null)

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => { toast.value = null }, 2500)
}

function saveDefaults() {
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
  showToast('全局默认配置已保存')
}

function applyTemplate(tmpl: typeof templateLibrary[0]) {
  if (tmpl.values.site) globalDefaults.value.site = (tmpl.values.site as string[])[0]
  if (tmpl.values.brand) globalDefaults.value.brand = tmpl.values.brand as string
  if (tmpl.values.productType) globalDefaults.value.productType = tmpl.values.productType as string
  if (tmpl.values.source) globalDefaults.value.source = tmpl.values.source as string
  showToast(`模板「${tmpl.name}」已应用到全局默认值`)
}

function getScopeLabel(scope: string) {
  if (scope === 'all') return '全部数据'
  if (scope === 'line:CM') return '筋膜枪产品线'
  if (scope === 'line:CS') return '八电极产品线'
  if (scope === 'region:海外') return '海外区域'
  if (scope === 'region:国内') return '国内区域'
  return scope
}

// ==================== Edit Template Modal ====================
const showEditModal = ref(false)
const editingTemplateName = ref('')
const editTemplate = ref({
  site: [] as string[],
  brand: '',
  productType: '',
  source: '',
  owner: '',
})

function editTemplateSettings(name: string) {
  const tmpl = templateLibrary.find(t => t.name === name)
  if (tmpl) {
    editingTemplateName.value = name
    editTemplate.value = {
      site: [...(tmpl.values.site as string[])],
      brand: tmpl.values.brand as string,
      productType: tmpl.values.productType as string,
      source: tmpl.values.source as string,
      owner: tmpl.values.owner as string,
    }
  }
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
}

function saveEditTemplate() {
  showEditModal.value = false
  showToast(`模板「${editingTemplateName.value}」已保存`)
}

function toggleSite(site: string) {
  const idx = editTemplate.value.site.indexOf(site)
  if (idx >= 0) editTemplate.value.site.splice(idx, 1)
  else editTemplate.value.site.push(site)
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
                <button class="btn-primary text-[11px]" @click="applyTemplate(tmpl)">应用</button>
                <button class="btn-secondary text-[11px]" @click="editTemplateSettings(tmpl.name)">编辑</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== Edit Template Modal ==================== -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <div>
            <span class="text-xs text-gray-400">模板管理</span>
            <h3 class="text-base font-extrabold text-gray-900">编辑模板：{{ editingTemplateName }}</h3>
          </div>
          <button class="text-gray-400 hover:text-gray-600" @click="closeEditModal"><X class="w-5 h-5" /></button>
        </div>

        <div class="p-5 space-y-3">
          <div>
            <span class="block text-[11px] font-bold text-gray-600 mb-1">站点（多选）</span>
            <div class="flex flex-wrap gap-2">
              <label v-for="s in siteOptions" :key="s" class="flex items-center gap-1 text-xs font-bold text-gray-700">
                <input type="checkbox" :checked="editTemplate.site.includes(s)" @change="toggleSite(s)" /> {{ s }}
              </label>
            </div>
          </div>
          <label class="flex flex-col gap-1">
            <span class="text-[11px] font-bold text-gray-600">品牌</span>
            <select v-model="editTemplate.brand" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
              <option v-for="b in brandOptions" :key="b" :value="b">{{ b }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-[11px] font-bold text-gray-600">产品类型</span>
            <select v-model="editTemplate.productType" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
              <option v-for="p in productTypeOptions" :key="p" :value="p">{{ p }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-[11px] font-bold text-gray-600">来源</span>
            <select v-model="editTemplate.source" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
              <option v-for="s in sourceOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-[11px] font-bold text-gray-600">负责人</span>
            <input v-model="editTemplate.owner" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
          </label>
        </div>

        <div class="flex justify-end gap-2 px-5 py-3.5 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <button class="btn-secondary text-xs h-8 px-4" @click="closeEditModal">取消</button>
          <button class="btn-primary text-xs h-8 px-5" @click="saveEditTemplate">保存</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="fixed top-4 right-4 z-[60] px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-white bg-blue-600">
      {{ toast }}
    </div>
  </div>
</template>
