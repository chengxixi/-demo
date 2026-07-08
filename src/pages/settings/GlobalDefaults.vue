<script setup lang="ts">
import { brandOptions, modelOptions, productTypeOptions, siteOptions, sourceOptions } from '@/api/mock'

interface GlobalDefaults {
  period: string
  site: string
  brand: string
  productType: string
  model: string
  source: string
}

const props = defineProps<{
  globalDefaults: GlobalDefaults
}>()

const periodOptions = ['最近7天', '最近30天', '本月', '本季度', '本年']
</script>

<template>
  <a-form layout="vertical" class="max-w-4xl">
    <a-row :gutter="16">
      <a-col :xs="24" :md="8">
        <a-form-item label="默认时间">
          <a-select
            v-model:value="props.globalDefaults.period"
            :options="periodOptions.map((item) => ({ label: item, value: item }))"
          />
        </a-form-item>
      </a-col>
      <a-col :xs="24" :md="8">
        <a-form-item label="默认站点">
          <a-select
            v-model:value="props.globalDefaults.site"
            :options="siteOptions.map((item) => ({ label: item, value: item }))"
          />
        </a-form-item>
      </a-col>
      <a-col :xs="24" :md="8">
        <a-form-item label="默认品牌">
          <a-select
            v-model:value="props.globalDefaults.brand"
            :options="brandOptions.map((item) => ({ label: item, value: item }))"
          />
        </a-form-item>
      </a-col>
      <a-col :xs="24" :md="8">
        <a-form-item label="产品类型">
          <a-select
            v-model:value="props.globalDefaults.productType"
            :options="productTypeOptions.map((item) => ({ label: item, value: item }))"
          />
        </a-form-item>
      </a-col>
      <a-col :xs="24" :md="8">
        <a-form-item label="默认型号">
          <a-select
            v-model:value="props.globalDefaults.model"
            :options="modelOptions.map((item) => ({ label: item, value: item }))"
          />
        </a-form-item>
      </a-col>
      <a-col :xs="24" :md="8">
        <a-form-item label="默认来源">
          <a-select
            v-model:value="props.globalDefaults.source"
            :options="sourceOptions.map((item) => ({ label: item, value: item }))"
          />
        </a-form-item>
      </a-col>
    </a-row>
  </a-form>
</template>
