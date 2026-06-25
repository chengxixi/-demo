/**
 * 需求管理状态管理（函数式 Pinia store）
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CandidateLead, RequirementPoolItem } from '@/types';

export const useRequirementsStore = defineStore('requirements', () => {
    const activeTab = ref<'candidates' | 'pool'>('candidates');

    // 候选线索
    const candidates = ref<CandidateLead[]>([]);

    // 需求池
    const pool = ref<RequirementPoolItem[]>([]);
    const poolLevelFilter = ref('');

    // 弹窗
    const showPromoteModal = ref(false);
    const showDetailDrawer = ref(false);
    const showAddLeadModal = ref(false);
    const selectedPoolItem = ref<RequirementPoolItem | null>(null);
    const selectedLead = ref<CandidateLead | null>(null);

    // L1-L4 计数
    const levelCounts = computed(() => {
        const counts: Record<string, number> = { L1: 0, L2: 0, L3: 0, L4: 0 };
        pool.value.forEach((r) => {
            if (counts[r.level] !== undefined) counts[r.level]++;
        });
        return counts;
    });

    const filteredPool = computed(() => {
        if (!poolLevelFilter.value) return pool.value;
        return pool.value.filter((r) => r.level === poolLevelFilter.value);
    });

    function openPromote(lead?: CandidateLead) {
        selectedLead.value = lead || null;
        showPromoteModal.value = true;
    }

    function closePromote() {
        showPromoteModal.value = false;
        selectedLead.value = null;
    }

    function openPoolDetail(item: RequirementPoolItem) {
        selectedPoolItem.value = item;
        showDetailDrawer.value = true;
    }

    function closePoolDetail() {
        showDetailDrawer.value = false;
        selectedPoolItem.value = null;
    }

    return {
        activeTab,
        candidates,
        pool,
        poolLevelFilter,
        showPromoteModal,
        showDetailDrawer,
        showAddLeadModal,
        selectedPoolItem,
        selectedLead,
        levelCounts,
        filteredPool,
        openPromote,
        closePromote,
        openPoolDetail,
        closePoolDetail,
    };
});
