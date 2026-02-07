import { apiClient, buildQuery } from "./client";
import type { Attendance, CreateAttendanceDto } from "./types";

export const attendanceApi = {
  getAll: (params: { student_id?: number; subject_name?: string }) => 
    apiClient.get<Attendance[]>(`/attendance${buildQuery(params)}`),

  create: (data: CreateAttendanceDto) =>
    apiClient.post<Attendance>("/attendance", data),

  update: (id: number, data: Partial<CreateAttendanceDto>) =>
    apiClient.patch<Attendance>(`/attendance/${id}`, data),

  delete: (id: number) => apiClient.delete<void>(`/api/attendance/${id}`),
};