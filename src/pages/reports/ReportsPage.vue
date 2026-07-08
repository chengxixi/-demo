<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { message } from 'ant-design-vue'
import type { Report } from '@/types'
import { reportData } from '@/api/mock'
import ReportsPreview from './ReportsPreview.vue'

const reports = ref<Report[]>([...reportData])
const activeTab = ref<'feedback' | 'competitor'>('feedback')
const previewOpen = shallowRef(false)
const ruleOpen = shallowRef(false)
const currentReport = ref<Report | null>(null)

const currentReportTitle = computed(() => (
  activeTab.value === 'feedback' ? '用户反馈月报' : '竞品分析报告'
))

const activeReports = computed(() => {
  return reports.value.filter((report) => (
    activeTab.value === 'feedback'
      ? report.type.includes('用户反馈') || report.type.includes('异常')
      : report.type.includes('竞品')
  ))
})

const reportRules = computed(() => [
  {
    title: currentReportTitle.value,
    desc: activeTab.value === 'feedback'
      ? '汇总反馈量、反馈率、差评率、问题分类、处理去向、退换货与重点案例。'
      : '按产品线汇总新增竞品、触发提醒、价格/排名/功能变化、差评TOP和品牌影响评估。',
    meta: activeTab.value === 'feedback'
      ? ['每月 1 日自动创建', '每日凌晨刷新', '月末冻结归档']
      : ['竞品收集月报', '拆机分析报告', '专项对标报告'],
  },
  {
    title: '自动生成规则',
    desc: '系统按月创建报告，每日刷新数据，冻结后只读并保留历史版本。',
    meta: ['无需手动创建', '自动刷新', '冻结后只读'],
  },
])

function openPreview(report?: Report) {
  currentReport.value = report || activeReports.value[0] || reports.value[0] || null
  previewOpen.value = true
}

function downloadReport(report: Report) {
  message.success(`${report.title} 已加入下载队列`)
}
</script>

<template>
  <section class="space-y-4 p-4">
    <a-row justify="space-between" align="middle">
      <a-col>
        <a-space direction="vertical" size="small">
          <a-typography-title :level="4" class="m-0">报告中心</a-typography-title>
          <a-typography-text type="secondary">
            支持用户反馈月报和竞品分析月报，按产品线查看历史报告并预览导出。
          </a-typography-text>
        </a-space>
      </a-col>
      <a-col>
        <a-space>
          <a-button @click="ruleOpen = true">自动生成规则</a-button>
          <a-button type="primary" @click="openPreview()">查看当前月报</a-button>
        </a-space>
      </a-col>
    </a-row>

    <a-tabs v-model:active-key="activeTab">
      <a-tab-pane key="feedback" tab="用户反馈月报" />
      <a-tab-pane key="competitor" tab="竞品分析月报" />
    </a-tabs>

    <a-row :gutter="[12, 12]">
      <a-col v-for="rule in reportRules" :key="rule.title" :xs="24" :md="12">
        <a-card :title="rule.title" :bordered="false">
          <a-typography-paragraph>{{ rule.desc }}</a-typography-paragraph>
          <a-space wrap>
            <a-tag v-for="item in rule.meta" :key="item" color="blue">{{ item }}</a-tag>
          </a-space>
        </a-card>
      </a-col>
    </a-row>

    <a-card :title="currentReportTitle" :bordered="false">
      <a-row :gutter="[12, 12]" class="mb-4">
        <a-col :xs="24" :md="8">
          <a-card size="small">
            <a-statistic
              :title="activeTab === 'feedback' ? '本月新增反馈' : '本月新增竞品'"
              :value="activeTab === 'feedback' ? 3637 : 12"
            />
          </a-card>
        </a-col>
        <a-col :xs="24" :md="8">
          <a-card size="small">
            <a-statistic
              :title="activeTab === 'feedback' ? '重点问题' : '触发提醒'"
              :value="activeTab === 'feedback' ? 8 : 6"
            />
          </a-card>
        </a-col>
        <a-col :xs="24" :md="8">
          <a-card size="small">
            <a-statistic
              :title="activeTab === 'feedback' ? '已转需求/异常' : '可转需求机会'"
              :value="activeTab === 'feedback' ? 5 : 4"
            />
          </a-card>
        </a-col>
      </a-row>

      <vxe-table :data="activeReports" border stripe height="420" :export-config="{}">
        <vxe-column field="id" title="报告编号" width="160" />
        <vxe-column field="title" title="报告名称" min-width="220" />
        <vxe-column field="period" title="周期" width="190" />
        <vxe-column field="type" title="类型" width="130" />
        <vxe-column field="date" title="生成日期" width="120" />
        <vxe-column field="summary" title="摘要" min-width="280" />
        <vxe-column title="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <a-space size="small">
              <a-button size="small" type="link" @click="openPreview(row)">预览</a-button>
              <a-button size="small" @click="downloadReport(row)">下载</a-button>
            </a-space>
          </template>
        </vxe-column>
      </vxe-table>
    </a-card>

    <a-modal v-model:open="ruleOpen" title="月报自动生成规则" width="680px" @ok="ruleOpen = false">
      <a-timeline>
        <a-timeline-item>每月 1 日自动创建当月报告。</a-timeline-item>
        <a-timeline-item>每日 02:00 刷新用户反馈月报数据。</a-timeline-item>
        <a-timeline-item>每日 03:00 刷新竞品分析月报数据。</a-timeline-item>
        <a-timeline-item>月末 24:00 冻结归档，冻结后只读。</a-timeline-item>
      </a-timeline>
    </a-modal>

    <ReportsPreview v-model:open="previewOpen" :report="currentReport" />
  </section>
</template>
