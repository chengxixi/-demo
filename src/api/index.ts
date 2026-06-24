import {
  feedbackData,
  workOrderData,
  emergencyData,
  requirementData,
  competitorData,
  knowledgeData,
  userRoleData,
  metricCards,
  modelRankData,
} from './mock-data';
import type {
  FeedbackItem,
  WorkOrder,
  EmergencyException,
  Requirement,
  Competitor,
  KnowledgeItem,
  UserRole,
  MetricCardData,
  ModelRankItem,
  CompareMode,
} from '@/types';

// ==================== 反馈 API ====================
export function fetchFeedbackList(): Promise<FeedbackItem[]> {
  return Promise.resolve(feedbackData);
}

// ==================== 工单 API ====================
export function fetchWorkOrderList(): Promise<WorkOrder[]> {
  return Promise.resolve(workOrderData);
}

// ==================== 异常 API ====================
export function fetchEmergencyList(): Promise<EmergencyException[]> {
  return Promise.resolve(emergencyData);
}

// ==================== 需求 API ====================
export function fetchRequirementList(): Promise<Requirement[]> {
  return Promise.resolve(requirementData);
}

// ==================== 竞品 API ====================
export function fetchCompetitorList(): Promise<Competitor[]> {
  return Promise.resolve(competitorData);
}

// ==================== 知识库 API ====================
export function fetchKnowledgeList(): Promise<KnowledgeItem[]> {
  return Promise.resolve(knowledgeData);
}

// ==================== 用户 API ====================
export function fetchUserRoles(): Promise<UserRole[]> {
  return Promise.resolve(userRoleData);
}

// ==================== 仪表盘 API ====================
export function fetchMetricCards(_mode: CompareMode): Promise<MetricCardData[]> {
  return Promise.resolve(metricCards);
}

export function fetchModelRank(): Promise<ModelRankItem[]> {
  return Promise.resolve(modelRankData);
}
