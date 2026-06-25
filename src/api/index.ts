/**
 * API 统一导出
 *
 * 使用方式：
 *   import { getFeedbackList, getWorkOrderList } from '@/api';
 *
 * 切换真实接口：
 *   将 src/api/mock/index.ts 中 USE_MOCK 改为 false
 */
export { getFeedbackList, getFeedbackDetail } from './modules/feedback';
export { getWorkOrderList, getEmergencyList } from './modules/workorder';
export {
    getCompetitorList,
    getCompetitorLevelRecords,
    getCompetitorParamFields,
    getCompetitorProductTypeOptions,
    addCompetitor,
} from './modules/competitor';
export { getCandidateLeads, getRequirementPool } from './modules/requirements';
export { getReportList, getKnowledgeList } from './modules/report';
export { getDashboardData } from './modules/dashboard';

// 同时导出 mock 数据，方便页面直接引用
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
} from './mock/options';
export {
    filterPeriodOptions,
    filterBrandOptions,
    filterSiteOptions,
    filterProductTypeOptions,
    filterModelOptions,
    filterSourceOptions,
    defaultFilters,
} from './mock/dashboard';
