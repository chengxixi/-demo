<script setup lang="ts">
import { computed, reactive, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FeedbackItem } from '@/types'
import { feedbackData } from '@/api/mock'

const route = useRoute()
const router = useRouter()

const mode = computed(() => {
  return route.name === 'feedbackMergeDetail' ? 'merge' : 'single'
})

const routeId = computed(() => {
  return String(route.params.id || route.params.groupId || '')
})

const currentItem = computed(() => {
  return feedbackData.find((item) => item.id === routeId.value) || null
})

const mergeMembers = computed(() => {
  if (mode.value !== 'merge') {
    return []
  }

  return feedbackData.filter((item) => item.mergeGroup === routeId.value)
})

const leadItem = computed(() => {
  return mode.value === 'merge' ? mergeMembers.value[0] || null : currentItem.value
})

const title = computed(() => {
  if (mode.value === 'merge') {
    return mergeDisplayId.value
  }

  return currentItem.value?.id || '反馈详情'
})

const subTitle = computed(() => {
  if (mode.value === 'merge') {
    return `合并反馈 / ${mergeMembers.value.length} 条明细`
  }

  const item = currentItem.value
  return item ? `${dataSource(item)} / ${item.brand} / ${item.model}` : '未找到反馈'
})

const mergeDisplayId = computed(() => {
  const item = leadItem.value

  if (!item) {
    return routeId.value
  }

  const date = item.id.match(/\d{8}/)?.[0] || item.date.replace(/-/g, '') || '20260618'
  return `${productLineCode(item)}-${date}-合并（${mergeMembers.value.length}条数据）`
})

const form = reactive({
  region: '',
  productLine: '',
  exception: '',
  processRoute: '',
  processState: '',
  handler: '',
  raw: '',
  ai: '',
  level1: '',
  level2: '',
  level3: '',
  reply: '',
})

const directCloseVisible = shallowRef(false)
const productLineOptions = ['八电极', '体脂秤', '筋膜枪']

const detailRows = computed(() => {
  const item = leadItem.value

  if (!item) {
    return []
  }

  return [
    ['反馈编号', item.id],
    ['地区', region(item)],
    ['数据来源', dataSource(item)],
    ['产品线', productLine(item)],
    ['品牌', item.brand],
    ['内部型号/料号', item.internal],
    ['销售型号', item.model],
    ['订单号/ASIN', item.orderNo || item.asin || '-'],
    ['是否退换货', item.returned || '-'],
    ['快递单号', expressNo(item)],
    ['问题反馈时间', item.date],
    ['创建方式', item.createMode],
    ['反馈人', item.feedbackUser],
    ['处理人', item.handler],
  ]
})

watch(
  leadItem,
  (item) => {
    form.region = item ? region(item) : ''
    form.productLine = item ? productLine(item) : ''
    form.exception = item?.exception || ''
    form.processRoute = item?.processRoute || ''
    form.processState = item?.processState || ''
    form.handler = item?.handler || ''
    form.raw = item?.raw || ''
    form.ai = item?.ai || ''
    form.level1 = item?.level1 || ''
    form.level2 = item?.level2 || ''
    form.level3 = item?.level3 || ''
    form.reply = ''
    directCloseVisible.value = false
  },
  { immediate: true },
)

function region(item: FeedbackItem) {
  return item.region || (item.site.includes('Amazon') ? '海外' : '国内')
}

function dataSource(item: FeedbackItem) {
  if (item.dataSource) {
    return item.dataSource
  }

  if (item.source === '退货反馈') {
    return region(item) === '海外' ? '海外电商-退货反馈' : '国内电商-退货反馈'
  }

  if (item.source === '商品评论') {
    return region(item) === '海外' ? '海外电商-商品评论' : '国内电商-商品评论'
  }

  return item.source
}

function productLine(item: FeedbackItem) {
  if (item.productType === '八电极' || item.productType === '八电极秤') return '八电极'
  if (item.productType === '筋膜枪') return '筋膜枪'
  return '体脂秤'
}

function productLineCode(item: FeedbackItem) {
  return productLine(item) === '筋膜枪' ? 'CM' : 'CS'
}

function expressNo(item: FeedbackItem) {
  if (item.expressNo) {
    return item.expressNo
  }

  if (['退货', '换货', '退货+换货'].includes(item.returned)) {
    return `RT-${item.id.replace(/\D/g, '').slice(-8)}`
  }

  return '-'
}

function solution(item: FeedbackItem) {
  if (item.solution) {
    return item.solution
  }

  if (item.processRoute === '待处理') {
    return '待产品经理确认处理方案'
  }

  if (item.processRoute === '已转工单') {
    return '已转工单跟进质量排查'
  }

  if (item.processRoute === '已转需求') {
    return '已转需求池评审'
  }

  if (item.processRoute === '已转异常') {
    return '已转异常处理流程'
  }

  if (item.processRoute === '已转Q&A') {
    return '已沉淀至Q&A案例库'
  }

  return '已直接回复并关闭'
}

function returnStatus(item: FeedbackItem) {
  if (item.returned === '否') return '无'
  return item.returned || '无'
}

function shouldShowReturnProgress(item: FeedbackItem) {
  return region(item) === '国内' && ['退货', '换货', '退货+换货'].includes(item.returned)
}

function returnProgress(item: FeedbackItem) {
  if (!shouldShowReturnProgress(item)) {
    return []
  }

  return [
    ['售后状态', `${item.returned}处理中`],
    ['PMS单号', expressNo(item)],
    ['当前节点', item.processState === '已处理' ? '已完成售后闭环' : 'PMS售后模块处理中'],
    ['更新时间', item.date],
  ]
}

function goBack() {
  router.push('/feedback')
}

function sourceSummary(item: FeedbackItem) {
  return `${region(item)}-${item.source}-${item.brand}-${productLine(item)}-${item.model}`
}

function visibleFeedbackLines(item: FeedbackItem) {
  const lines = [{ label: '用户反馈', value: item.raw || item.ai || '-' }]
  if (region(item) === '海外') {
    lines.push({ label: 'AI翻译', value: item.ai || '-' })
  }
  return lines
}

function creator(item: FeedbackItem) {
  return item.createMode.includes('AI') ? 'AI创建' : '人工创建'
}

function feedbackUser(item: FeedbackItem) {
  return item.createMode.includes('AI') ? '系统' : item.feedbackUser
}

function saveDetail() {
  message.success('详情修改已保存')
}

function applyRoute(nextRoute: string) {
  form.processRoute = nextRoute
  form.processState = '已处理'
  message.success(`${nextRoute} 已更新`)
}

function showDirectClose() {
  directCloseVisible.value = true
}

function directClose() {
  directCloseVisible.value = true
  if (!form.reply.trim()) {
    message.info('请先填写直接回复内容')
    return
  }

  applyRoute('已直接回复关闭')
}

function openSingle(id: string) {
  router.push(`/feedback/detail/${encodeURIComponent(id)}`)
}

function unmerge(id: string) {
  message.success(`${id} 已移出合并`)
}
</script>

<template>
  <section class="space-y-4 p-4">
    <a-row :gutter="[12, 12]" align="middle" justify="space-between">
      <a-col>
        <a-space direction="vertical" size="small">
          <a-typography-title :level="4" class="m-0">{{ title }}</a-typography-title>
          <a-typography-text type="secondary">{{ subTitle }}</a-typography-text>
        </a-space>
      </a-col>
      <a-col>
        <a-button @click="goBack">返回列表</a-button>
      </a-col>
    </a-row>

    <a-alert
      v-if="!leadItem"
      type="warning"
      show-icon
      message="未找到对应反馈"
    />

    <template v-else>
      <a-row :gutter="[16, 16]">
        <a-col v-if="mode === 'single'" :xs="24" :xl="16">
          <a-card title="基础信息" :bordered="false">
            <a-descriptions bordered size="small" :column="2">
              <a-descriptions-item
                v-for="row in detailRows"
                :key="row[0]"
                :label="row[0]"
              >
                {{ row[1] }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
        <a-col :xs="24" :xl="mode === 'merge' ? 24 : 8">
          <a-card title="处理状态" :bordered="false">
            <a-form layout="vertical">
              <a-row :gutter="[12, 0]">
                <a-col :xs="24" :md="8" :xl="mode === 'merge' ? 4 : 24">
                  <a-form-item label="产品线">
                    <a-select v-model:value="form.productLine" :options="productLineOptions.map((item) => ({ label: item, value: item }))" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8" :xl="mode === 'merge' ? 4 : 24">
                  <a-form-item label="处理去向">
                    <a-typography-text strong>{{ form.processRoute || '-' }}</a-typography-text>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8" :xl="mode === 'merge' ? 4 : 24">
                  <a-form-item label="处理状态">
                    <a-typography-text strong>{{ form.processState || '-' }}</a-typography-text>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8" :xl="mode === 'merge' ? 4 : 24">
                  <a-form-item label="当前处理人">
                    <a-input v-model:value="form.handler" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8" :xl="mode === 'merge' ? 4 : 24">
                  <a-form-item label="三级分类">
                    <a-input v-model:value="form.level3" />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-card>
        </a-col>
      </a-row>

      <a-card v-if="mode === 'single'" title="反馈内容" :bordered="false">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :lg="12">
            <a-form-item label="用户反馈（客户对话/退货反馈）">
              <a-textarea v-model:value="form.raw" :rows="5" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :lg="12">
            <a-form-item label="用户评价翻译（AI自动翻译）">
              <a-textarea v-model:value="form.ai" :rows="5" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row v-if="mode === 'single'" :gutter="[16, 16]">
          <a-col :xs="24" :md="8">
            <a-form-item label="一级职能划分">
              <a-input v-model:value="form.level1" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="8">
            <a-form-item label="二级问题场景分类">
              <a-input v-model:value="form.level2" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="8">
            <a-form-item label="三级具体问题">
              <a-input v-model:value="form.level3" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-card>

      <a-card v-if="mode === 'merge'" title="合并明细" :bordered="false">
        <a-space direction="vertical" size="middle" class="w-full">
          <a-card
            v-for="(member, index) in mergeMembers"
            :key="member.id"
            size="small"
            class="merge-member-card"
          >
            <a-space direction="vertical" size="small" class="w-full">
              <a-typography-title :level="5" class="merge-member-title">
                {{ member.id }} / 第 {{ index + 1 }} 条明细
              </a-typography-title>
              <a-typography-paragraph class="merge-member-line">
                <a-typography-text strong>来源：</a-typography-text>
                {{ sourceSummary(member) }}
              </a-typography-paragraph>
              <a-typography-paragraph
                v-for="line in visibleFeedbackLines(member)"
                :key="`${member.id}-${line.label}`"
                class="merge-member-line"
              >
                <a-typography-text strong>{{ line.label }}：</a-typography-text>
                {{ line.value }}
              </a-typography-paragraph>
              <a-typography-paragraph class="merge-member-line">
                <a-typography-text strong>分类：</a-typography-text>
                {{ member.level1 }} / {{ member.level2 }} / {{ member.level3 }}
              </a-typography-paragraph>
              <a-typography-paragraph class="merge-member-line">
                <a-typography-text strong>是否退换货：</a-typography-text>
                {{ returnStatus(member) }}
              </a-typography-paragraph>
              <a-typography-paragraph class="merge-member-line">
                <a-typography-text strong>创建方式：</a-typography-text>
                {{ creator(member) }}
              </a-typography-paragraph>
              <a-typography-paragraph class="merge-member-line">
                <a-typography-text strong>反馈人：</a-typography-text>
                {{ feedbackUser(member) }}
              </a-typography-paragraph>
              <a-typography-paragraph v-if="shouldShowReturnProgress(member)" class="merge-member-line">
                <a-typography-text strong>退换货进度（PMS售后模块）：</a-typography-text>
              </a-typography-paragraph>
              <a-row v-if="shouldShowReturnProgress(member)" :gutter="[12, 12]">
                <a-col
                  v-for="row in returnProgress(member)"
                  :key="`${member.id}-${row[0]}`"
                  :xs="12"
                  :md="6"
                >
                  <a-statistic :title="row[0]" :value="row[1]" />
                </a-col>
              </a-row>
              <a-row justify="end">
                <a-col>
                  <a-space>
                    <a-button @click="openSingle(member.id)">查看</a-button>
                    <a-button @click="unmerge(member.id)">移出合并</a-button>
                  </a-space>
                </a-col>
              </a-row>
            </a-space>
          </a-card>
        </a-space>
      </a-card>

      <a-card v-else-if="shouldShowReturnProgress(leadItem)" title="退换货进度（PMS售后模块）" :bordered="false">
        <a-row :gutter="[12, 12]">
          <a-col
            v-for="row in returnProgress(leadItem)"
            :key="row[0]"
            :xs="12"
            :md="6"
          >
            <a-card size="small">
              <a-statistic :title="row[0]" :value="row[1]" />
            </a-card>
          </a-col>
        </a-row>
      </a-card>

      <a-card v-if="directCloseVisible" title="直接关闭" :bordered="false">
        <a-typography-paragraph>{{ solution(leadItem) }}</a-typography-paragraph>
        <a-form-item label="直接回复内容">
          <a-textarea
            v-model:value="form.reply"
            :rows="4"
            placeholder="由操作人输入给用户的直接回复内容。"
          />
        </a-form-item>
      </a-card>

      <a-row justify="end">
        <a-col>
          <a-space wrap>
            <a-button @click="goBack">关闭</a-button>
            <a-button @click="saveDetail">保存修改</a-button>
            <a-button @click="applyRoute('已转工单')">转工单</a-button>
            <a-button danger @click="applyRoute('已转异常')">转异常</a-button>
            <a-button @click="applyRoute('已转需求')">转需求</a-button>
            <a-button @click="showDirectClose">直接关闭</a-button>
            <a-button v-if="directCloseVisible" type="primary" @click="directClose">确认回复并关闭</a-button>
          </a-space>
        </a-col>
      </a-row>
    </template>
  </section>
</template>

<style scoped>
.merge-member-card {
  border-radius: 8px;
}

.merge-member-title {
  margin-bottom: 0;
}

.merge-member-line {
  color: #344054;
  line-height: 1.45;
  margin-bottom: 0;
  white-space: pre-wrap;
}
</style>
