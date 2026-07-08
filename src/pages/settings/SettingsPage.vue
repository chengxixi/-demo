<script setup lang="ts">
import { computed, reactive, ref, shallowRef } from 'vue'
import { message } from 'ant-design-vue'

type ConfigKey = 'channels' | 'categories' | 'roles' | 'competitorFields'

type ConfigRow = {
  id: string
  name: string
  description: string
  enabled: boolean
}

const activeKey = ref<ConfigKey>('channels')
const editorOpen = shallowRef(false)

const configMeta: Record<ConfigKey, { title: string; description: string }> = {
  channels: {
    title: '渠道字段',
    description: '维护不同反馈来源、站点、品牌和产品线的字段配置。',
  },
  categories: {
    title: '三级分类',
    description: '维护一级、二级、三级分类及其上下级关系。',
  },
  roles: {
    title: '角色权限',
    description: '配置不同角色的数据范围和页面权限。',
  },
  competitorFields: {
    title: '竞品详细参数字段',
    description: '配置八电极秤、体脂秤、筋膜枪等产品线的竞品采集字段。',
  },
}

const settingsData = reactive<Record<ConfigKey, ConfigRow[]>>({
  channels: [
    { id: 'CH-01', name: 'Amazon商品评论', description: '海外站点商品评论采集字段', enabled: true },
    { id: 'CH-02', name: '京东退货反馈', description: '国内退货原因和售后反馈字段', enabled: true },
  ],
  categories: [
    { id: 'CAT-01', name: '产品质量 / 硬件问题 / 无法开机', description: '开机、电池、硬件损坏相关问题', enabled: true },
    { id: 'CAT-02', name: '产品体验 / 数据准确性 / 测脂不准', description: '测量数据偏差和稳定性问题', enabled: true },
  ],
  roles: [
    { id: 'ROLE-01', name: '系统管理员', description: '拥有全部模块管理权限', enabled: true },
    { id: 'ROLE-02', name: '产品经理', description: '可处理需求、竞品和问题分类', enabled: true },
  ],
  competitorFields: [
    { id: 'COMP-01', name: '八电极秤参数字段', description: '外观结构、电极系统、称重系统、测量系统等', enabled: true },
    { id: 'COMP-02', name: '筋膜枪参数字段', description: '动力系统、电源系统、按摩头系统、功能系统等', enabled: true },
  ],
})

const draft = reactive({
  name: '',
  description: '',
  enabled: true,
})

const activeRows = computed(() => settingsData[activeKey.value])

const moduleCards = computed(() => {
  return Object.entries(configMeta).map(([key, meta]) => {
    const rows = settingsData[key as ConfigKey]

    return {
      key: key as ConfigKey,
      ...meta,
      total: rows.length,
      enabled: rows.filter((row) => row.enabled).length,
    }
  })
})

function saveSettings() {
  message.success('全部配置已保存')
}

function toggleRow(row: ConfigRow) {
  row.enabled = !row.enabled
}

function moveRow(row: ConfigRow, direction: -1 | 1) {
  const rows = settingsData[activeKey.value]
  const index = rows.findIndex((item) => item.id === row.id)
  const nextIndex = index + direction

  if (index < 0 || nextIndex < 0 || nextIndex >= rows.length) {
    return
  }

  const [current] = rows.splice(index, 1)
  rows.splice(nextIndex, 0, current)
}

function openEditor() {
  draft.name = ''
  draft.description = ''
  draft.enabled = true
  editorOpen.value = true
}

function createConfig() {
  const rows = settingsData[activeKey.value]
  rows.unshift({
    id: `${activeKey.value.toUpperCase()}-${String(rows.length + 1).padStart(2, '0')}`,
    name: draft.name || `新增${configMeta[activeKey.value].title}`,
    description: draft.description || '待补充配置说明',
    enabled: draft.enabled,
  })
  editorOpen.value = false
  message.success('配置已新增')
}
</script>

<template>
  <section class="space-y-4 p-4">
    <a-row justify="space-between" align="middle">
      <a-col>
        <a-space direction="vertical" size="small">
          <a-typography-title :level="4" class="m-0">系统配置</a-typography-title>
          <a-typography-text type="secondary">
            配置渠道字段、三级分类、角色权限和竞品详细参数字段，配置结果用于各业务页面。
          </a-typography-text>
        </a-space>
      </a-col>
      <a-col><a-button type="primary" @click="saveSettings">保存全部配置</a-button></a-col>
    </a-row>

    <a-row :gutter="[12, 12]">
      <a-col v-for="card in moduleCards" :key="card.key" :xs="24" :md="12" :xl="6">
        <a-card size="small" :title="card.title">
          <a-typography-paragraph type="secondary">{{ card.description }}</a-typography-paragraph>
          <a-space>
            <a-tag>{{ card.total }} 项</a-tag>
            <a-tag color="green">{{ card.enabled }} 项启用</a-tag>
          </a-space>
          <template #actions>
            <a-button type="link" @click="activeKey = card.key">进入配置</a-button>
          </template>
        </a-card>
      </a-col>
    </a-row>

    <a-tabs v-model:active-key="activeKey">
      <a-tab-pane v-for="(meta, key) in configMeta" :key="key" :tab="meta.title" />
    </a-tabs>

    <a-card :title="configMeta[activeKey].title" :bordered="false">
      <template #extra><a-button type="primary" @click="openEditor">新增配置</a-button></template>
      <vxe-table :data="activeRows" border stripe height="420" :export-config="{}">
        <vxe-column field="id" title="编号" width="120" />
        <vxe-column field="name" title="名称" min-width="220" />
        <vxe-column field="description" title="说明" min-width="280" />
        <vxe-column field="enabled" title="状态" width="120">
          <template #default="{ row }">
            <a-tag :color="row.enabled ? 'green' : 'default'">{{ row.enabled ? '启用' : '停用' }}</a-tag>
          </template>
        </vxe-column>
        <vxe-column title="排序" width="110">
          <template #default="{ row }">
            <a-space size="small">
              <a-button size="small" @click="moveRow(row, -1)">上移</a-button>
              <a-button size="small" @click="moveRow(row, 1)">下移</a-button>
            </a-space>
          </template>
        </vxe-column>
        <vxe-column title="操作" width="180" fixed="right">
          <template #default="{ row }">
            <a-space>
              <a-button size="small" @click="openEditor">编辑</a-button>
              <a-button size="small" @click="toggleRow(row)">{{ row.enabled ? '停用' : '启用' }}</a-button>
            </a-space>
          </template>
        </vxe-column>
      </vxe-table>
    </a-card>

    <a-modal v-model:open="editorOpen" :title="`新增${configMeta[activeKey].title}`" @ok="createConfig">
      <a-form layout="vertical">
        <a-form-item label="名称"><a-input v-model:value="draft.name" placeholder="填写配置名称" /></a-form-item>
        <a-form-item label="说明"><a-textarea v-model:value="draft.description" :rows="3" placeholder="填写配置说明" /></a-form-item>
        <a-form-item label="是否启用"><a-switch v-model:checked="draft.enabled" checked-children="启用" un-checked-children="停用" /></a-form-item>
      </a-form>
    </a-modal>
  </section>
</template>
