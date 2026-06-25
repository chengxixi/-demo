/**
 * 需求管理 API 模块
 */
import { USE_MOCK } from '@/api/mock';
import { candidateLeadData, requirementPoolData } from '@/api/mock';
import type { CandidateLead, RequirementPoolItem } from '@/types';

/** 获取候选线索 */
export function getCandidateLeads(): Promise<CandidateLead[]> {
    if (USE_MOCK) return Promise.resolve(candidateLeadData);
    return import('@/api/request').then(({ get }) =>
        get<CandidateLead[]>('/requirements/candidates'),
    );
}

/** 获取需求池列表 */
export function getRequirementPool(): Promise<RequirementPoolItem[]> {
    if (USE_MOCK) return Promise.resolve(requirementPoolData);
    return import('@/api/request').then(({ get }) =>
        get<RequirementPoolItem[]>('/requirements/pool'),
    );
}
