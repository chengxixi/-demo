/**
 * Mock 配置开关 —— 当前阶段所有接口走 mock，正式对接时关掉
 * 将 USE_MOCK 改为 false 即可启用真实接口调用
 */
export const USE_MOCK = true;

export {
    siteOptions,
    feedbackTabOptions,
    processRouteOptions,
    processStateOptions,
    returnOptions,
    exceptionLevels,
    sourceOptions,
    timeOptions,
    brandOptions,
    productTypeOptions,
    modelOptions,
    emergencyStepLabels,
    workOrderSteps,
    roleOptions,
    templateLibrary,
    userRoleData,
} from './options';

export { feedbackData } from './feedback';
export { workOrderData, emergencyData } from './workorder';
export { candidateLeadData, requirementPoolData } from './requirements';
export {
    competitorData,
    defaultLevelRecords,
    competitorScaleFields,
    competitorMassageFields,
    competitorParamFieldsMap,
    competitorProductTypeOptions,
} from './competitor';
export { reportData, knowledgeData } from './report';
export {
    filterPeriodOptions,
    filterBrandOptions,
    filterSiteOptions,
    filterProductTypeOptions,
    filterModelOptions,
    filterSourceOptions,
    defaultFilters,
    dashboardMetricCards,
    metricFormulas,
    trendLineData,
    trendXLabels,
    modelTop5Data,
    returnVsFeedbackData,
    level1Categories,
    level2Categories,
    level3Categories,
    top5ComparisonData,
    comparisonLegend,
    emergencyTimelineData,
    emergencyStatusTags,
    topQualityIssues,
    qualityBoardSummary,
    qualityBoardActions,
} from './dashboard';
