<script setup lang="ts">
import { templateLibrary } from '@/api/mock-data'

defineEmits<{
  'apply-template': [tmpl: typeof templateLibrary[0]]
  'edit-template': [name: string]
}>()
</script>

<template>
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
            <button class="btn-primary text-[11px]" @click="$emit('apply-template', tmpl)">应用</button>
            <button class="btn-secondary text-[11px]" @click="$emit('edit-template', tmpl.name)">编辑</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
