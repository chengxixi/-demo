<script setup lang="ts">
import { computed, ref } from 'vue'
import { defaultFilters } from '@/api/mock'
import BusinessBoard from './BusinessBoard.vue'
import QualityBoard from './QualityBoard.vue'

const activeTab = ref('business')
const comparison = ref<'环比' | '同比'>('环比')
const filters = ref<Record<string, string>>({ ...defaultFilters })

const changeKey = computed<'mom' | 'yoy'>(() => {
  return comparison.value === '同比' ? 'yoy' : 'mom'
})

function formatNum(value: number): string {
  return Math.round(value).toLocaleString('zh-CN')
}

function formatChange(value: number): string {
  if (value > 0) {
    return `+${value}%`
  }

  if (value < 0) {
    return `${value}%`
  }

  return '0%'
}
</script>

<template>
  <section class="space-y-4 p-4">
    <a-row :gutter="[12, 12]" align="middle" justify="space-between">
      <a-col>
        <a-space direction="vertical" size="small">
          <a-typography-title :level="4" class="m-0">反馈运营看板</a-typography-title>
          <a-typography-text type="secondary">
            反馈仪表盘查看业务趋势，问题仪表盘查看分类占比、异常动态和质量改善动作。
          </a-typography-text>
        </a-space>
      </a-col>
      <a-col>
        <a-segmented
          v-model:value="comparison"
          :options="['环比', '同比']"
        />
      </a-col>
    </a-row>

    <a-tabs v-model:active-key="activeTab">
      <a-tab-pane key="business" tab="反馈仪表盘">
        <BusinessBoard
          v-model:filters="filters"
          v-model:comparison="comparison"
          :change-key="changeKey"
          :format-num="formatNum"
          :format-change="formatChange"
        />
      </a-tab-pane>
      <a-tab-pane key="quality" tab="问题仪表盘">
        <QualityBoard
          v-model:filters="filters"
          :comparison="comparison"
          :change-key="changeKey"
          :format-num="formatNum"
          :format-change="formatChange"
        />
      </a-tab-pane>
    </a-tabs>
  </section>
</template>
