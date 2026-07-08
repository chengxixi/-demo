<script setup lang="ts">
import { templateLibrary } from '@/api/mock'

defineEmits<{
  'apply-template': [tmpl: typeof templateLibrary[0]]
  'edit-template': [name: string]
}>()
</script>

<template>
  <a-card title="模板管理" :bordered="false">
    <a-row :gutter="[12, 12]">
      <a-col v-for="tmpl in templateLibrary" :key="tmpl.name" :xs="24" :md="8">
        <a-card size="small" :title="tmpl.name">
          <a-descriptions size="small" :column="1">
            <a-descriptions-item label="站点">{{ (tmpl.values.site as string[]).join(' / ') }}</a-descriptions-item>
            <a-descriptions-item label="品牌">{{ tmpl.values.brand }}</a-descriptions-item>
            <a-descriptions-item label="产品类型">{{ tmpl.values.productType }}</a-descriptions-item>
            <a-descriptions-item label="来源">{{ tmpl.values.source }}</a-descriptions-item>
            <a-descriptions-item label="负责人">{{ tmpl.values.owner }}</a-descriptions-item>
          </a-descriptions>
          <template #actions>
            <a-button type="link" @click="$emit('apply-template', tmpl)">应用</a-button>
            <a-button type="link" @click="$emit('edit-template', tmpl.name)">编辑</a-button>
          </template>
        </a-card>
      </a-col>
    </a-row>
  </a-card>
</template>
