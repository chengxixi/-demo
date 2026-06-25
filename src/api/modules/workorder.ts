/**
 * 工单 & 异常 API 模块
 */
import { USE_MOCK } from '@/api/mock';
import { workOrderData, emergencyData } from '@/api/mock';
import type { WorkOrder, EmergencyException } from '@/types';

/** 获取工单列表 */
export function getWorkOrderList(): Promise<WorkOrder[]> {
    if (USE_MOCK) return Promise.resolve(workOrderData);
    return import('@/api/request').then(({ get }) => get<WorkOrder[]>('/workorder/list'));
}

/** 获取异常列表 */
export function getEmergencyList(): Promise<EmergencyException[]> {
    if (USE_MOCK) return Promise.resolve(emergencyData);
    return import('@/api/request').then(({ get }) => get<EmergencyException[]>('/emergency/list'));
}
