/**
 * 反馈清单状态管理（函数式 Pinia store）
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FeedbackItem } from '@/types';

export const useFeedbackStore = defineStore('feedback', () => {
    // 筛选参数
    const site = ref<string[]>(['Amazon.com (US)']);
    const brand = ref('云康宝');
    const productType = ref('体脂秤');
    const source = ref('商品评论');
    const model = ref('');
    const activeTab = ref('all');
    const keyword = ref('');

    // 表格选中项
    const selectedIds = ref<string[]>([]);
    const mergeGroupId = ref<string | null>(null);

    // 详情/弹窗
    const detailItem = ref<FeedbackItem | null>(null);
    const showDetail = ref(false);
    const showMergeModal = ref(false);

    // 分页
    const page = ref(1);
    const pageSize = ref(20);

    // 列表数据
    const list = ref<FeedbackItem[]>([]);

    // ---- computed ----
    const hasSelection = computed(() => selectedIds.value.length > 0);
    const selectedCount = computed(() => selectedIds.value.length);

    // ---- actions ----
    function setFilters(filters: Record<string, string | string[]>) {
        if (filters.site !== undefined) site.value = filters.site as string[];
        if (filters.brand) brand.value = filters.brand as string;
        if (filters.productType) productType.value = filters.productType as string;
        if (filters.source) source.value = filters.source as string;
        if (filters.model) model.value = filters.model as string;
        if (filters.keyword) keyword.value = filters.keyword as string;
    }

    function openDetail(item: FeedbackItem) {
        detailItem.value = item;
        showDetail.value = true;
    }

    function closeDetail() {
        showDetail.value = false;
        detailItem.value = null;
    }

    function toggleSelect(id: string) {
        const idx = selectedIds.value.indexOf(id);
        if (idx >= 0) selectedIds.value.splice(idx, 1);
        else selectedIds.value.push(id);
    }

    function clearSelection() {
        selectedIds.value = [];
    }

    function openMerge(groupId: string) {
        mergeGroupId.value = groupId;
        showMergeModal.value = true;
    }

    function closeMerge() {
        showMergeModal.value = false;
        mergeGroupId.value = null;
    }

    function resetFilters() {
        site.value = ['Amazon.com (US)'];
        brand.value = '云康宝';
        productType.value = '体脂秤';
        source.value = '商品评论';
        model.value = '';
        keyword.value = '';
        activeTab.value = 'all';
        page.value = 1;
    }

    return {
        site,
        brand,
        productType,
        source,
        model,
        activeTab,
        keyword,
        selectedIds,
        mergeGroupId,
        detailItem,
        showDetail,
        showMergeModal,
        page,
        pageSize,
        list,
        hasSelection,
        selectedCount,
        setFilters,
        openDetail,
        closeDetail,
        toggleSelect,
        clearSelection,
        openMerge,
        closeMerge,
        resetFilters,
    };
});
