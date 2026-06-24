<template>
  <div class="page-body">
    <section class="local-workspace-page">
      <div class="local-page-head">
        <div>
          <h2>系统配置</h2>
          <p>配置渠道、分类标签、角色权限和 SLA 规则。</p>
        </div>
        <div class="local-page-actions">
          <button type="button" class="primary-button" @click="showSave = true">保存配置</button>
        </div>
      </div>

      <div class="local-page-grid three">
        <article class="local-module-card" v-for="card in configCards" :key="card.title">
          <h3>{{ card.title }}</h3>
          <p>{{ card.desc }}</p>
          <div class="local-module-meta"><span>{{ card.meta }}</span></div>
          <button type="button" class="secondary-button" @click="previewConfig(card.title)">配置</button>
        </article>
      </div>

      <table class="local-config-table">
        <thead>
          <tr><th>配置项</th><th>当前值</th><th>状态</th><th>最近更新</th></tr>
        </thead>
        <tbody>
          <tr v-for="item in configItems" :key="item.name">
            <td>{{ item.name }}</td>
            <td>{{ item.value }}</td>
            <td><span class="local-status-pill done">{{ item.status }}</span></td>
            <td>{{ item.updated }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 预览 Modal -->
    <div class="local-modal" v-if="showPreview" @click.self="showPreview = false">
      <div class="local-modal-inner" style="max-width:400px;">
        <div class="local-modal-head">
          <h2>{{ previewTarget }}</h2>
          <button type="button" class="icon-button" @click="showPreview = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="local-detail-block">
          <span>配置说明</span>
          <strong>当前为原型配置入口，后续接入后台接口后支持编辑、校验、保存和操作日志。</strong>
        </div>
        <div class="local-modal-actions">
          <button type="button" class="secondary-button" @click="showPreview = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const showSave = ref(false);
const showPreview = ref(false);
const previewTarget = ref('');

const configCards = [
  { title: '渠道管理', desc: '维护 Amazon、天猫、京东、抖音、APP、客服沟通等来源。', meta: '7 个渠道' },
  { title: '分类标签', desc: '维护一级职能、二级场景、三级具体问题。', meta: '42 个标签' },
  { title: '角色权限', desc: '配置管理员、产品经理、反馈人员的数据范围。', meta: '4 个角色' },
  { title: 'SLA规则', desc: '配置反馈、工单、异常的响应和闭环时限。', meta: '6 条规则' },
];

const configItems = [
  { name: '异常临时方案时限', value: 'P0/P1 2h', status: '启用', updated: '2026-06-22' },
  { name: '反馈默认去向', value: '待处理', status: '启用', updated: '2026-06-22' },
  { name: '竞品海外 ASIN 校验', value: '必填', status: '启用', updated: '2026-06-22' },
];

function previewConfig(title: string) {
  previewTarget.value = title;
  showPreview.value = true;
}
</script>
