<template>
  <div class="page-body">
    <section class="local-workspace-page">
      <div class="local-page-head">
        <div>
          <h2>Q&A/案例库</h2>
          <p>沉淀标准回复、异常案例、使用指引和客服培训材料。</p>
        </div>
        <div class="local-page-actions">
          <button type="button" class="primary-button" @click="showAddQa = true">新增Q&A</button>
          <button type="button" class="secondary-button" @click="showImport = true">导入材料</button>
        </div>
      </div>

      <div class="local-page-grid three">
        <article class="local-module-card">
          <h3>常见问题标准回复</h3>
          <p>按产品线、问题分类和渠道维护标准话术。</p>
          <div class="local-module-meta"><span>86 条</span><span>本月新增 12</span></div>
        </article>
        <article class="local-module-card">
          <h3>异常案例归档</h3>
          <p>沉淀 P0/P1 异常处理过程、根因、整改和验证结果。</p>
          <div class="local-module-meta"><span>18 个案例</span><span>已归档</span></div>
        </article>
        <article class="local-module-card">
          <h3>产品使用视频指引</h3>
          <p>管理视频链接、适用型号和客服可发送版本。</p>
          <div class="local-module-meta"><span>24 个视频</span><span>8 个型号</span></div>
        </article>
      </div>

      <table class="local-config-table">
        <thead>
          <tr><th>标题</th><th>类型</th><th>产品线</th><th>适用场景</th><th>状态</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="item in qaItems" :key="item.title">
            <td>{{ item.title }}</td>
            <td>{{ item.type }}</td>
            <td>{{ item.line }}</td>
            <td>{{ item.scenario }}</td>
            <td><span class="local-status-pill" :class="{ warn: item.status === '待复核', done: item.status === '已发布' }">{{ item.status }}</span></td>
            <td><button type="button" class="secondary-button" @click="previewItem(item)">查看</button></td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 新增Q&A Modal -->
    <div class="local-modal" v-if="showAddQa" @click.self="showAddQa = false">
      <div class="local-modal-inner" style="max-width:560px;">
        <div class="local-modal-head">
          <div>
            <span style="color:#667085;font-size:12px;">Q&A/案例库</span>
            <h2>新增Q&A</h2>
            <p style="color:#475467;font-size:13px;margin-top:4px;">录入标准回复、异常案例、视频指引或培训材料。</p>
          </div>
          <button type="button" class="icon-button" @click="showAddQa = false" aria-label="关闭">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">
          <label style="grid-column:span 2;display:flex;flex-direction:column;gap:4px;font-size:13px;color:#475467;">
            标题
            <input placeholder="例如 体脂秤无法开机标准回复" style="height:36px;padding:0 10px;border:1px solid #d7deea;border-radius:6px;font-size:14px;" />
          </label>
          <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;color:#475467;">
            类型
            <select style="height:36px;padding:0 10px;border:1px solid #d7deea;border-radius:6px;font-size:14px;">
              <option>标准回复</option><option>异常案例</option><option>视频指引</option><option>培训材料</option>
            </select>
          </label>
          <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;color:#475467;">
            产品线
            <select style="height:36px;padding:0 10px;border:1px solid #d7deea;border-radius:6px;font-size:14px;">
              <option>八电极秤</option><option>体脂秤</option><option>筋膜枪</option><option>全产品线</option>
            </select>
          </label>
          <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;color:#475467;">
            状态
            <select style="height:36px;padding:0 10px;border:1px solid #d7deea;border-radius:6px;font-size:14px;">
              <option>草稿</option><option>待复核</option><option>已发布</option>
            </select>
          </label>
          <label style="grid-column:span 2;display:flex;flex-direction:column;gap:4px;font-size:13px;color:#475467;">
            适用场景
            <input placeholder="例如 无法开机/更换电池无效" style="height:36px;padding:0 10px;border:1px solid #d7deea;border-radius:6px;font-size:14px;" />
          </label>
          <label style="grid-column:span 2;display:flex;flex-direction:column;gap:4px;font-size:13px;color:#475467;">
            说明
            <textarea placeholder="填写标准回复内容、案例过程、视频链接或培训说明" style="min-height:80px;padding:10px;border:1px solid #d7deea;border-radius:6px;font-size:14px;resize:vertical;"></textarea>
          </label>
        </div>
        <div class="local-modal-actions">
          <button type="button" class="secondary-button" @click="showAddQa = false">取消</button>
          <button type="button" class="primary-button" @click="showAddQa = false">保存</button>
        </div>
      </div>
    </div>

    <!-- 预览 Modal -->
    <div class="local-modal" v-if="showPreview" @click.self="showPreview = false">
      <div class="local-modal-inner" style="max-width:400px;">
        <div class="local-modal-head">
          <h2>{{ previewTitle }}</h2>
          <button type="button" class="icon-button" @click="showPreview = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="local-detail-block">
          <span>内容预览</span>
          <strong>这里展示标准回复、案例归档或培训材料的详情，后续可接入富文本编辑和附件管理。</strong>
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

const showAddQa = ref(false);
const showImport = ref(false);
const showPreview = ref(false);
const previewTitle = ref('');

const qaItems = [
  { title: '体脂秤无法开机标准回复', type: '标准回复', line: '八电极秤', scenario: '无法开机/更换电池无效', status: '已发布' },
  { title: '测量偏差排查案例', type: '异常案例', line: '八电极秤', scenario: '称重偏高5-8磅', status: '待复核' },
  { title: '筋膜枪噪音使用说明', type: '视频指引', line: '筋膜枪', scenario: '高档位噪音咨询', status: '已发布' },
  { title: '客服新人培训材料', type: '培训材料', line: '全产品线', scenario: '入职培训', status: '草稿' },
];

function previewItem(item: typeof qaItems[0]) {
  previewTitle.value = item.title;
  showPreview.value = true;
}
</script>
