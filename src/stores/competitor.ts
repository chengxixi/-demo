/**
 * 竞品分析状态管理（函数式 Pinia store）
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Competitor } from '@/types';

export const useCompetitorStore = defineStore('competitor', () => {
    // tab 状态
    const activeMainTab = ref('products');
    const productLineFilter = ref('全部');

    // 列表 & 筛选
    const list = ref<Competitor[]>([]);
    const searchKeyword = ref('');
    const filterChannel = ref('');
    const filterAsin = ref('');
    const filterPrice = ref('');
    const filterProductLine = ref('');

    // 竞品详情
    const selectedCompetitor = ref<Competitor | null>(null);
    const showDetail = ref(false);

    // 弹窗状态
    const showAddModal = ref(false);
    const showCompare = ref(false);
    const showHandleModal = ref(false);

    // 产品对比
    const compareSlots = ref<(Competitor | null)[]>([null, null, null, null]);

    // 新增竞品表单
    const addFormLine = ref('八电极秤');
    const addFormChannelType = ref('海外');

    // ---- computed ----
    const filteredList = computed(() => {
        let result = list.value;
        if (productLineFilter.value !== '全部') {
            result = result.filter((c) => c.category === productLineFilter.value);
        }
        if (searchKeyword.value) {
            const kw = searchKeyword.value.toLowerCase();
            result = result.filter(
                (c) => c.name.toLowerCase().includes(kw) || c.brand.toLowerCase().includes(kw),
            );
        }
        return result;
    });

    // ---- actions ----
    function openDetail(c: Competitor) {
        selectedCompetitor.value = c;
        showDetail.value = true;
    }

    function closeDetail() {
        showDetail.value = false;
        selectedCompetitor.value = null;
    }

    function toggleCompare(c: Competitor, idx: number) {
        compareSlots.value[idx] = c;
    }

    function resetCompare() {
        compareSlots.value = [null, null, null, null];
    }

    return {
        activeMainTab,
        productLineFilter,
        list,
        searchKeyword,
        filterChannel,
        filterAsin,
        filterPrice,
        filterProductLine,
        selectedCompetitor,
        showDetail,
        showAddModal,
        showCompare,
        showHandleModal,
        compareSlots,
        addFormLine,
        addFormChannelType,
        filteredList,
        openDetail,
        closeDetail,
        toggleCompare,
        resetCompare,
    };
});
