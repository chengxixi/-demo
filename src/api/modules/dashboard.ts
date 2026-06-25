/**
 * 仪表盘 API 模块
 */
import { USE_MOCK } from '@/api/mock';
import {
    dashboardMetricCards,
    trendLineData,
    trendXLabels,
    modelTop5Data,
    returnVsFeedbackData,
    level1Categories,
    level2Categories,
    level3Categories,
    top5ComparisonData,
    emergencyTimelineData,
    topQualityIssues,
    qualityBoardActions,
    qualityBoardSummary,
} from '@/api/mock';

export interface DashboardData {
    metricCards: typeof dashboardMetricCards;
    trend: { data: typeof trendLineData; labels: typeof trendXLabels };
    modelTop5: typeof modelTop5Data;
    returnVsFeedback: typeof returnVsFeedbackData;
    categories: {
        level1: typeof level1Categories;
        level2: typeof level2Categories;
        level3: typeof level3Categories;
    };
    top5Comparison: typeof top5ComparisonData;
    emergencyTimeline: typeof emergencyTimelineData;
    topIssues: typeof topQualityIssues;
    qualityBoard: { summary: typeof qualityBoardSummary; actions: typeof qualityBoardActions };
}

/** 获取仪表盘汇总数据 */
export function getDashboardData(): Promise<DashboardData> {
    if (USE_MOCK) {
        return Promise.resolve({
            metricCards: dashboardMetricCards,
            trend: { data: trendLineData, labels: trendXLabels },
            modelTop5: modelTop5Data,
            returnVsFeedback: returnVsFeedbackData,
            categories: {
                level1: level1Categories,
                level2: level2Categories,
                level3: level3Categories,
            },
            top5Comparison: top5ComparisonData,
            emergencyTimeline: emergencyTimelineData,
            topIssues: topQualityIssues,
            qualityBoard: { summary: qualityBoardSummary, actions: qualityBoardActions },
        });
    }
    return import('@/api/request').then(({ get }) => get<DashboardData>('/dashboard'));
}
