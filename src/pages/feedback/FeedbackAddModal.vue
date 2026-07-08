<script setup lang="ts">
import { reactive } from 'vue'
import type { FeedbackItem } from '@/types'
import { exceptionLevels, processRouteOptions, processStateOptions, sourceOptions } from '@/api/mock'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'add', value: FeedbackItem): void
}>()

const form = reactive({
  region: '海外',
  source: '商品评论',
  brand: '云康宝',
  site: 'Amazon.com (US)',
  productType: '体脂秤',
  model: 'CS20A',
  internal: '',
  asin: '',
  orderNo: '',
  returned: '无需',
  expressNo: '',
  image: '',
  video: '',
  raw: '',
  ai: '',
  solution: '待产品经理确认处理方案。',
  level1: '产品质量',
  level2: '硬件问题',
  level3: '待确认',
  exception: '待确认',
  createMode: '人工录入',
  processRoute: '待处理',
  processState: '待处理',
  feedbackUser: '',
  handler: '李工',
})

function closeModal() {
  emit('update:open', false)
}

function submitForm() {
  emit('add', {
    id: `CS-${Date.now()}`,
    mergeGroup: '',
    source: form.source,
    createMode: form.createMode,
    region: form.region,
    dataSource: form.source,
    brand: form.brand,
    site: form.site,
    productType: form.productType,
    model: form.model,
    internal: form.internal,
    asin: form.asin,
    orderNo: form.orderNo,
    expressNo: form.expressNo,
    raw: form.raw,
    ai: form.ai,
    image: form.image,
    video: form.video,
    solution: form.solution,
    level1: form.level1,
    level2: form.level2,
    level3: form.level3,
    sentiment: '待确认',
    returned: form.returned,
    exception: form.exception,
    processRoute: form.processRoute,
    processState: form.processState,
    feedbackUser: form.feedbackUser,
    handler: form.handler,
    date: new Date().toISOString().slice(0, 10),
  })
  closeModal()
}
</script>

<template>
  <a-modal
    :open="props.open"
    title="新增反馈"
    width="980px"
    @cancel="closeModal"
  >
    <a-alert
      class="mb-4"
      type="info"
      show-icon
      message="编号规则：产品线简码-创建时间年月日-流水号。CS：八电极/体脂秤，CM：筋膜枪。"
    />
    <a-form layout="vertical">
      <a-row :gutter="12">
        <a-col :span="8">
          <a-form-item label="地区">
            <a-select
              v-model:value="form.region"
              :options="['海外', '国内'].map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="数据来源">
            <a-select
              v-model:value="form.source"
              :options="sourceOptions.map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="品牌">
            <a-input v-model:value="form.brand" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="站点">
            <a-input v-model:value="form.site" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="设备类型">
            <a-input v-model:value="form.productType" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="销售型号">
            <a-input v-model:value="form.model" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="内部型号/料号">
            <a-input v-model:value="form.internal" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="订单号">
            <a-input v-model:value="form.orderNo" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="ASIN">
            <a-input v-model:value="form.asin" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="是否退换货">
            <a-select
              v-model:value="form.returned"
              :options="['退货', '换货', '退货+换货', '无需'].map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="快递单号（退换货）">
            <a-input v-model:value="form.expressNo" placeholder="退换货时填写" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="用户反馈（客户对话/退货反馈）">
            <a-textarea v-model:value="form.raw" :rows="3" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="用户评价翻译（AI自动翻译）">
            <a-textarea v-model:value="form.ai" :rows="3" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="图片补充">
            <a-input v-model:value="form.image" placeholder="图片链接或附件说明" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="视频补充">
            <a-input v-model:value="form.video" placeholder="视频链接或附件说明" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="问题回答/处理方案">
            <a-textarea v-model:value="form.solution" :rows="3" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="一级职能划分">
            <a-input v-model:value="form.level1" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="二级问题场景分类">
            <a-input v-model:value="form.level2" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="三级问题">
            <a-input v-model:value="form.level3" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="异常级别">
            <a-select
              v-model:value="form.exception"
              :options="exceptionLevels.map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="处理去向">
            <a-select
              v-model:value="form.processRoute"
              :options="processRouteOptions.map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="创建方式">
            <a-select
              v-model:value="form.createMode"
              :options="['人工录入', 'AI自动创建'].map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="状态">
            <a-select
              v-model:value="form.processState"
              :options="processStateOptions.map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="反馈人">
            <a-input v-model:value="form.feedbackUser" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <template #footer>
      <a-space>
        <a-button @click="closeModal">取消</a-button>
        <a-button type="primary" @click="submitForm">保存</a-button>
      </a-space>
    </template>
  </a-modal>
</template>
