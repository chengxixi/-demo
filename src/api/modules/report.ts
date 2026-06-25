/**
 * 报告 & 知识库 API 模块
 */
import { USE_MOCK } from '@/api/mock';
import { reportData, knowledgeData } from '@/api/mock';
import type { Report, KnowledgeItem } from '@/types';

/** 获取报告列表 */
export function getReportList(): Promise<Report[]> {
    if (USE_MOCK) return Promise.resolve(reportData);
    return import('@/api/request').then(({ get }) => get<Report[]>('/report/list'));
}

/** 获取知识库列表 */
export function getKnowledgeList(): Promise<KnowledgeItem[]> {
    if (USE_MOCK) return Promise.resolve(knowledgeData);
    return import('@/api/request').then(({ get }) => get<KnowledgeItem[]>('/knowledge/list'));
}
