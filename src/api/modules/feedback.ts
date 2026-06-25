/**
 * 反馈清单 API 模块
 */
import { USE_MOCK } from '@/api/mock';
import { feedbackData } from '@/api/mock';
import type { FeedbackItem } from '@/types';

/** 获取反馈列表 */
export function getFeedbackList(): Promise<FeedbackItem[]> {
    if (USE_MOCK) return Promise.resolve(feedbackData);
    return import('@/api/request').then(({ get }) => get<FeedbackItem[]>('/feedback/list'));
}

/** 获取反馈详情 */
export function getFeedbackDetail(id: string): Promise<FeedbackItem | null> {
    if (USE_MOCK) return Promise.resolve(feedbackData.find((f) => f.id === id) || null);
    return import('@/api/request').then(({ get }) => get<FeedbackItem>(`/feedback/${id}`));
}
