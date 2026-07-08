<script setup lang="ts">
import { shallowRef } from 'vue'

interface MarketDynamic {
  platform: string
  brand: string
  product: string
  category: string
  rank: string
  price: string
  rating: string
  reviews: string
  change: string
  event: string
  trigger: string
  plan: string
  handled: boolean
  date: string
}

const alerts = [
  { level: 'L4', event: 'Withings 新增心率/血管年龄卖点', action: '建议进入换代功能机会评估', brand: 'Withings', type: '功能变化' },
  { level: 'L3', event: 'RENPHO 近 7 天价格下降 18%', action: '跟进价格带和促销节奏', brand: 'RENPHO', type: '价格变化' },
  { level: 'L3', event: '华为八电极秤大促排名上升', action: '复盘国内高端秤卖点结构', brand: '华为', type: '排名变化' },
]

const dynamics = shallowRef<MarketDynamic[]>([
  { platform: 'Amazon US', brand: 'RENPHO', product: 'Elis 1 Smart Scale', category: '四电极体脂秤', rank: '#8', price: '$39.99', rating: '4.6', reviews: '23,400', change: '价格 -18%', event: '促销', trigger: 'L3', plan: '转入需求', handled: true, date: '2026-06-18' },
  { platform: 'Amazon US', brand: 'Withings', product: 'Body Scan', category: '八电极体脂秤', rank: '#24', price: '$99.00', rating: '4.4', reviews: '8,920', change: '新增心率/血管年龄', event: '上新', trigger: 'L4', plan: '启动实物分析', handled: true, date: '2026-06-18' },
  { platform: '天猫', brand: '华为', product: '智能体脂秤 3 Pro', category: '八电极体脂秤', rank: '类目第1', price: '¥399', rating: '4.8', reviews: '18,260', change: '618 预售上升', event: '排名', trigger: 'L3', plan: '转入需求', handled: true, date: '2026-06-19' },
  { platform: '京东', brand: '小米', product: '体脂秤 S400 Pro', category: '四电极体脂秤', rank: '类目第3', price: '¥179', rating: '4.7', reviews: '52,100', change: '低价型号放量', event: '价格', trigger: 'L2', plan: '', handled: false, date: '2026-06-10' },
  { platform: '独立站', brand: 'Wyze', product: 'Scale X', category: '体脂秤', rank: '自然流量上升', price: '$33.99', rating: '4.2', reviews: '4,700', change: '套餐包上线', event: '上新', trigger: 'L1', plan: '', handled: false, date: '2026-06-12' },
  { platform: '抖音', brand: '倍轻松', product: 'M5 筋膜枪', category: '筋膜枪', rank: '热销榜第7', price: '¥499', rating: '4.6', reviews: '9,840', change: '达人视频曝光增加', event: '内容', trigger: 'L3', plan: '', handled: false, date: '2026-06-21' },
])

const handleTarget = shallowRef('')
const showHandleModal = shallowRef(false)

function openHandleDialog(target: string) {
  handleTarget.value = target
  showHandleModal.value = true
}

function selectHandlePlan(plan: string) {
  dynamics.value = dynamics.value.map((dynamic) => {
    if (`${dynamic.brand} ${dynamic.product}` !== handleTarget.value) {
      return dynamic
    }

    return {
      ...dynamic,
      plan,
      handled: true,
    }
  })

  showHandleModal.value = false
}
</script>

<template>
  <div>
    <a-row :gutter="12">
      <a-col v-for="alert in alerts" :key="alert.event" :span="8">
        <a-card size="small" class="h-full">
          <a-tag :color="alert.level === 'L4' ? 'red' : 'orange'">{{ alert.level }}</a-tag>
          <strong class="block mt-2 text-sm">{{ alert.event }}</strong>
          <p class="text-xs text-gray-500 my-1">{{ alert.action }}</p>
          <span class="text-[11px] text-gray-400">{{ alert.brand }} / {{ alert.type }}</span>
        </a-card>
      </a-col>
    </a-row>

    <section class="mt-5">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-base font-extrabold">跨平台竞品动态</h3>
        <a-button type="primary" size="small">生成分析任务</a-button>
      </div>
      <vxe-table :data="dynamics" border="inner" size="mini" stripe show-overflow :export-config="{}">
        <vxe-column field="platform" title="平台" width="120">
          <template #default="{ row }">
            <a-tag color="blue">{{ row.platform }}</a-tag>
          </template>
        </vxe-column>
        <vxe-column field="brand" title="品牌" width="110" />
        <vxe-column field="product" title="产品" min-width="180" />
        <vxe-column field="category" title="类别" width="140" />
        <vxe-column field="rank" title="排名" width="110" />
        <vxe-column field="price" title="价格" width="100" />
        <vxe-column field="rating" title="评分" width="80" />
        <vxe-column field="reviews" title="评论数" width="110" />
        <vxe-column field="change" title="变化" min-width="150">
          <template #default="{ row }">
            <span :class="row.change.includes('-') ? 'text-red-500 font-bold' : 'text-green-600 font-bold'">
              {{ row.change }}
            </span>
          </template>
        </vxe-column>
        <vxe-column field="event" title="事件" width="90" />
        <vxe-column field="trigger" title="触发" width="90">
          <template #default="{ row }">
            <a-tag :color="row.trigger === 'L4' ? 'red' : row.trigger === 'L3' ? 'orange' : 'blue'">
              {{ row.trigger }}
            </a-tag>
          </template>
        </vxe-column>
        <vxe-column field="plan" title="最新处理方案" min-width="150">
          <template #default="{ row }">
            <span v-if="row.handled">{{ row.plan }}</span>
            <span v-else-if="row.trigger === 'L1' || row.trigger === 'L2'">--</span>
            <span v-else>未处理</span>
          </template>
        </vxe-column>
        <vxe-column title="操作" width="110" align="center" fixed="right">
          <template #default="{ row }">
            <a-button
              v-if="(row.trigger === 'L3' || row.trigger === 'L4') && !row.handled"
              size="small"
              @click="openHandleDialog(`${row.brand} ${row.product}`)"
            >
              处理
            </a-button>
            <a-tag v-else-if="row.handled" color="green">已完成</a-tag>
            <span v-else>--</span>
          </template>
        </vxe-column>
      </vxe-table>
    </section>

    <a-modal v-model:open="showHandleModal" :title="handleTarget" :footer="null" :width="640">
      <a-row :gutter="[12, 12]">
        <a-col v-for="plan in ['转紧急异常处理', '启动实物分析', '转入需求', '解除监控并归档']" :key="plan" :span="12">
          <a-card size="small">
            <strong>{{ plan }}</strong>
            <p class="text-xs text-gray-500 mt-1">为当前 L3/L4 触发项选择后续处理路径。</p>
            <a-button size="small" class="mt-2" @click="selectHandlePlan(plan)">选择</a-button>
          </a-card>
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>
