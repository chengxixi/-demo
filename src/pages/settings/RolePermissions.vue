<script setup lang="ts">
import { roleOptions } from '@/api/mock-data'

function getScopeLabel(scope: string) {
  if (scope === 'all') return '全部数据'
  if (scope === 'line:CM') return '筋膜枪产品线'
  if (scope === 'line:CS') return '八电极产品线'
  if (scope === 'region:海外') return '海外区域'
  if (scope === 'region:国内') return '国内区域'
  return scope
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-200">
      <h3 class="text-sm font-extrabold text-gray-900">用户角色管理</h3>
    </div>
    <vxe-table :data="roleOptions" border="inner" size="mini" stripe show-overflow :export-config="{}">
      <vxe-column field="key" title="角色Key" width="130">
        <template #default="{ row }">
          <span class="font-bold text-blue-600">{{ row.key }}</span>
        </template>
      </vxe-column>
      <vxe-column field="name" title="姓名" width="120" />
      <vxe-column field="label" title="角色标签" min-width="160" />
      <vxe-column field="scope" title="数据权限范围" min-width="180">
        <template #default="{ row }">
          <a-tag :color="row.scope === 'all' ? 'blue' : 'default'">
            {{ getScopeLabel(row.scope) }}
          </a-tag>
        </template>
      </vxe-column>
      <vxe-column field="avatar" title="头像" width="80" align="center">
        <template #default="{ row }">
          <a-avatar :size="28">{{ row.avatar }}</a-avatar>
        </template>
      </vxe-column>
    </vxe-table>
  </div>
</template>
