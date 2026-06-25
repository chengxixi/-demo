<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { templateLibrary, siteOptions, brandOptions, productTypeOptions, sourceOptions } from '@/api/mock-data'
import GlobalDefaults from './GlobalDefaults.vue'
import RolePermissions from './RolePermissions.vue'
import CategoryTags from './CategoryTags.vue'

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

function handleSave() {
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
  showToast('全局默认配置已保存')
}

function handleApplyTemplate(tmpl: typeof templateLibrary[0]) {
  if (tmpl.values.site) globalDefaults.value.site = (tmpl.values.site as string[])[0]
  if (tmpl.values.brand) globalDefaults.value.brand = tmpl.values.brand as string
  if (tmpl.values.productType) globalDefaults.value.productType = tmpl.values.productType as string
  if (tmpl.values.source) globalDefaults.value.source = tmpl.values.source as string
  showToast(`模板「${tmpl.name}」已应用到全局默认值`)
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

function handleEditTemplate(name: string) {
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

function handleSaveEditTemplate() {
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
      <GlobalDefaults :global-defaults="globalDefaults" :saved="saved" @update:global-defaults="globalDefaults = $event" @save="handleSave" />
      <RolePermissions />
      <CategoryTags @apply-template="handleApplyTemplate" @edit-template="handleEditTemplate" />
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
          <button class="btn-primary text-xs h-8 px-5" @click="handleSaveEditTemplate">保存</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="fixed top-4 right-4 z-[60] px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-white bg-blue-600">
      {{ toast }}
    </div>
  </div>
</template>
