<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { ExternalLink } from 'lucide-vue-next'

const activePrototype = shallowRef('returnFlow')

const prototypes = [
  {
    key: 'returnFlow',
    title: '退货流程示意图',
    desc: '退货签收、PMS 售后刷新、维修扫码登记和持续提醒流程。',
    src: '/pms-after-sales/return-flow.html',
  },
  {
    key: 'repairMes',
    title: '售后维修 MES 原型',
    desc: '面向 iPad 维修工位的扫码、维修登记、结果确认原型。',
    src: '/pms-after-sales/repair-mes.html',
  },
]

const currentPrototype = computed(() => {
  return prototypes.find((item) => item.key === activePrototype.value) ?? prototypes[0]
})
</script>

<template>
  <section class="pms-page space-y-4 p-4">
    <a-space direction="vertical" size="small">
      <a-typography-title :level="4" class="m-0">PMS售后优化</a-typography-title>
      <a-typography-text type="secondary">
        集中查看售后退货流程和维修 MES 操作原型，用于确认 PMS 售后优化方案。
      </a-typography-text>
    </a-space>

    <a-card size="small" class="prototype-switch-card">
      <a-row justify="space-between" align="middle" :gutter="[12, 12]">
        <a-col>
          <a-segmented
            v-model:value="activePrototype"
            :options="prototypes.map((item) => ({ label: item.title, value: item.key }))"
          />
        </a-col>
        <a-col>
          <a-button :href="currentPrototype.src" target="_blank">
            <template #icon><ExternalLink class="icon" /></template>
            新窗口打开
          </a-button>
        </a-col>
      </a-row>
      <a-typography-text type="secondary" class="prototype-desc">{{ currentPrototype.desc }}</a-typography-text>
    </a-card>

    <a-card :title="currentPrototype.title" class="prototype-frame-card" :body-style="{ padding: 0 }">
      <iframe :key="currentPrototype.key" class="prototype-frame" :src="currentPrototype.src" />
    </a-card>
  </section>
</template>

<style scoped>
.pms-page {
  min-height: 100%;
}

.prototype-switch-card :deep(.ant-card-body) {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.prototype-desc {
  display: block;
}

.icon {
  width: 14px;
  height: 14px;
}

.prototype-frame-card {
  overflow: hidden;
}

.prototype-frame {
  display: block;
  width: 100%;
  min-height: calc(100vh - 240px);
  border: 0;
  background: #fff;
}
</style>