import { request } from '@/services/http';
import type { FeedbackItem } from '@/types/feedback';

const mockFeedback: FeedbackItem[] = [
  {
    id: 'FB-202606-001',
    title: '美国站用户反馈搜索结果排序异常',
    source: 'Amazon US',
    owner: '运营组',
    createdAt: '2026-06-12',
    priority: 'P1',
    status: 'pending',
    summary:
      '多名用户反馈同一关键词下新品曝光异常，需要同步排查搜索排序和广告投放链路。',
    tags: ['搜索', '曝光', '美国站'],
  },
  {
    id: 'FB-202606-002',
    title: '国内电商售后问题重复建单',
    source: '国内电商',
    owner: '客服组',
    createdAt: '2026-06-13',
    priority: 'P2',
    status: 'processing',
    summary:
      '同一用户在多入口提交售后反馈后生成重复工单，需要增加合并识别规则。',
    tags: ['售后', '工单', '去重'],
  },
  {
    id: 'FB-202606-003',
    title: '竞品价格监控触发频率过高',
    source: '竞争分析',
    owner: '产品组',
    createdAt: '2026-06-14',
    priority: 'P3',
    status: 'resolved',
    summary: '已调整监控阈值和通知频率，避免低价值价格波动持续进入需求池。',
    tags: ['竞品', '监控', '通知'],
  },
];

export const fetchFeedbackList = async (): Promise<FeedbackItem[]> => {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    return Promise.resolve([...mockFeedback]);
  }

  return request<FeedbackItem[]>({
    method: 'GET',
    url: '/feedback',
  });
};
