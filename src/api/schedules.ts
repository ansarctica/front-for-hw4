import { apiClient, buildQuery } from "./client";
import type { Schedule, CreateScheduleDto } from "./types";

export const schedulesApi = {
  getAll: (params: { group_id?: number } = {}) => 
    apiClient.get<Schedule[]>(`/schedules${buildQuery(params)}`),

  create: (data: CreateScheduleDto) =>
    apiClient.post<Schedule>("/schedules", data),

  update: (id: number, data: Partial<CreateScheduleDto>) =>
    apiClient.patch<Schedule>(`/schedules/${id}`, data),

  delete: (id: number) => apiClient.delete<void>(`/schedules/${id}`),
};