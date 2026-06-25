/**
 * 竞品分析 API 模块
 */
import { USE_MOCK } from '@/api/mock';
import {
    competitorData,
    defaultLevelRecords,
    competitorParamFieldsMap,
    competitorProductTypeOptions,
} from '@/api/mock';
import type { Competitor, LevelRecord, CompetitorFieldDef } from '@/types';

/** 获取竞品列表 */
export function getCompetitorList(): Promise<Competitor[]> {
    if (USE_MOCK) return Promise.resolve(competitorData);
    return import('@/api/request').then(({ get }) => get<Competitor[]>('/competitor/list'));
}

/** 获取竞品监控记录 */
export function getCompetitorLevelRecords(): Promise<LevelRecord[]> {
    if (USE_MOCK) return Promise.resolve(defaultLevelRecords);
    return import('@/api/request').then(({ get }) => get<LevelRecord[]>('/competitor/records'));
}

/** 获取竞品参数字段定义 */
export function getCompetitorParamFields(line: string): CompetitorFieldDef[] {
    return competitorParamFieldsMap[line] || [];
}

/** 获取产品类型选项 */
export function getCompetitorProductTypeOptions(line: string): string[] {
    return competitorProductTypeOptions[line] || [];
}

/** 添加竞品 */
export function addCompetitor(item: Partial<Competitor>): Promise<Competitor> {
    if (USE_MOCK) return Promise.resolve({ ...item, id: `cp-${Date.now()}` } as Competitor);
    return import('@/api/request').then(({ post }) =>
        post<Competitor>('/competitor/add', item as Record<string, unknown>),
    );
}
