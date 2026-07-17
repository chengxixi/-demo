<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { UploadProps } from 'ant-design-vue'
import type { FeedbackItem } from '@/types'
import { brandOptions, exceptionLevels, modelOptions, productTypeOptions, sourceOptions } from '@/api/mock'
import { currentUser } from '@/stores'

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
  site: '亚马逊',
  productType: '体脂秤',
  model: 'CS20F',
  internal: 'YKB27011A1-CS(US)_01.01.01.222',
  asin: '',
  orderNo: '',
  returned: '无需退换货',
  expressNo: '',
  image: '',
  video: '',
  raw: '',
  ai: '',
  solution: '',
  level1: 'AI待分类',
  level2: 'AI待分类',
  level3: 'AI待分类',
  exception: '无异常',
  createMode: '人工录入',
  processRoute: '待处理',
  processState: '待处理',
  feedbackUser: currentUser.value.name,
  handler: '李工',
})

const internalOptions = [
  'YKB27011A1-CS(US)_01.01.01.222',
  'YKB27012A1-CS(EU)_01.01.01.223',
  'YKB28021B1-CS(CN)_01.01.02.108',
  'AF31001A1-CS(US)_01.01.03.015',
  'GE22008A2-CS(CN)_01.01.04.066',
  'LOT33018B1-CM(CN)_02.03.01.019',
]

const returnOptions = ['退货', '换货', '无需退换货']
const overseasPlatformOptions = ['亚马逊']
const domesticPlatformOptions = ['天猫', '抖音', '京东']
const platformOptions = computed(() => (form.region === '海外' ? overseasPlatformOptions : domesticPlatformOptions))
const isAmazonPlatform = computed(() => form.site === '亚马逊')
const needsExpressNo = computed(() => form.returned !== '无需退换货')
const imageFileList = ref<UploadProps['fileList']>([])
const videoFileList = ref<UploadProps['fileList']>([])

type FileField = 'image' | 'video'

watch(
  () => form.region,
  () => {
    const nextOptions = platformOptions.value
    if (!nextOptions.includes(form.site)) form.site = nextOptions[0] || ''
  },
  { immediate: true },
)

watch(
  () => form.site,
  (site) => {
    if (site !== '亚马逊') form.asin = ''
  },
)

watch(
  () => form.returned,
  (returned) => {
    if (returned === '无需退换货') form.expressNo = ''
  },
)

function closeModal() {
  emit('update:open', false)
}

function beforeUpload() {
  return false
}

function syncFileField(field: FileField, fileList: UploadProps['fileList']) {
  form[field] = (fileList || []).map((file) => file.name).join('、')
}

function handlePaste(field: FileField, event: ClipboardEvent) {
  const files = Array.from(event.clipboardData?.files || [])
  if (!files.length) return

  event.preventDefault()
  const pastedFiles = files.map((file) => ({
    uid: `paste-${Date.now()}-${file.name}`,
    name: file.name,
    status: 'done',
    originFileObj: file,
  })) as NonNullable<UploadProps['fileList']>

  if (field === 'image') {
    imageFileList.value = [...(imageFileList.value || []), ...pastedFiles]
    syncFileField('image', imageFileList.value)
    return
  }

  videoFileList.value = [...(videoFileList.value || []), ...pastedFiles]
  syncFileField('video', videoFileList.value)
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
            <a-select
              v-model:value="form.brand"
              :options="brandOptions.map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="平台">
            <a-select
              v-model:value="form.site"
              :options="platformOptions.map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="设备类型">
            <a-select
              v-model:value="form.productType"
              :options="productTypeOptions.map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="销售型号">
            <a-select
              v-model:value="form.model"
              :options="modelOptions.map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="内部型号/料号">
            <a-select
              v-model:value="form.internal"
              show-search
              :options="internalOptions.map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="销售订单号">
            <a-input v-model:value="form.orderNo" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="ASIN" :required="isAmazonPlatform">
            <a-input
              v-model:value="form.asin"
              :disabled="!isAmazonPlatform"
              :placeholder="isAmazonPlatform ? '亚马逊平台必填' : '非亚马逊平台无需填写'"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="是否退换货">
            <a-select
              v-model:value="form.returned"
              :options="returnOptions.map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col v-if="needsExpressNo" :span="8">
          <a-form-item label="快递单号（退换货）" :required="needsExpressNo">
            <a-input
              v-model:value="form.expressNo"
              :disabled="!needsExpressNo"
              :placeholder="needsExpressNo ? '退换货时填写' : '无需退换货时无需填写'"
            />
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
            <a-upload-dragger
              v-model:file-list="imageFileList"
              accept="image/*"
              :before-upload="beforeUpload"
              :multiple="true"
              @change="syncFileField('image', imageFileList)"
              @paste="handlePaste('image', $event)"
            >
              <p class="upload-copy">上传或粘贴图片文件</p>
            </a-upload-dragger>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="视频补充">
            <a-upload-dragger
              v-model:file-list="videoFileList"
              accept="video/*"
              :before-upload="beforeUpload"
              :multiple="true"
              @change="syncFileField('video', videoFileList)"
              @paste="handlePaste('video', $event)"
            >
              <p class="upload-copy">上传或粘贴视频文件</p>
            </a-upload-dragger>
          </a-form-item>
        </a-col>

        <a-col :span="8">
          <a-form-item label="反馈人">
            <a-input v-model:value="form.feedbackUser" disabled />
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

<style scoped>
.upload-copy {
  margin: 8px 0;
  color: #4b5563;
  font-size: 13px;
}
</style>
